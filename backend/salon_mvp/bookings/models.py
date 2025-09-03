from django.db import models
from django.conf import settings
from salons.models import Salon, Service
from datetime import timedelta


class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    salon = models.ForeignKey(
        Salon,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_time"]

    def __str__(self):
        return f"{self.service.name} @ {self.start_time}"

    def save(self, *args, **kwargs):
        # Auto-set end_time if not provided
        if not self.end_time and self.service and self.start_time:
            self.end_time = self.start_time + timedelta(
                minutes=self.service.duration_minutes
            )
        super().save(*args, **kwargs)
