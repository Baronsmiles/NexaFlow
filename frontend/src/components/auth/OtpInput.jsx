import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../utils/api';
import './OtpInput.css';

function OtpInput({ email, onBack, onContinue }) {
  const OTP_LENGTH = 5;
  const RESEND_COOLDOWN = 60;

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill('')
  );

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  function handleChange(index, event) {
    const value = event.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError('');
    setFormError('');

    if (
      value &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const newOtp = Array(OTP_LENGTH).fill('');

    pastedValue
      .split('')
      .forEach((digit, index) => {
        newOtp[index] = digit;
      });

    setOtp(newOtp);
    setError('');
    setFormError('');

    const nextIndex = Math.min(
      pastedValue.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[nextIndex]?.focus();
  }

  function validateOtp() {
    if (otp.some((digit) => !digit)) {
      setError('Please enter the complete OTP.');
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');

    if (!validateOtp()) {
      return;
    }

    const otpValue = otp.join('');

    try {
      setIsSubmitting(true);

      await api.post('/auth/verify-reset-otp', {
        email,
        otp: otpValue
      });

      // OTP verified successfully
      if (onContinue) {
        onContinue();
      }

    } catch (error) {
      console.error(
        'OTP verification error:',
        error
      );

      setFormError(
        error.response?.data?.message ||
        'OTP verification failed.'
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || isResending) {
      return;
    }

    try {
      setFormError('');
      setIsResending(true);

      await api.post('/auth/forgot-password', {
        email
      });

      // Clear old OTP
      setOtp(
        Array(OTP_LENGTH).fill('')
      );

      // Start 60-second cooldown
      setResendTimer(RESEND_COOLDOWN);

      // Focus first input
      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error(
        'Resend OTP error:',
        error
      );

      setFormError(
        error.response?.data?.message ||
        'Unable to resend OTP. Please try again.'
      );

    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="otp-flow">

      <div className="otp-header">

        <button
          type="button"
          className="back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <h2 className="flow-title">
          Enter OTP
        </h2>

        <p className="flow-subtitle">
          Enter the 5-digit verification code sent to your email address
        </p>

      </div>

      {formError && (
        <Alert
          type="error"
          message={formError}
          dismissible
          onClose={() => setFormError('')}
        />
      )}

      <form onSubmit={handleSubmit}>

        <div className="otp-email">

          <div
            className={`otp-container ${
              error ? 'error' : ''
            }`}
            onPaste={handlePaste}
          >

            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(event) =>
                  handleChange(index, event)
                }
                onKeyDown={(event) =>
                  handleKeyDown(index, event)
                }
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}

          </div>

          {error && (
            <span className="error-text">
              {error}
            </span>
          )}

        </div>

        <Button
          type="submit"
          loading={isSubmitting}
        >
          Continue
        </Button>

      </form>

      <div className="resend-text">

        Didn't you receive any code?

        {resendTimer > 0 ? (
          <span className="resend-countdown">
            Resend OTP in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            className="resend-link"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending
              ? 'Resending...'
              : 'Resend OTP'}
          </button>
        )}

      </div>

    </div>
  );
}

export default OtpInput;
