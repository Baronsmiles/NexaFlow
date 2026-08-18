import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import Button from '../../components/ui/button';
import Loader from '../../components/ui/loader';
import './PaymentCallback.css';

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasVerified = useRef(false);

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderData, setOrderData] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verifyPayment() {
      const reference = searchParams.get('reference');

      if (!reference) {
        setStatus('error');
        setMessage('Payment reference was not found.');
        return;
      }

      try {
        const response = await api.get(
          `/payments/verify?reference=${encodeURIComponent(reference)}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );

        setStatus('success');
        setMessage('Payment successful!');
        setOrderData(response.data.order);
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Payment verification failed.');
      }
    }

    verifyPayment();
  }, [searchParams, navigate]);

  useEffect(() => {
    if (status !== 'success') return;

    if (redirectCountdown === 0) {
      navigate('/order-history');
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, status, navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('Verifying your payment...');
    hasVerified.current = false;
    window.location.reload();
  };

  return (
    <div className="payment-callback-wrapper">
      <div className="payment-callback-card">
        {status === 'loading' && (
          <div className="callback-content">
            <Loader size="large" />
            <h2>{message}</h2>
            <p className="callback-subtext">Please don't close this page...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-content">
            <div className="callback-icon success">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2>{message}</h2>
            <p className="callback-subtext">Your payment has been verified.</p>

            {orderData && (
              <div className="order-summary">
                <div className="summary-item">
                  <span className="label">Product</span>
                  <span className="value">{orderData.productName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Amount</span>
                  <span className="value">₦{Number(orderData.price).toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Status</span>
                  <span className="status-badge success">{orderData.paymentStatus}</span>
                </div>
              </div>
            )}

            <p className="redirect-text">
              Redirecting to order history in <strong>{redirectCountdown}s</strong>...
            </p>

            <Button onClick={() => navigate('/order-history')}>
              Go to Order History
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-content">
            <div className="callback-icon error">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <h2>{message}</h2>
            <p className="callback-subtext">Something went wrong during verification.</p>

            <div className="error-actions">
              <Button onClick={handleRetry}>
                <i className="fa-solid fa-rotate-right"></i> Try Again
              </Button>
              <button
                type="button"
                className="secondary-link-btn"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCallback;