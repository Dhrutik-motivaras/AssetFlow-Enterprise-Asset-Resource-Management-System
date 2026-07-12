from django.db import models
from django.contrib.auth.models import User
from apps.assets.models import Asset
from apps.organization.models import Employee, Department
from django.core.exceptions import ValidationError



class AssetAllocation(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        RETURNED = "Returned", "Returned"
        OVERDUE = "Overdue", "Overdue"

    asset = models.ForeignKey(
        Asset,
        on_delete=models.PROTECT,
        related_name="allocations"
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="asset_allocations"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="asset_allocations"
    )

    allocated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="allocated_assets"
    )

    allocated_date = models.DateTimeField(
        auto_now_add=True
    )

    expected_return_date = models.DateField(
        null=True,
        blank=True
    )

    returned_date = models.DateTimeField(
        null=True,
        blank=True
    )

    return_condition = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    check_in_notes = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
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
        db_table = "asset_allocations"
        ordering = ["-allocated_date"]

    def __str__(self):
        if self.employee:
            return f"{self.asset.asset_tag} → {self.employee.user.get_full_name()}"

        return f"{self.asset.asset_tag} → {self.department.name}"
    





class AssetTransferRequest(models.Model):

    class Status(models.TextChoices):
        REQUESTED = "Requested", "Requested"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"
        COMPLETED = "Completed", "Completed"

    allocation = models.ForeignKey(
        AssetAllocation,
        on_delete=models.CASCADE,
        related_name="transfer_requests"
    )

    requested_by = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="requested_transfers"
    )

    to_employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="incoming_transfers"
    )

    to_department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="incoming_transfers"
    )

    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_transfers"
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED
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
        db_table = "asset_transfer_requests"
        ordering = ["-created_at"]

    def clean(self):
        if bool(self.to_employee) == bool(self.to_department):
            raise ValidationError(
                "Transfer must be requested either to an employee or to a department."
            )

    def __str__(self):
        return f"{self.allocation.asset.asset_tag} - {self.status}"