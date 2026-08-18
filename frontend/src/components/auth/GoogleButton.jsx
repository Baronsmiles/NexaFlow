import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleButton.css';

function GoogleButton({ onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const wrapperRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(300);

  useEffect(() => {
    function updateWidth() {
      if (wrapperRef.current) {
        setButtonWidth(Math.min(wrapperRef.current.offsetWidth, 400));
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function handleSuccess(response) {
    setError(null);
    clearTimeout(timeoutRef.current);

    const credential = response?.credential;

    if (!credential) {
      setIsLoading(false);

      const errorObject = {
        error: 'invalid_credential',
        message: 'Google did not return a valid credential.'
      };

      setError('Google did not return a valid credential.');
      onError?.(errorObject);

      return;
    }

    // Credential is valid - let parent component handle loading state
    onSuccess?.(response);
  }

  function handleError() {
    clearTimeout(timeoutRef.current);
    setIsLoading(false);

    const errorObject = {
      error: 'google_login_failed',
      message: 'Google login failed. Please try again.'
    };

    setError(errorObject.message);
    onError?.(errorObject);
  }

  function handleStart() {
    setError(null);
    setIsLoading(true);

    // Reset loading state after 2 minutes if popup is closed without selection
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError('Google login window closed. Please try again.');
    }, 2 * 60 * 1000);
  }

  return (
    <div className="google-button-wrapper" ref={wrapperRef}>

      {isLoading && (
        <div className="google-loading">
          <div className="google-spinner"></div>
          <span>Signing in with Google...</span>
        </div>
      )}

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width={buttonWidth}
        onClick={handleStart}
      />

      {error && (
        <div className="google-error">
          <svg className="error-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path stroke="currentColor" strokeWidth="2" d="M12 8v4m0 4v.01" />
          </svg>

          <span>{error}</span>

          <button
            type="button"
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}

export default GoogleButton;