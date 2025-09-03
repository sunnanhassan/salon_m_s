from datetime import timedelta, datetime, time

from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, permissions, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer
from salons.models import Salon, Service
from payments.models import Payment  # <-- import from payments app


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = (
            Booking.objects.select_related("service", "salon", "payment")
            # ^ payment is reverse OneToOne; select_related works for single-valued relations
        )
        if getattr(user, "role", None) == "customer":
            return base.filter(customer=user)
        elif getattr(user, "role", None) == "salon_owner":
            return base.filter(salon__owner=user)
        return base  # superadmin

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) != "customer":
            raise serializers.ValidationError("Only customers can create bookings")

        salon_id = serializer.validated_data.pop("salon_id")
        service_id = serializer.validated_data.pop("service_id")

        try:
            salon = Salon.objects.get(id=salon_id)
        except Salon.DoesNotExist:
            raise serializers.ValidationError("Salon does not exist")

        try:
            service = Service.objects.get(id=service_id, salon=salon)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Service does not exist for this salon")

        start = serializer.validated_data["start_time"]
        end = start + timedelta(minutes=service.duration_minutes)

        with transaction.atomic():
            # lock rows during overlap check
            overlap = (
                Booking.objects.select_for_update()
                .filter(salon=salon, status__in=["pending", "confirmed"])
                .filter(~Q(end_time__lte=start) & ~Q(start_time__gte=end))
            )

            if overlap.exists():
                raise serializers.ValidationError("Time overlaps with another booking")

            booking = serializer.save(
                customer=user,
                salon=salon,
                service=service,
                end_time=end,
                status="confirmed",
            )

            # Auto-create a pending payment record (default COD)
            Payment.objects.create(
                booking=booking,
                customer=user,
                salon_owner=salon.owner,
                amount=service.price,
                method="cod",
                status="pending",
            )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        user = request.user

        if user != booking.customer and user != booking.salon.owner:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        if booking.status == "cancelled":
            return Response(
                {"detail": "Booking already cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = "cancelled"
        booking.save()

        # keep payment consistent
        if hasattr(booking, "payment") and booking.payment.status == "pending":
            booking.payment.status = "failed"
            booking.payment.save(update_fields=["status", "updated_at"])

        return Response({"status": "cancelled"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def availability(self, request):
        salon_id = request.query_params.get("salon_id")
        service_id = request.query_params.get("service_id")
        date_str = request.query_params.get("date")

        if not salon_id or not service_id or not date_str:
            return Response({"detail": "Missing params"}, status=400)

        try:
            salon = Salon.objects.get(pk=salon_id)
            service = Service.objects.get(pk=service_id, salon=salon)
        except (Salon.DoesNotExist, Service.DoesNotExist):
            return Response({"detail": "Invalid salon or service"}, status=400)

        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format"}, status=400)

        # working hours (fallbacks if fields don’t exist)
        open_time = getattr(salon, "open_time", time(10, 0))
        close_time = getattr(salon, "close_time", time(18, 0))
        open_dt = datetime.combine(date, open_time)
        close_dt = datetime.combine(date, close_time)

        # existing bookings for that day
        existing_bookings = Booking.objects.filter(
            salon=salon,
            start_time__date=date,
            status__in=["pending", "confirmed"],
        )

        slots = []
        slot_length = timedelta(minutes=service.duration_minutes)
        current = open_dt

        while current + slot_length <= close_dt:
            slot_start = current
            slot_end = current + slot_length

            overlap = existing_bookings.filter(
                ~Q(end_time__lte=slot_start) & ~Q(start_time__gte=slot_end)
            )

            slots.append(
                {
                    "start": slot_start.isoformat(),
                    "end": slot_end.isoformat(),
                    "available": not overlap.exists(),
                }
            )

            current += slot_length

        return Response(slots)
