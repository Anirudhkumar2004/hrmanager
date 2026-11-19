from django.db import models

from employees.models import Employee


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LATE = "LATE", "Late"
        HALF_DAY = "HALF_DAY", "Half Day"
        ON_LEAVE = "ON_LEAVE", "On Leave"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance_records")
    attendance_date = models.DateField()
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        ordering = ("-attendance_date", "employee__employee_code")
        constraints = (
            models.UniqueConstraint(fields=("employee", "attendance_date"), name="unique_employee_attendance_day"),
        )

    def __str__(self):
        return f"{self.employee.employee_code} - {self.attendance_date}"
