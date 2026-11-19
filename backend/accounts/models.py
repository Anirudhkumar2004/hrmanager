from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        HR_MANAGER = "HR_MANAGER", "HR Manager"
        DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER", "Department Manager"
        EMPLOYEE = "EMPLOYEE", "Employee"

    role = models.CharField(max_length=30, choices=Role.choices, default=Role.EMPLOYEE)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
