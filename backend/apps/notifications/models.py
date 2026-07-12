from django.db import models
from apps.organization.models import Employee


class Notification(models.Model):

    class Type(models.TextChoices):
        ASSET_ASSIGNED = "Asset Assigned", "Asset Assigned"
        ASSET_RETURNED = "Asset Returned", "Asset Returned"
        TRANSFER_REQUEST = "Transfer Request", "Transfer Request"
        TRANSFER_APPROVED = "Transfer Approved", "Transfer Approved"
        BOOKING_CONFIRMED = "Booking Confirmed", "Booking Confirmed"
        BOOKING_CANCELLED = "Booking Cancelled", "Booking Cancelled"
        BOOKING_REMINDER = "Booking Reminder", "Booking Reminder"
        MAINTENANCE_REQUEST = "Maintenance Request", "Maintenance Request"
        MAINTENANCE_APPROVED = "Maintenance Approved", "Maintenance Approved"
        MAINTENANCE_REJECTED = "Maintenance Rejected", "Maintenance Rejected"
        AUDIT_ASSIGNED = "Audit Assigned", "Audit Assigned"
        AUDIT_DISCREPANCY = "Audit Discrepancy", "Audit Discrepancy"
        OVERDUE_RETURN = "Overdue Return", "Overdue Return"
        GENERAL = "General", "General"

    recipient = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.GENERAL
    )

    title = models.CharField(
        max_length=200
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.user.get_full_name()} - {self.title}"