import API from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const initiatePayment = async (
  propertyId: string,
  type: 'booking' | 'listing',
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    // Create order
    const orderResponse = await API.post('/payments/create-order', {
      propertyId,
      type,
    });
    
    const { orderId, amount, currency, paymentId } = orderResponse.data.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: 'Real Estate Marketplace',
      description: type === 'booking' ? 'Booking Fee (1%)' : 'Listing Fee (1%)',
      order_id: orderId,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await API.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId,
          });

          if (verifyResponse.data.success) {
            onSuccess();
          } else {
            onError('Payment verification failed');
          }
        } catch (error) {
          onError(error);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onError(error);
  }
};