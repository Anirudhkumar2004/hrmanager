from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from employees.models import Employee
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ("get", "post", "head", "options")

    def get_queryset(self):
        queryset = LeaveRequest.objects.select_related("employee", "employee__department", "employee__user", "approved_by")
        user = self.request.user

        if user.role == "EMPLOYEE":
            queryset = queryset.filter(employee__user=user)
        elif user.role == "DEPARTMENT_MANAGER":
            profile = Employee.objects.filter(user=user).select_related("department").first()
            if profile:
                queryset = queryset.filter(employee__department=profile.department)
            else:
                queryset = queryset.none()

        leave_status = self.request.query_params.get("status")
        leave_type = self.request.query_params.get("leave_type")
        if leave_status:
            queryset = queryset.filter(status=leave_status)
        if leave_type:
            queryset = queryset.filter(leave_type=leave_type)
        return queryset

    def perform_create(self, serializer):
        profile = Employee.objects.filter(user=self.request.user, employment_status=Employee.EmploymentStatus.ACTIVE).first()
        if not profile:
            raise ValueError("No active employee profile is linked to this account.")
        leave = serializer.save(employee=profile)
        leave.total_days = leave.calculate_total_days()
        leave.save(update_fields=("total_days",))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(self.get_serializer(serializer.instance).data, status=status.HTTP_201_CREATED)

    def can_manage(self, user):
        return user.role in ("ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER")

    def ensure_department_manager_permission(self, request, leave):
        if request.user.role != "DEPARTMENT_MANAGER":
            return None
        profile = Employee.objects.filter(user=request.user).select_related("department").first()
        if not profile or leave.employee.department_id != profile.department_id:
            return Response({"detail": "You cannot manage leave outside your department."}, status=status.HTTP_403_FORBIDDEN)
        return None

    @transaction.atomic
    @action(detail=True, methods=("post",), url_path="approve")
    def approve(self, request, pk=None):
        if not self.can_manage(request.user):
            return Response({"detail": "You are not allowed to approve leave requests."}, status=status.HTTP_403_FORBIDDEN)

        leave = LeaveRequest.objects.select_for_update().select_related("employee", "employee__department").filter(pk=pk).first()
        if not leave:
            return Response({"detail": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)
        permission_error = self.ensure_department_manager_permission(request, leave)
        if permission_error:
            return permission_error
        if leave.status != LeaveRequest.Status.PENDING:
            return Response({"detail": "Only pending leave requests can be approved."}, status=status.HTTP_400_BAD_REQUEST)

        overlap = LeaveRequest.objects.filter(employee=leave.employee, status=LeaveRequest.Status.APPROVED).filter(
            Q(start_date__lte=leave.end_date) & Q(end_date__gte=leave.start_date)
        ).exclude(pk=leave.pk).exists()
        if overlap:
            return Response({"detail": "This leave overlaps an already approved leave request."}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = LeaveRequest.Status.APPROVED
        leave.approved_by = request.user
        leave.rejection_comments = ""
        leave.save(update_fields=("status", "approved_by", "rejection_comments"))
        return Response(self.get_serializer(leave).data)

    @transaction.atomic
    @action(detail=True, methods=("post",), url_path="reject")
    def reject(self, request, pk=None):
        if not self.can_manage(request.user):
            return Response({"detail": "You are not allowed to reject leave requests."}, status=status.HTTP_403_FORBIDDEN)

        leave = LeaveRequest.objects.select_for_update().select_related("employee", "employee__department").filter(pk=pk).first()
        if not leave:
            return Response({"detail": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)
        permission_error = self.ensure_department_manager_permission(request, leave)
        if permission_error:
            return permission_error
        if leave.status != LeaveRequest.Status.PENDING:
            return Response({"detail": "Only pending leave requests can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = LeaveRequest.Status.REJECTED
        leave.approved_by = request.user
        leave.rejection_comments = request.data.get("rejection_comments", "").strip()
        leave.save(update_fields=("status", "approved_by", "rejection_comments"))
        return Response(self.get_serializer(leave).data)

    @action(detail=False, methods=("get",), url_path="balance")
    def balance(self, request):
        profile = Employee.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "No employee profile is linked to this account."}, status=status.HTTP_404_NOT_FOUND)

        annual_allowances = {"CASUAL": 12, "SICK": 10, "EARNED": 15}
        approved = LeaveRequest.objects.filter(employee=profile, status=LeaveRequest.Status.APPROVED)
        balances = {}
        for leave_type, allowance in annual_allowances.items():
            used = sum(record.total_days for record in approved.filter(leave_type=leave_type))
            balances[leave_type] = {"allowance": allowance, "used": used, "remaining": max(allowance - used, 0)}
        return Response(balances)
