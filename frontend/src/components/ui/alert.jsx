import { useEffect } from 'react';
import './alert.css';

function Alert({
  type = 'info',
  message,
  onClose,
  dismissible = false,
  duration = 4000 // 0 means persistent (no timer)
}) {
  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  useEffect(() => {
    if (!message || !duration || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-toast`} role="alert">
      <div className="alert-content">
        <i className={icons[type]}></i>
        <span className="alert-message">{message}</span>
      </div>

      {dismissible && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}

      {/* Visual countdown progress bar */}
      {duration > 0 && (
        <div
          className="alert-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

export default Alert;