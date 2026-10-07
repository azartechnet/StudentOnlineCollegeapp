import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* ---------- SVG Icons ---------- */

const LoginIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const RegisterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const TestsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const ResultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

/* ---------- Navbar ---------- */

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      {/* ============================
          LOGO + BRAND  (UNCHANGED)
          ============================ */}
      <Link to="/" className="navbar-brand">
        <img
          src="/logo.jpeg"
          alt="SDLC"
          className="navbar-logo"
          onError={(e) => (e.target.style.display = 'none')}
        />
        <div className="navbar-brand-text">
          <span className="brand-main">SDLC — Online Test Portal</span>
          <span className="brand-sub">Skill Development Learning Centre</span>
        </div>
      </Link>

      {/* ============================
          RIGHT-SIDE LINKS WITH ICONS
          ============================ */}
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-user">
              <span className="user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{user.name}</span>
            </span>

            {user.role === 'student' && (
              <>
                <Link to="/tests" className="nav-link">
                  <TestsIcon /> Tests
                </Link>
                <Link to="/my-result" className="nav-link">
                  <ResultIcon /> Results
                </Link>
              </>
            )}

            {user.role === 'trainer' && (
              <Link to="/trainer" className="nav-link">
                <DashboardIcon /> Dashboard
              </Link>
            )}

            <button onClick={handleLogout} className="btn-logout">
              <LogoutIcon /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <LoginIcon /> Login
            </Link>
            <Link to="/register" className="nav-link nav-link-primary">
              <RegisterIcon /> Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}