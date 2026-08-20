import { useState, useEffect } from 'react';
import Button from '../ui/button';
import Input from '../ui/Input';
import Alert from '../ui/alert';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import api from '../../utils/api';
import { saveAuth } from '../../utils/auth';

const DRAFT_KEY = 'nexaflow_login_draft';

function LoginForm({ onForgotPassword }) {
  const navigate = useNavigate();

  const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isExpired =
          Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS;

        if (!isExpired) {
          return {
            email: parsed.email || '',
            password: ''
          };
        }

        localStorage.removeItem(DRAFT_KEY);
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }

    return {
      email: '',
      password: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draftToSave = {
      email: formData.email,
      savedAt: Date.now()
    };

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(draftToSave)
    );
  }, [formData.email]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
  event.preventDefault();

  setFormError('');

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await api.post(
      '/auth/login',
      {
        email: formData.email,
        password: formData.password
      },
      {
        withCredentials: true
      }
    );

    const { accessToken, user } = response.data;

    // Store the access token
    saveAuth(accessToken, user);

    // Remove login draft
    localStorage.removeItem(DRAFT_KEY);

    // Go to dashboard
    navigate('/dashboard');

  } catch (error) {
    console.error('Login error:', error);

    setFormError(
      error.response?.data?.message ||
      'Something went wrong while logging in.'
    );
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {formError && (
        <Alert
          type="error"
          message={formError}
          dismissible
          duration={4000}
          onClose={() => setFormError('')}
        />
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <div className="forgot-link-container">
        <button
          type="button"
          className="forgot-link"
          onClick={onForgotPassword}
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" loading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}

export default LoginForm;