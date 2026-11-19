"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from accounts.serializers import CustomTokenObtainPairSerializer


def health(request):
    return JsonResponse({"status": "ok", "service": "HRGenius API"})


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/logout/", TokenBlacklistView.as_view(), name="logout"),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("employees.urls")),
    path("api/", include("attendance.urls")),
    path("api/leaves/", include("leaves.urls")),
    path("api/payroll/", include("payroll.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]
