import { useLocation, useNavigate, } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import SignupForm from '../../components/auth/SignupForm';
import ForgotPassword from '../../components/auth/ForgotPassword';
import OtpInput from '../../components/auth/OtpInput';
import ResetPassword from '../../components/auth/ResetPassword';
import Success from '../../components/auth/Success';
import GoogleButton from '../../components/auth/GoogleButton';
import Alert from '../../components/ui/Alert';
import api from '../../utils/api';
import {
  setAuthFlow,
  getAuthFlow,
  clearAuthFlow,
  startSuccessFlow,
  getSuccessFlow,
  clearSuccessFlow,
  setResetEmail,
  getResetEmail,
  clearResetEmail
} from '../../utils/authFlow';

import './Auth.css';
import { saveAuth } from '../../utils/auth';



function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const successHandledRef = useRef(false);
  const [googleError, setGoogleError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const authFlow = getAuthFlow();

    // OTP
    if (currentPath === '/auth/otp') {
      if (authFlow !== 'otp' && authFlow !== 'reset') {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // RESET PASSWORD
    if (currentPath === '/auth/reset-password') {
      if (authFlow !== 'reset') {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // SUCCESS
    if (currentPath === '/auth/success') {
      if (successHandledRef.current) return;
      const successPending = getSuccessFlow();

      if (successPending !== 'true') {
        navigate('/auth/login', { replace: true });
        return;
      }
      successHandledRef.current = true;
      clearSuccessFlow();
    } else {
      successHandledRef.current = false;
    }

  }, [currentPath, navigate]);

  function handleForgotPassword() {
    navigate('/auth/forgot-password');
  }

  function handleBackToAuth() {
    navigate('/auth/login');
  }

  function handleSignup() {
    navigate('/auth/signup');
  }

  function handleLogin() {
    navigate('/auth/login');
  }

  function handleForgotPasswordContinue(email) {
    setResetEmail(email);
    setAuthFlow('otp');
    navigate('/auth/otp');
  }

  function handleOtpContinue() {
    setAuthFlow('reset');
    navigate('/auth/reset-password');
  }

  function handleResetSuccess() {
    clearAuthFlow();
    clearResetEmail();

    startSuccessFlow();

    navigate('/auth/success');
  }

  function handleSuccessContinue() {
    clearSuccessFlow();
    navigate('/auth/login');
  }

  function handleBackToOtp() {
    navigate('/auth/otp');
  }

  async function handleGoogleSuccess(response) {
    try {
      const googleCredential = response?.credential;

      if (!googleCredential) {
        setGoogleError('Google credential was not received. Please try again.');
        setIsGoogleLoading(false);
        return;
      }

      setGoogleError(null);
      setIsGoogleLoading(true);

      const res = await api.post('/auth/google', {
        credential: googleCredential
      });

      const data = res.data;

      if (!data.success) {
        setGoogleError(data.message || 'Google login failed. Please try again.');
        setIsGoogleLoading(false);
        return;
      }

      saveAuth(data.accessToken, data.user);

      setIsGoogleLoading(false);
      navigate('/dashboard');

    } catch (error) {
      console.error('Google login error:', error);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Google login failed. Please try again.';

      setGoogleError(errorMessage);
      setIsGoogleLoading(false);
    }
  }

  function handleGoogleError(error) {
    console.error('Google login failed:', error);
    setGoogleError('Google login failed. Please try again.');
    setIsGoogleLoading(false);
  }

  /*
   * ==========================================
   * FORGOT PASSWORD
   * ==========================================
   */

  if (currentPath === '/auth/forgot-password') {
    return (
      <div className="auth-page">
        <div className="brand-logo">
          <i className="fa-solid fa-leaf"></i>
          NexaFlow
        </div>

        <div className="auth-card">
          <ForgotPassword
            onBack={handleBackToAuth}
            email={getResetEmail()}
            onContinue={handleForgotPasswordContinue}
          />
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * OTP
   * ==========================================
   */

  if (currentPath === '/auth/otp') {
    return (
      <div className="auth-page">
        <div className="brand-logo">
          <i className="fa-solid fa-leaf"></i>
          NexaFlow
        </div>

        <div className="auth-card">
          <OtpInput
            email={getResetEmail()}
            onBack={handleForgotPassword}
            onContinue={handleOtpContinue}
          />
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * RESET PASSWORD
   * ==========================================
   */

  if (currentPath === '/auth/reset-password') {
    return (
      <div className="auth-page">
        <div className="brand-logo">
          <i className="fa-solid fa-leaf"></i>
          NexaFlow
        </div>

        <div className="auth-card">
          <ResetPassword
            email={getResetEmail()}
            onBack={handleBackToOtp}
            onSuccess={handleResetSuccess}
          />
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * SUCCESS
   * ==========================================
   */

  if (currentPath === '/auth/success') {
    return (
      <div className="auth-page">
        <div className="brand-logo">
          <i className="fa-solid fa-leaf"></i>
          NexaFlow
        </div>

        <div className="auth-card">
          <Success
            title="Success"
            message="Congratulations! Your password has been successfully reset."
            buttonText="Continue"
            onContinue={handleSuccessContinue}
          />
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * LOGIN / SIGNUP
   * ==========================================
   */

  const activeTab = currentPath === '/auth/signup'
    ? 'signup'
    : 'login';

  return (
    <div className="auth-page">

      <div className="brand-logo">
        <i className="fa-solid fa-leaf"></i>
        NexaFlow
      </div>

      <div className="auth-card">

        <div
          className="segmented-tabs"
          data-active={activeTab}
        >

          <button
            type="button"
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''
              }`}
            onClick={handleLogin}
          >
            Log in
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''
              }`}
            onClick={handleSignup}
          >
            Signup
          </button>

          <div className="tab-indicator"></div>

        </div>

        <div className="sso-container">
          {googleError && (
            <Alert
              type="error"
              message={googleError}
              dismissible
              onClose={() => setGoogleError(null)}
            />
          )}

            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
        </div>

        {activeTab === 'login' && (
          <LoginForm
            onForgotPassword={handleForgotPassword}
          />
        )}

        {activeTab === 'signup' && (
          <SignupForm />
        )}

      </div>
    </div>
  );
}

export default Auth;