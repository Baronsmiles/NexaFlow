import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { validatePassword } from '../../utils/validatePassword';
import './ResetPassword.css';
import api from '../../utils/api';

function ResetPassword({ email, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typingTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  function runPasswordValidation(value) {
    const errorMessage = validatePassword(value);

    if (errorMessage) {
      setErrors((prev) => ({
        ...prev,
        password: errorMessage
      }));

      setPasswordSuccess('');
    } else {
      setErrors((prev) => ({
        ...prev,
        password: ''
      }));

      setPasswordSuccess(
        'Great! Your password is Strong'
      );
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFormError('');

    if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      setPasswordSuccess('');

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        runPasswordValidation(value);
      }, 2000);
    } else if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  }

  function handlePasswordBlur(event) {
    const value = event.target.value;

    clearTimeout(typingTimeoutRef.current);
    clearTimeout(blurTimeoutRef.current);

    blurTimeoutRef.current = setTimeout(() => {
      runPasswordValidation(value);
    }, 2000);
  }

  function validateForm() {
    const newErrors = {};

    const passwordError = validatePassword(
      formData.password
    );

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Please confirm your password.';
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');

    clearTimeout(typingTimeoutRef.current);
    clearTimeout(blurTimeoutRef.current);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        password: formData.password
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Reset password error:', error);

      setFormError(
        error.response?.data?.message ||
        'Something went wrong while resetting your password.'
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="reset-password">
      <button
        type="button"
        className="back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <h2 className="flow-title">
        Reset password
      </h2>

      <p className="flow-subtitle">
        Create a new password for your account.
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
          label="New password"
          name="password"
          type="password"
          placeholder="Create a new password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handlePasswordBlur}
          error={errors.password}
          success={passwordSuccess}
          required
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          loading={isSubmitting}
        >
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;