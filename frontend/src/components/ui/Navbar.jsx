import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, clearAuth } from '../../utils/auth';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const loggedIn = isAuthenticated();
  const email = getUser()?.email || '';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSignOut() {
    clearAuth();
    setMenuOpen(false);
    navigate('/auth/login');
  }

  function handleOrderHistory() {
    setMenuOpen(false);
    navigate('/order-history');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
        <i className="fa-solid fa-leaf"></i> NexaFlow
      </div>

      {!loggedIn && (
        <button className="navbar-signin-btn" onClick={() => navigate('/auth/login')}>
          Sign In
        </button>
      )}

      {loggedIn && (
        <div className="navbar-menu-wrapper" ref={menuRef}>
          <button
            className="navbar-icon-btn navbar-icon-desktop"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open profile menu"
          >
            <i className="fa-solid fa-circle-user"></i>
          </button>

          <button
            className="navbar-icon-btn navbar-icon-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          {menuOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-email">{email}</div>
              <button className="navbar-dropdown-item" onClick={handleOrderHistory}>
                <i className="fa-solid fa-receipt"></i> Order History
              </button>
              <button className="navbar-dropdown-item navbar-dropdown-signout" onClick={handleSignOut}>
                <i className="fa-solid fa-right-from-bracket"></i> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;