from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Salon, Service
from .serializers import SalonSerializer, ServiceSerializer

# -------------------------
# Salon CRUD
# -------------------------
class SalonViewSet(viewsets.ModelViewSet):
    serializer_class = SalonSerializer
    queryset = Salon.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != "salon_owner":
            raise PermissionDenied("Only salon owners can create salons")
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "salon_owner":
            # Salon owner sees only their salons
            return Salon.objects.filter(owner=user)
        return Salon.objects.all()  # Customers see all salons

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

# -------------------------
# Service CRUD
# -------------------------
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = Service.objects.all()

        # if salon owner, restrict to own services
        if user.is_authenticated and user.role == "salon_owner":
            qs = qs.filter(salon__owner=user)

        # apply salon query param only for list requests
        if self.action == "list":
            salon_id = self.request.query_params.get("salon")
            if salon_id:
                qs = qs.filter(salon_id=salon_id)
            else:
                qs = qs.none()

        return qs

    def perform_create(self, serializer):
        salon_id = self.request.data.get("salon")
        if not salon_id:
            raise PermissionDenied("Salon ID is required")

        try:
            salon = Salon.objects.get(pk=salon_id)
        except Salon.DoesNotExist:
            raise PermissionDenied("Salon does not exist")

        if salon.owner != self.request.user:
            raise PermissionDenied("You do not own this salon")

        serializer.save(salon=salon)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
