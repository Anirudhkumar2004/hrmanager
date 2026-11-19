from django.db.models import Q
from rest_framework import serializers

from .models import LeaveRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)
    department_name = serializers.CharField(source="employee.department.name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.username", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = (
            "id", "employee", "employee_name", "employee_code", "department_name",
            "leave_type", "start_date", "end_date", "total_days", "reason", "status",
            "approved_by", "approved_by_name", "rejection_comments", "applied_at",
        )
        read_only_fields = (
            "id", "employee", "total_days", "status", "approved_by",
            "approved_by_name", "rejection_comments", "applied_at",
        )

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})
        return attrs
