from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase

from employees.models import Department, Employee
from .models import LeaveRequest


class LeaveRequestTests(TestCase):
    def test_leave_duration_is_inclusive(self):
        department = Department.objects.create(name="Finance")
        user = get_user_model().objects.create_user(username="leave.user", password="Test@12345")
        employee = Employee.objects.create(
            user=user,
            employee_code="EMP-LEV01",
            first_name="Leave",
            last_name="User",
            department=department,
            designation="Accountant",
            joining_date="2026-01-01",
        )
        leave = LeaveRequest(
            employee=employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=date(2026, 11, 20),
            end_date=date(2026, 11, 22),
            reason="Personal",
        )
        leave.total_days = leave.calculate_total_days()
        leave.save()
        self.assertEqual(leave.total_days, 3)
        self.assertEqual(leave.status, LeaveRequest.Status.PENDING)
