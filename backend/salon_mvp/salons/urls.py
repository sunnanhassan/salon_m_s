from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalonViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'salons', SalonViewSet, basename='salons')
router.register(r'services', ServiceViewSet, basename='services')

urlpatterns = [
    path('', include(router.urls)),
]
