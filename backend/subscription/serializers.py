from rest_framework import serializers
from .models import Subscription
from product.serializers import ProductSerializer
from .utils import calculate_delivery_count, estimate_subscription_amount

class SubscriptionSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    estimated_delivery_count = serializers.SerializerMethodField(read_only=True)
    estimated_first_payment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['customer', 'created_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        return attrs

    def get_estimated_delivery_count(self, obj):
        return calculate_delivery_count(obj.start_date, obj.end_date, obj.delivery_frequency)

    def get_estimated_first_payment(self, obj):
        amount = estimate_subscription_amount(
            obj.product.price,
            obj.quantity,
            obj.start_date,
            obj.end_date,
            obj.delivery_frequency,
        )
        return str(amount)

class AdminSubscriptionSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'
