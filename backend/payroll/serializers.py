from rest_framework import serializers

from .models import Payroll, Salary


class SalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)

    class Meta:
        model = Salary
        fields = (
            "id", "employee", "employee_name", "employee_code", "basic_salary",
            "allowances", "deductions", "effective_from",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        for field in ("basic_salary", "allowances", "deductions"):
            if field in attrs and attrs[field] < 0:
                raise serializers.ValidationError({field: "Value cannot be negative."})
        return attrs


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)

    class Meta:
        model = Payroll
        fields = (
            "id", "employee", "employee_name", "employee_code", "salary", "payroll_month",
            "gross_salary", "total_deductions", "net_salary", "payment_status",
            "payment_date", "created_at",
        )
        read_only_fields = (
            "id", "salary", "gross_salary", "total_deductions", "net_salary",
            "created_at",
        )
