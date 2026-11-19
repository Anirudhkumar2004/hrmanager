from rest_framework.permissions import BasePermission


class HasAnyRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role in self.allowed_roles
        )


class IsAdmin(HasAnyRole):
    allowed_roles = ("ADMIN",)


class IsAdminOrHR(HasAnyRole):
    allowed_roles = ("ADMIN", "HR_MANAGER")


class IsAdminOrManager(HasAnyRole):
    allowed_roles = ("ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER")
