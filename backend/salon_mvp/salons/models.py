from django.db import models
from django.conf import settings

class Salon(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='salons')
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    lat = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    lng = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_home_service = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.salon.name}"
