from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from bookings.models import Booking
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        booking_id = request.data.get("booking_id")
        method = request.data.get("method", "cod")

        if not booking_id:
            return Response(
                {"detail": "Booking ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if hasattr(booking, "payment"):
            return Response(
                {"detail": "Payment already exists for this booking"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = booking.service.price

        payment = Payment.objects.create(
            booking=booking,
            customer=request.user,
            salon_owner=booking.salon.owner,
            amount=amount,
            method=method,
            status="pending" if method == "cod" else "completed",
        )

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        payment = self.get_object()
        if request.user != payment.salon_owner:
            return Response(
                {"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN
            )

        status_update = request.data.get("status")
        if status_update in ["pending", "completed", "failed"]:
            payment.status = status_update
            payment.save()
            serializer = self.get_serializer(payment)
            return Response(serializer.data)
        return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
