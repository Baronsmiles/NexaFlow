import { useState } from 'react';
import './input.css';

function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  required,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasValue = value && value.length > 0;

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <div className={`input-wrapper ${error ? 'error' : ''} ${hasValue ? 'has-value' : ''}`}>
        <input
          name={name}
          type={inputType}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
        />

        {isPassword && (
          <button
            type="button"
            className="input-action-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
          </button>
        )}

        {!isPassword && hasValue && (
          <button
            type="button"
            className="input-action-btn"
            onClick={() => onChange({ target: { name, value: '' } })}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}
      {!error && success && <span className="success-text">{success}</span>}
    </div>
  );
}

export default Input;