from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase

from attendance.models import Attendance
from employees.models import Department, Employee


class AttendanceModelTests(TestCase):
    def test_duplicate_attendance_per_employee_day_is_blocked(self):
        department = Department.objects.create(name="Operations")
        user = get_user_model().objects.create_user(username="attendance.user", password="Test@12345")
        employee = Employee.objects.create(
            user=user,
            employee_code="EMP-ATT01",
            first_name="Attendance",
            last_name="User",
            department=department,
            designation="Operator",
            joining_date="2026-01-01",
        )
        Attendance.objects.create(employee=employee, attendance_date="2026-11-18")
        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                Attendance.objects.create(employee=employee, attendance_date="2026-11-18")
