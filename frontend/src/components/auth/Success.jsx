import Button from '../ui/button';
import './Success.css';

function Success({ title = 'Success', message, buttonText = 'Continue', onContinue }) {
  return (
    <div className="success-screen">
      <div className="success-icon-container">
        <div className="success-badge">
          <i className="fa-solid fa-check"></i>
        </div>
      </div>

      <h2 className="flow-title">
        {title}
      </h2>

      <p className="flow-subtitle">
        {message}
      </p>

      <Button
        type="button"
        onClick={onContinue}
      >
        {buttonText}
      </Button>
    </div>
  );
}

export default Success;