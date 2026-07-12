from django.db import models
from apps.organization.models import Employee


class ActivityLog(models.Model):

    class Action(models.TextChoices):
        LOGIN = "Login", "Login"
        LOGOUT = "Logout", "Logout"

        CREATE = "Create", "Create"
        UPDATE = "Update", "Update"
        DELETE = "Delete", "Delete"

        ASSET_ALLOCATED = "Asset Allocated", "Asset Allocated"
        ASSET_RETURNED = "Asset Returned", "Asset Returned"

        TRANSFER_REQUESTED = "Transfer Requested", "Transfer Requested"
        TRANSFER_APPROVED = "Transfer Approved", "Transfer Approved"

        BOOKING_CREATED = "Booking Created", "Booking Created"
        BOOKING_CANCELLED = "Booking Cancelled", "Booking Cancelled"

        MAINTENANCE_REQUESTED = "Maintenance Requested", "Maintenance Requested"
        MAINTENANCE_APPROVED = "Maintenance Approved", "Maintenance Approved"

        AUDIT_CREATED = "Audit Created", "Audit Created"
        AUDIT_COMPLETED = "Audit Completed", "Audit Completed"

        ROLE_CHANGED = "Role Changed", "Role Changed"

    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name="activity_logs"
    )

    action = models.CharField(
        max_length=50,
        choices=Action.choices
    )

    module = models.CharField(
        max_length=100
    )

    object_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    description = models.TextField()

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "activity_logs"
        ordering = ["-created_at"]

    def __str__(self):
        employee_name = (
            self.employee.user.get_full_name()
            if self.employee
            else "System"
        )
        return f"{employee_name} - {self.action}"