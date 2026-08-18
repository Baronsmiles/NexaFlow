import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button';
import './notFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have been moved.</p>

        <div className="notfound-actions">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;