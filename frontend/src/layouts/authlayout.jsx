import './authlayout.css';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="brand-logo">
        <i className="fa-solid fa-leaf"></i>
        NexaFlow
      </div>

      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;