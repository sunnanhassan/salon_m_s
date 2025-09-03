from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "amount",
            "method",
            "status",
            "created_at",
            "updated_at",
            "booking",
            "customer",
            "salon_owner",
        ]
        read_only_fields = ("id", "created_at", "updated_at", "customer", "salon_owner")
