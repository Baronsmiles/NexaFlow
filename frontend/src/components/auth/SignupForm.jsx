import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { validatePassword } from '../../utils/validatePassword';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';
import { saveAuth } from '../../utils/auth';
import api from '../../utils/api';

const DRAFT_KEY = 'nexaflow_signup_draft';

function SignupForm() {
  const navigate = useNavigate();
  const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isExpired = Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS;

        if (!isExpired) {
          return { name: parsed.name, email: parsed.email, password: '', confirmPassword: '' };
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }

    }
    return { name: '', email: '', password: '', confirmPassword: '' };
  });

  const [errors, setErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typingTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Save a draft (minus password) every time formData changes
  useEffect(() => {
    const draftToSave = {
      name: formData.name,
      email: formData.email,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
  }, [formData]);

  // Clean up any pending timers if the component unmounts mid-wait
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  function runPasswordValidation(value) {
    const errorMessage = validatePassword(value);
    if (errorMessage) {
      setErrors((prev) => ({ ...prev, password: errorMessage }));
      setPasswordSuccess('');
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
      setPasswordSuccess('Great! Your password is Strong');
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setErrors((prev) => ({ ...prev, password: '', confirmPassword: '' }));
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
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
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

    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      const response = await api.post(
        'auth/register',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true
        }
      );

      const { accessToken, user } = response.data;

      saveAuth(accessToken, user);

      // Remove signup draft
      localStorage.removeItem(DRAFT_KEY);

      // Automatically go to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Signup error:', error);

      setFormError(
        error.response?.data?.message ||
        'Something went wrong while creating your account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <form className="signup-form" onSubmit={handleSubmit}>
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
        label="Name"
        name="name"
        type="text"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />

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
        placeholder="Create a password"
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

      <Button type="submit" loading={isSubmitting}>
        sign up
      </Button>
    </form>
  );
}

export default SignupForm;