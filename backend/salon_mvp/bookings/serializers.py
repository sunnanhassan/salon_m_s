from rest_framework import serializers
from .models import Booking
from payments.serializers import PaymentSerializer
from salons.serializers import ServiceSerializer, SalonSerializer
from users.serializers import UserRegisterSerializer


class BookingSerializer(serializers.ModelSerializer):
    customer = UserRegisterSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    salon = SalonSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)  # from payments app via related_name="payment"

    # Write-only fields for creating a booking
    service_id = serializers.IntegerField(write_only=True, required=True)
    salon_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "service",
            "salon",
            "service_id",
            "salon_id",
            "start_time",
            "end_time",
            "status",
            "created_at",
            "payment",
        ]
        read_only_fields = (
            "id",
            "customer",
            "end_time",
            "status",
            "created_at",
            "payment",
        )
