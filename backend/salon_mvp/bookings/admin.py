from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'salon', 'customer', 'start_time', 'end_time', 'status', 'created_at')
    search_fields = ('service__name', 'salon__name', 'customer__username')
    list_filter = ('status',)
    ordering = ('-start_time',)
