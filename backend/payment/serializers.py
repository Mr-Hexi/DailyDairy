from rest_framework import serializers
import uuid
from .models import Payment
from subscription.models import Subscription
from subscription.utils import estimate_subscription_amount
from .gateway import MockPaymentGateway

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['customer', 'transaction_id', 'payment_status', 'payment_date']

class PaymentProcessSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    gateway_scenario = serializers.ChoiceField(
        choices=[
            (MockPaymentGateway.SCENARIO_SUCCESS, 'Success'),
            (MockPaymentGateway.SCENARIO_FAILURE, 'Failure'),
            (MockPaymentGateway.SCENARIO_PENDING, 'Pending'),
        ],
        required=False,
        default=MockPaymentGateway.SCENARIO_SUCCESS,
        write_only=True
    )

    def validate(self, attrs):
        request = self.context.get('request')
        subscription = Subscription.objects.filter(
            id=attrs['subscription_id'],
            customer=request.user,
            status='active',
        ).select_related('product').first()

        if not subscription:
            raise serializers.ValidationError({'subscription_id': 'Active subscription not found for this user.'})

        attrs['subscription'] = subscription
        return attrs

    def save(self, customer):
        subscription = self.validated_data['subscription']
        amount = estimate_subscription_amount(
            subscription.product.price,
            subscription.quantity,
            subscription.start_date,
            subscription.end_date,
            subscription.delivery_frequency,
        )
        gateway_response = MockPaymentGateway.charge(
            amount=amount,
            payment_method=self.validated_data['payment_method'],
            scenario=self.validated_data.get('gateway_scenario', MockPaymentGateway.SCENARIO_SUCCESS),
        )

        if gateway_response['gateway_status'] == MockPaymentGateway.STATUS_SUCCESS:
            payment_status = 'completed'
            subscription.status = 'active'
        elif gateway_response['gateway_status'] == MockPaymentGateway.STATUS_PENDING:
            payment_status = 'pending'
            subscription.status = 'paused'
        else:
            payment_status = 'failed'
            subscription.status = 'cancelled'

        subscription.save(update_fields=['status'])
        
        payment = Payment.objects.create(
            customer=customer,
            subscription=subscription,
            amount=amount,
            payment_method=self.validated_data['payment_method'],
            payment_status=payment_status,
            transaction_id=gateway_response['gateway_transaction_id'] or str(uuid.uuid4())
        )
        return payment, gateway_response
