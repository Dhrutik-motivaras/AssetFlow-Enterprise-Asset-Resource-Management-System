from django.db import models
from apps.organization.models import Department, Employee
from apps.assets.models import Asset


class AuditCycle(models.Model):

    class Status(models.TextChoices):
        PLANNED = "Planned", "Planned"
        ACTIVE = "Active", "Active"
        CLOSED = "Closed", "Closed"

    title = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_cycles"
    )

    location = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    start_date = models.DateField()

    end_date = models.DateField()

    assigned_auditors = models.ManyToManyField(
        Employee,
        related_name="assigned_audits"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED
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
        db_table = "audit_cycles"
        ordering = ["-start_date"]

    def __str__(self):
        return self.title
    






class AuditAsset(models.Model):

    class VerificationStatus(models.TextChoices):
        VERIFIED = "Verified", "Verified"
        MISSING = "Missing", "Missing"
        DAMAGED = "Damaged", "Damaged"

    audit_cycle = models.ForeignKey(
        AuditCycle,
        on_delete=models.CASCADE,
        related_name="audit_assets"
    )

    asset = models.ForeignKey(
        Asset,
        on_delete=models.PROTECT,
        related_name="audit_records"
    )

    verified_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name="verified_assets"
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.VERIFIED
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    verified_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "audit_assets"

        unique_together = ("audit_cycle", "asset")

        ordering = ["asset__asset_tag"]

    def __str__(self):
        return f"{self.audit_cycle.title} - {self.asset.asset_tag}"