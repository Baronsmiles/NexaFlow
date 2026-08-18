import { useState } from 'react';
import Button from '../ui/button';
import Input from '../ui/Input';
import Alert from '../ui/alert';
import api from '../../utils/api';
import './ForgotPassword.css';

function ForgotPassword({ onBack, onContinue }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setEmail(event.target.value);
    setError('');
    setFormError('');
  }

  function validateForm() {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      // Move to OTP screen
      if (onContinue) {
        onContinue(email.trim());
      }

    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      setFormError(
        error.response?.data?.message ||
        'Something went wrong. Please try again.'
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="forgot-password">
      <button
        type="button"
        className="back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <h2 className="flow-title">
        Forget password
      </h2>

      <p className="flow-subtitle">
        Enter your email and we'll send you a OTP code to reset your password.
      </p>

      {formError && (
        <Alert
          type="error"
          message={formError}
          dismissible
          onClose={() => setFormError('')}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Email ID"
          value={email}
          onChange={handleChange}
          error={error}
          required
        />

        <div className="forgot-actions">
          <Button
            type="submit"
            loading={isSubmitting}
          >
            Continue reset
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;