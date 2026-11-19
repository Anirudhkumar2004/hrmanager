from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)
    department_name = serializers.CharField(source="employee.department.name", read_only=True)

    class Meta:
        model = Attendance
        fields = (
            "id", "employee", "employee_name", "employee_code", "department_name",
            "attendance_date", "check_in", "check_out", "working_hours", "status",
        )
        read_only_fields = ("id", "working_hours", "check_in", "check_out")
