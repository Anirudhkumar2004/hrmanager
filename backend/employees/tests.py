from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Department, Employee


class EmployeeModelTests(TestCase):
    def test_department_assignment_and_employee_code(self):
        department = Department.objects.create(name="Engineering")
        user = get_user_model().objects.create_user(username="test.employee", password="Test@12345")
        employee = Employee.objects.create(
            user=user,
            employee_code="EMP-TEST01",
            first_name="Test",
            last_name="Employee",
            department=department,
            designation="Engineer",
            joining_date="2026-01-01",
        )
        self.assertEqual(employee.department, department)
        self.assertEqual(department.employees.count(), 1)
        self.assertEqual(str(employee), "EMP-TEST01 - Test Employee")
