# salon_mvp/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),       # Users / auth
    path('api/salons/', include('salons.urls')),    # Salon endpoints
    path('api/bookings/', include('bookings.urls')), # Booking endpoints
    path('api/', include('payments.urls')),

]
