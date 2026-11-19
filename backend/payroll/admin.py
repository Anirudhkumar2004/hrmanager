from django.contrib import admin

from .models import Payroll, Salary


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ("employee", "basic_salary", "allowances", "deductions", "effective_from")
    list_filter = ("effective_from",)


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ("employee", "payroll_month", "gross_salary", "net_salary", "payment_status")
    list_filter = ("payment_status", "payroll_month")
