import './loader.css';

function Loader({
size = 'medium',
text = '',
fullScreen = false
}) {

  return (
  <div className={`loader-container ${fullScreen ? 'full-screen' : ''}`}>
  <div className={`loader loader-${size}`}>  
  </div>

  {text && (
  <span className="loader-text">
    {text}
  </span>
  )}
  </div>
  );
}

export default Loader;