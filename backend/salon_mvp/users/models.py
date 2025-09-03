from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer','Customer'),
        ('salon_owner','SalonOwner'),
        ('superadmin','SuperAdmin'),
    )
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
