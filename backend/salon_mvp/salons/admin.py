from django.contrib import admin
from .models import Salon, Service

@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'address', 'open_time', 'close_time', 'created_at')
    search_fields = ('name', 'owner__username', 'address')
    list_filter = ('open_time', 'close_time')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'salon', 'duration_minutes', 'price', 'is_home_service', 'created_at')
    search_fields = ('name', 'salon__name')
    list_filter = ('is_home_service',)
