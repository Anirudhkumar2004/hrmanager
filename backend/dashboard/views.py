from django.db.models import Count, Sum
from django.shortcuts import render
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.models import Attendance
from employees.models import Department, Employee
from leaves.models import LeaveRequest
from payroll.models import Payroll


class DashboardSummaryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        month_start = today.replace(day=1)

        if user.role in ("ADMIN", "HR_MANAGER"):
            departments = list(Department.objects.annotate(employee_count=Count("employees")).values("name", "employee_count"))
            return Response({
                "scope": "organization",
                "total_employees": Employee.objects.count(),
                "active_employees": Employee.objects.filter(employment_status=Employee.EmploymentStatus.ACTIVE).count(),
                "total_departments": Department.objects.count(),
                "today_attendance": Attendance.objects.filter(attendance_date=today).count(),
                "pending_leaves": LeaveRequest.objects.filter(status=LeaveRequest.Status.PENDING).count(),
                "monthly_payroll": Payroll.objects.filter(payroll_month=month_start).aggregate(total=Sum("net_salary"))["total"] or 0,
                "employees_by_department": departments,
            })

        if user.role == "DEPARTMENT_MANAGER":
            profile = Employee.objects.filter(user=user).select_related("department").first()
            if not profile:
                return Response({"scope": "department", "department_name": None, "department_employee_count": 0, "today_attendance": 0, "pending_leaves": 0})
            department = profile.department
            team = Employee.objects.filter(department=department)
            team_ids = team.values_list("id", flat=True)
            return Response({
                "scope": "department",
                "department_name": department.name,
                "department_employee_count": team.count(),
                "today_attendance": Attendance.objects.filter(employee_id__in=team_ids, attendance_date=today).count(),
                "pending_leaves": LeaveRequest.objects.filter(employee__department=department, status=LeaveRequest.Status.PENDING).count(),
            })

        profile = Employee.objects.filter(user=user).select_related("department").first()
        if not profile:
            return Response({"scope": "employee", "personal_info": None, "today_attendance": None, "attendance_summary": {}, "leave_balance": {}, "recent_leaves": [], "latest_payroll": None})

        monthly_attendance = Attendance.objects.filter(employee=profile, attendance_date__year=today.year, attendance_date__month=today.month)
        attendance_summary = list(monthly_attendance.values("status").annotate(count=Count("id")))
        approved = LeaveRequest.objects.filter(employee=profile, status=LeaveRequest.Status.APPROVED)
        allowances = {"CASUAL": 12, "SICK": 10, "EARNED": 15}
        leave_balance = {}
        for leave_type, allowance in allowances.items():
            used = sum(record.total_days for record in approved.filter(leave_type=leave_type))
            leave_balance[leave_type] = {"allowance": allowance, "used": used, "remaining": max(allowance - used, 0)}

        recent_leaves = list(LeaveRequest.objects.filter(employee=profile).values("id", "leave_type", "start_date", "end_date", "total_days", "status")[:5])
        latest_payroll = Payroll.objects.filter(employee=profile).order_by("-payroll_month").first()

        return Response({
            "scope": "employee",
            "personal_info": {
                "employee_code": profile.employee_code,
                "name": profile.full_name,
                "department": profile.department.name,
                "designation": profile.designation,
                "employment_status": profile.employment_status,
            },
            "today_attendance": Attendance.objects.filter(employee=profile, attendance_date=today).values("check_in", "check_out", "working_hours", "status").first(),
            "attendance_summary": attendance_summary,
            "leave_balance": leave_balance,
            "recent_leaves": recent_leaves,
            "latest_payroll": {
                "payroll_month": latest_payroll.payroll_month,
                "gross_salary": latest_payroll.gross_salary,
                "net_salary": latest_payroll.net_salary,
                "payment_status": latest_payroll.payment_status,
            } if latest_payroll else None,
        })

# Create your views here.
