from decimal import Decimal
from datetime import time

from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = Attendance.objects.select_related("employee", "employee__department", "employee__user")
        user = self.request.user

        if user.role == "EMPLOYEE":
            queryset = queryset.filter(employee__user=user)
        elif user.role == "DEPARTMENT_MANAGER":
            manager_profile = Employee.objects.filter(user=user).select_related("department").first()
            if manager_profile:
                queryset = queryset.filter(employee__department=manager_profile.department)
            else:
                queryset = queryset.none()

        date = self.request.query_params.get("date")
        month = self.request.query_params.get("month")
        employee = self.request.query_params.get("employee")
        if date:
            queryset = queryset.filter(attendance_date=date)
        if month:
            queryset = queryset.filter(attendance_date__startswith=month)
        if employee:
            queryset = queryset.filter(employee_id=employee)
        return queryset

    def get_employee_profile(self, user):
        return Employee.objects.filter(user=user, employment_status=Employee.EmploymentStatus.ACTIVE).first()

    @action(detail=False, methods=("get",), url_path="today")
    def today(self, request):
        profile = self.get_employee_profile(request.user)
        if not profile:
            return Response({"detail": "No active employee profile is linked to this account."}, status=status.HTTP_404_NOT_FOUND)
        attendance = Attendance.objects.filter(employee=profile, attendance_date=timezone.localdate()).first()
        return Response(self.get_serializer(attendance).data if attendance else {"checked_in": False})

    @action(detail=False, methods=("post",), url_path="check-in")
    @transaction.atomic
    def check_in(self, request):
        profile = self.get_employee_profile(request.user)
        if not profile:
            return Response({"detail": "No active employee profile is linked to this account."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        attendance = Attendance.objects.select_for_update().filter(employee=profile, attendance_date=today).first()
        if attendance:
            return Response({"detail": "You have already checked in today."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.localtime()
        late_cutoff = time(hour=9, minute=0)  # 09:00 AM cutoff
        attendance_status = Attendance.Status.LATE if now.time() >= late_cutoff else Attendance.Status.PRESENT
        attendance = Attendance.objects.create(employee=profile, attendance_date=today, check_in=now, status=attendance_status)
        return Response(self.get_serializer(attendance).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=("post",), url_path="check-out")
    @transaction.atomic
    def check_out(self, request):
        profile = self.get_employee_profile(request.user)
        if not profile:
            return Response({"detail": "No active employee profile is linked to this account."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        attendance = Attendance.objects.select_for_update().filter(employee=profile, attendance_date=today).first()
        if not attendance:
            return Response({"detail": "Please check in before checking out."}, status=status.HTTP_400_BAD_REQUEST)
        if attendance.check_out:
            return Response({"detail": "You have already checked out today."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.localtime()
        if now <= attendance.check_in:
            return Response({"detail": "Check-out time must be after check-in time."}, status=status.HTTP_400_BAD_REQUEST)

        elapsed = now - attendance.check_in
        hours = Decimal(str(round(elapsed.total_seconds() / 3600, 2)))
        attendance.check_out = now
        attendance.working_hours = hours
        if hours < 4:
            attendance.status = Attendance.Status.HALF_DAY
        elif attendance.status == Attendance.Status.LATE:
            attendance.status = Attendance.Status.LATE
        else:
            attendance.status = Attendance.Status.PRESENT
        attendance.save(update_fields=("check_out", "working_hours", "status"))
        return Response(self.get_serializer(attendance).data)
