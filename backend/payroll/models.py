from django.db import models

from employees.models import Employee


class Salary(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="salary_history")
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    effective_from = models.DateField()

    class Meta:
        ordering = ("-effective_from",)

    def __str__(self):
        return f"{self.employee.employee_code} - {self.effective_from}"


class Payroll(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="payroll_records")
    salary = models.ForeignKey(Salary, on_delete=models.PROTECT, related_name="payroll_records")
    payroll_month = models.DateField()
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-payroll_month", "employee__employee_code")
        constraints = (
            models.UniqueConstraint(fields=("employee", "payroll_month"), name="unique_employee_payroll_month"),
        )

    def __str__(self):
        return f"{self.employee.employee_code} - {self.payroll_month}"
