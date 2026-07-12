from django.db import models
from apps.assets.models import Asset
from apps.organization.models import Employee


class ResourceBooking(models.Model):

    class Status(models.TextChoices):
        UPCOMING = "Upcoming", "Upcoming"
        ONGOING = "Ongoing", "Ongoing"
        COMPLETED = "Completed", "Completed"
        CANCELLED = "Cancelled", "Cancelled"

    asset = models.ForeignKey(
        Asset,
        on_delete=models.PROTECT,
        related_name="bookings"
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    title = models.CharField(
        max_length=150
    )

    purpose = models.TextField(
        blank=True,
        null=True
    )

    booking_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPCOMING
    )

    cancelled_reason = models.TextField(
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
        db_table = "resource_bookings"
        ordering = [
            "booking_date",
            "start_time"
        ]

    def __str__(self):
        return f"{self.asset.asset_tag} | {self.booking_date} | {self.start_time}"
    
