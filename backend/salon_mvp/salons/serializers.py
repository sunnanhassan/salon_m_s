from rest_framework import serializers
from .models import Salon, Service

class SalonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ('salon', 'created_at')
