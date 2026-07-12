from django.db import models
from django.contrib.auth.models import User
from apps.assets.models import Asset
from apps.organization.models import Employee


class MaintenanceRequest(models.Model):

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        CRITICAL = "Critical", "Critical"

    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"
        ASSIGNED = "Technician Assigned", "Technician Assigned"
        IN_PROGRESS = "In Progress", "In Progress"
        RESOLVED = "Resolved", "Resolved"

    asset = models.ForeignKey(
        Asset,
        on_delete=models.PROTECT,
        related_name="maintenance_requests"
    )

    raised_by = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="raised_maintenance_requests"
    )

    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_maintenance_requests"
    )

    technician_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    issue_title = models.CharField(
        max_length=200
    )

    issue_description = models.TextField()

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    attachment = models.FileField(
        upload_to="maintenance/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.PENDING
    )

    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    actual_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    requested_at = models.DateTimeField(
        auto_now_add=True
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "maintenance_requests"
        ordering = ["-requested_at"]

    def __str__(self):
        return f"{self.asset.asset_tag} - {self.issue_title}"