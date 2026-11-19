from django.contrib import admin

from .models import LeaveRequest


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "total_days", "status")
    list_filter = ("leave_type", "status", "employee__department")
    search_fields = ("employee__employee_code", "employee__first_name", "employee__last_name")
