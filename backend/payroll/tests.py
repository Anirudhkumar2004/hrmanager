from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from employees.models import Department, Employee
from .models import Salary


class SalaryTests(TestCase):
    def test_salary_values_are_stored_as_decimals(self):
        department = Department.objects.create(name="Sales")
        user = get_user_model().objects.create_user(username="payroll.user", password="Test@12345")
        employee = Employee.objects.create(
            user=user,
            employee_code="EMP-PAY01",
            first_name="Payroll",
            last_name="User",
            department=department,
            designation="Sales Executive",
            joining_date="2026-01-01",
        )
        salary = Salary.objects.create(
            employee=employee,
            basic_salary=Decimal("50000.00"),
            allowances=Decimal("7500.00"),
            deductions=Decimal("3500.00"),
            effective_from="2026-01-01",
        )
        self.assertEqual(salary.basic_salary + salary.allowances - salary.deductions, Decimal("54000.00"))
