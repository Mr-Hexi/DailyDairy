import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';

const addMonthsClamped = (date, months = 1) => {
    const year = date.getFullYear();
    const month = date.getMonth() + months;
    const day = date.getDate();

    const firstOfTarget = new Date(year, month, 1);
    const lastDay = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
    return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), Math.min(day, lastDay));
};

const calculateDeliveryCount = (startDateStr, endDateStr, frequency) => {
    if (!startDateStr) return 0;

    const startDate = new Date(`${startDateStr}T00:00:00`);
    const endDate = endDateStr ? new Date(`${endDateStr}T00:00:00`) : null;

    if (!endDate) return 1;
    if (endDate < startDate) return 0;

    let count = 0;
    let current = new Date(startDate);

    if (frequency === 'monthly') {
        while (current <= endDate) {
            count += 1;
            current = addMonthsClamped(current, 1);
        }
        return count;
    }

    const stepDays = frequency === 'alternate_days' ? 2 : frequency === 'weekly' ? 7 : 1;
    while (current <= endDate) {
        count += 1;
        current.setDate(current.getDate() + stepDays);
    }

    return count;
};

const Cart = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { subscriptionData, product } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [gatewayScenario, setGatewayScenario] = useState('success');

    if (!subscriptionData || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 mt-4 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    const deliveryCount = calculateDeliveryCount(
        subscriptionData.start_date,
        subscriptionData.end_date,
        subscriptionData.delivery_frequency
    );
    const estimatedTotal = (Number(product.price) * Number(subscriptionData.quantity) * deliveryCount).toFixed(2);

    const handleConfirmOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create Subscription
            const subRes = await axiosInstance.post('subscription/', subscriptionData);

            // 2. Process Mock Payment for the first delivery / subscription cycle
            const paymentRes = await axiosInstance.post('payment/process/', {
                subscription_id: subRes.data.id,
                payment_method: paymentMethod,
                gateway_scenario: gatewayScenario
            });

            const paymentStatus = paymentRes.data?.data?.payment_status;
            if (paymentStatus === 'completed') {
                navigate('/profile', { state: { message: 'Subscription confirmed successfully!' } });
                return;
            }

            if (paymentStatus === 'pending') {
                navigate('/profile', { state: { message: 'Payment is pending. Subscription is paused until payment is completed.' } });
                return;
            }

            setError('Payment failed. Subscription was not activated.');
        } catch (err) {
            console.error("Order error", err);
            setError("Failed to process order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container max-w-4xl px-4 py-16 mx-auto">
                <h1 className="mb-8 text-4xl font-extrabold text-slate-900 tracking-tight">Review Your Subscription</h1>

                <div className="p-8 md:p-12 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    {error && <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-100 rounded-xl font-medium">{error}</div>}

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-slate-100 pb-10 mb-10">
                        {product.image ? (
                            <img src={`${import.meta.env.VITE_MEDIA_URL}${product.image}`} alt={product.name} className="object-cover w-32 h-32 rounded-2xl shadow-sm" />
                        ) : (
                            <div className="flex items-center justify-center w-32 h-32 bg-slate-100 rounded-2xl text-slate-400 font-medium">No Image</div>
                        )}
                        <div className="text-center sm:text-left mt-2 sm:mt-0">
                            <h2 className="text-2xl font-bold text-slate-800">{product.name}</h2>
                            <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm">₹{product.price} / unit</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</span>
                            <span className="text-lg font-black text-slate-800">{subscriptionData.quantity} units</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency</span>
                            <span className="text-lg font-black text-slate-800 capitalize">{subscriptionData.delivery_frequency.replace('_', ' ')}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</span>
                            <span className="text-lg font-black text-slate-800">{subscriptionData.start_date}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</span>
                            <span className="text-lg font-black text-slate-800">{subscriptionData.end_date || 'Ongoing'}</span>
                        </div>
                    </div>

                    <div className="mb-6 text-sm font-semibold text-slate-500">
                        Billing for {deliveryCount} delivery{deliveryCount !== 1 ? 'ies' : 'y'} in the selected range.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="card">Credit / Debit Card</option>
                                <option value="upi">UPI</option>
                                <option value="netbanking">Net Banking</option>
                                <option value="cash">Cash on Delivery</option>
                            </select>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Mock Gateway Mode</label>
                            <select
                                value={gatewayScenario}
                                onChange={(e) => setGatewayScenario(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failure">Failure</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-blue-50 border border-blue-100 rounded-2xl mb-10 gap-4">
                        <span className="text-xl font-bold text-blue-900">Estimated First Payment</span>
                        <span className="text-4xl font-black text-blue-700 tracking-tight">₹{estimatedTotal}</span>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-100 pt-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 font-bold text-slate-600 transition-all bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300"
                            disabled={loading}
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleConfirmOrder}
                            className="px-10 py-4 font-bold text-white transition-all bg-green-500 rounded-xl hover:bg-green-600 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200 active:scale-95"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm & Pay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
