import './Button.css';
import Loader from './Loader';

function Button({ children, type = 'button', variant = 'primary', onClick, disabled, loading }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Loader size="small" /> : children}
    </button>
  );
}

export default Button;