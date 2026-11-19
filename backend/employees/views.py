from django.db.models import Count, ProtectedError, Q
from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminOrHR, IsAdminOrManager
from .models import Department, Employee
from .serializers import DepartmentSerializer, EmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.annotate(employee_count=Count("employees")).all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return (IsAuthenticated(),)
        return (IsAdminOrHR(),)

    def destroy(self, request, *args, **kwargs):
        department = self.get_object()
        if department.employees.exists():
            return Response(
                {"detail": "A department cannot be deleted while employees are assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "department").all()
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "me"):
            return (IsAuthenticated(),)
        return (IsAdminOrHR(),)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == "DEPARTMENT_MANAGER":
            manager_employee = Employee.objects.filter(user=user).select_related("department").first()
            if manager_employee:
                queryset = queryset.filter(department=manager_employee.department)
            else:
                queryset = queryset.none()
        elif user.role == "EMPLOYEE":
            queryset = queryset.filter(user=user)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(employee_code__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(designation__icontains=search)
                | Q(user__email__icontains=search)
            )

        department = self.request.query_params.get("department")
        if department:
            queryset = queryset.filter(department_id=department)

        employment_status = self.request.query_params.get("employment_status")
        if employment_status:
            queryset = queryset.filter(employment_status=employment_status)

        return queryset

    @action(detail=False, methods=("get",), url_path="me")
    def me(self, request):
        employee = Employee.objects.select_related("department", "user").filter(user=request.user).first()
        if not employee:
            return Response({"detail": "No employee profile is linked to this account."}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(employee).data)

    def perform_destroy(self, instance):
        instance.employment_status = Employee.EmploymentStatus.INACTIVE
        instance.user.is_active = False
        instance.user.save(update_fields=("is_active",))
        instance.save(update_fields=("employment_status",))


# Create your views here.
