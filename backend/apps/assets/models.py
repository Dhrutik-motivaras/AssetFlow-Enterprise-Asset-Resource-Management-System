from django.db import models
from apps.organization.models import Department
from django.contrib.auth.models import User


class AssetCategory(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    name = models.CharField(
        max_length=100,
        unique=True
    )

    code = models.CharField(
        max_length=20,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    warranty_period_months = models.PositiveIntegerField(
        default=0,
        help_text="Default warranty period in months"
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "asset_categories"
        ordering = ["name"]
        verbose_name = "Asset Category"
        verbose_name_plural = "Asset Categories"

    def __str__(self):
        return self.name
    



class Asset(models.Model):

    class Status(models.TextChoices):
        AVAILABLE = "Available", "Available"
        ALLOCATED = "Allocated", "Allocated"
        RESERVED = "Reserved", "Reserved"
        UNDER_MAINTENANCE = "Under Maintenance", "Under Maintenance"
        LOST = "Lost", "Lost"
        RETIRED = "Retired", "Retired"
        DISPOSED = "Disposed", "Disposed"

    class Condition(models.TextChoices):
        EXCELLENT = "Excellent", "Excellent"
        GOOD = "Good", "Good"
        FAIR = "Fair", "Fair"
        DAMAGED = "Damaged", "Damaged"

    asset_tag = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    name = models.CharField(
        max_length=150
    )

    category = models.ForeignKey(
        AssetCategory,
        on_delete=models.PROTECT,
        related_name="assets"
    )

    serial_number = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True
    )

    acquisition_date = models.DateField()

    acquisition_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    warranty_expiry = models.DateField(
        blank=True,
        null=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets"
    )

    location = models.CharField(
        max_length=150
    )

    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.EXCELLENT
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.AVAILABLE
    )

    is_bookable = models.BooleanField(
        default=False,
        help_text="Can this asset be booked as a shared resource?"
    )

    qr_code = models.CharField(
        max_length=255,
        blank=True,
        null=True
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
        db_table = "assets"
        ordering = ["asset_tag"]

    def save(self, *args, **kwargs):

        if not self.asset_tag:

            last_asset = Asset.objects.order_by("-id").first()

            if last_asset:
                last_id = int(last_asset.asset_tag.split("-")[1])
                self.asset_tag = f"AF-{last_id + 1:04d}"
            else:
                self.asset_tag = "AF-0001"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.asset_tag} - {self.name}"
    



class AssetDocument(models.Model):

    class DocumentType(models.TextChoices):
        IMAGE = "Image", "Image"
        INVOICE = "Invoice", "Invoice"
        WARRANTY = "Warranty", "Warranty"
        MANUAL = "Manual", "Manual"
        OTHER = "Other", "Other"

    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
        default=DocumentType.IMAGE
    )

    title = models.CharField(
        max_length=100
    )

    file = models.FileField(
        upload_to="assets/documents/"
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "asset_documents"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.asset.asset_tag} - {self.title}"