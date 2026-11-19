from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PayrollViewSet, SalaryViewSet

router = DefaultRouter()
router.register("salaries", SalaryViewSet, basename="salary")
router.register("payroll", PayrollViewSet, basename="payroll")

urlpatterns = [
    path("", include(router.urls)),
]
