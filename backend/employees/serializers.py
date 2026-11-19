from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Department, Employee

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ("id", "name", "description", "created_at", "employee_count")
        read_only_fields = ("id", "created_at")

    def get_employee_count(self, obj):
        return obj.employees.count()


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Employee
        fields = (
            "id", "employee_code", "user", "username", "email", "password",
            "first_name", "last_name", "phone", "department", "department_name",
            "designation", "joining_date", "employment_status", "address", "date_of_birth",
        )
        read_only_fields = ("id", "employee_code", "user")

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username is required.")
        if self.instance is None and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and self.instance is None and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if self.instance is None:
            if not attrs.get("username"):
                raise serializers.ValidationError({"username": "Username is required when creating an employee."})
            if not attrs.get("password"):
                raise serializers.ValidationError({"password": "Password is required when creating an employee."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email", "")
        password = validated_data.pop("password")

        last_employee = Employee.objects.select_for_update().order_by("-id").first()
        next_number = (last_employee.id + 1) if last_employee else 1
        employee_code = f"EMP-{next_number:05d}"
        while Employee.objects.filter(employee_code=employee_code).exists():
            next_number += 1
            employee_code = f"EMP-{next_number:05d}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=User.Role.EMPLOYEE,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        return Employee.objects.create(user=user, employee_code=employee_code, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        username = validated_data.pop("username", None)
        email = validated_data.pop("email", None)
        password = validated_data.pop("password", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        user = instance.user
        if username:
            user.username = username
        if email is not None:
            user.email = email
        user.first_name = instance.first_name
        user.last_name = instance.last_name
        if password:
            user.set_password(password)
        user.save()
        instance.save()
        return instance
