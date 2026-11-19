from datetime import date
from decimal import Decimal
from io import BytesIO

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from accounts.permissions import IsAdminOrHR
from employees.models import Employee
from .models import Payroll, Salary
from .serializers import PayrollSerializer, SalarySerializer


class SalaryViewSet(viewsets.ModelViewSet):
    queryset = Salary.objects.select_related("employee").all()
    serializer_class = SalarySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.role not in ("ADMIN", "HR_MANAGER"):
            return self.queryset.filter(employee__user=self.request.user)
        return super().get_queryset()

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return (IsAdminOrHR(),)
        return (IsAuthenticated(),)


class PayrollViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payroll.objects.select_related("employee", "employee__department", "salary").all()
    serializer_class = PayrollSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == "EMPLOYEE":
            queryset = queryset.filter(employee__user=user)
        month = self.request.query_params.get("month")
        if month:
            queryset = queryset.filter(payroll_month=month)
        return queryset

    @transaction.atomic
    @action(detail=False, methods=("post",), url_path="generate")
    def generate(self, request):
        if request.user.role not in ("ADMIN", "HR_MANAGER"):
            return Response({"detail": "Only Admin or HR can generate payroll."}, status=status.HTTP_403_FORBIDDEN)

        month_value = request.data.get("month")
        try:
            payroll_month = date.fromisoformat(month_value)
            payroll_month = payroll_month.replace(day=1)
        except (TypeError, ValueError):
            return Response({"detail": "Provide a valid month in YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)

        employee_id = request.data.get("employee")
        employees = Employee.objects.select_for_update().filter(employment_status=Employee.EmploymentStatus.ACTIVE)
        if employee_id:
            employees = employees.filter(id=employee_id)

        created = 0
        skipped = 0
        for employee in employees:
            if Payroll.objects.filter(employee=employee, payroll_month=payroll_month).exists():
                skipped += 1
                continue
            salary = Salary.objects.filter(employee=employee, effective_from__lte=payroll_month).order_by("-effective_from").first()
            if not salary:
                skipped += 1
                continue

            gross = salary.basic_salary + salary.allowances
            deductions = salary.deductions
            net = max(gross - deductions, Decimal("0.00"))
            Payroll.objects.create(employee=employee, salary=salary, payroll_month=payroll_month, gross_salary=gross, total_deductions=deductions, net_salary=net)
            created += 1

        return Response({"created": created, "skipped": skipped, "payroll_month": payroll_month.isoformat()})

    @transaction.atomic
    @action(detail=True, methods=("post",), url_path="payment-status")
    def payment_status(self, request, pk=None):
        if request.user.role not in ("ADMIN", "HR_MANAGER"):
            return Response({"detail": "Only Admin or HR can update payment status."}, status=status.HTTP_403_FORBIDDEN)

        payroll = self.get_queryset().select_for_update().filter(pk=pk).first()
        if not payroll:
            return Response({"detail": "Payroll record not found."}, status=status.HTTP_404_NOT_FOUND)

        payment_status = request.data.get("payment_status")
        if payment_status not in (Payroll.PaymentStatus.PENDING, Payroll.PaymentStatus.PAID, Payroll.PaymentStatus.CANCELLED):
            return Response({"detail": "Invalid payment status."}, status=status.HTTP_400_BAD_REQUEST)

        payroll.payment_status = payment_status
        payroll.payment_date = timezone.localdate() if payment_status == Payroll.PaymentStatus.PAID else None
        payroll.save(update_fields=("payment_status", "payment_date"))
        return Response(self.get_serializer(payroll).data)

    @action(detail=True, methods=("get",), url_path="payslip")
    def payslip(self, request, pk=None):
        payroll = self.get_queryset().filter(pk=pk).first()
        if not payroll:
            return Response({"detail": "Payroll record not found."}, status=status.HTTP_404_NOT_FOUND)

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        pdf.setTitle(f"Payslip-{payroll.employee.employee_code}-{payroll.payroll_month.strftime('%Y-%m')}")
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(50, height - 60, "HRGenius Payslip")
        pdf.setFont("Helvetica", 11)
        pdf.drawString(50, height - 100, f"Employee: {payroll.employee.full_name}")
        pdf.drawString(50, height - 120, f"Employee Code: {payroll.employee.employee_code}")
        pdf.drawString(50, height - 140, f"Month: {payroll.payroll_month.strftime('%B %Y')}")
        pdf.drawString(50, height - 180, f"Basic Salary: {payroll.salary.basic_salary}")
        pdf.drawString(50, height - 200, f"Allowances: {payroll.salary.allowances}")
        pdf.drawString(50, height - 220, f"Gross Salary: {payroll.gross_salary}")
        pdf.drawString(50, height - 240, f"Total Deductions: {payroll.total_deductions}")
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, height - 280, f"Net Salary: {payroll.net_salary}")
        pdf.drawString(50, height - 320, f"Payment Status: {payroll.payment_status}")
        pdf.save()

        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename=payslip-{payroll.employee.employee_code}-{payroll.payroll_month.strftime('%Y-%m')}.pdf"
        return response
