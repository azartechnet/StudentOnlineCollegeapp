import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    emailId: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      navigate(data.role === 'trainer' ? '/trainer' : '/tests');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Watermark logos in corners */}
      <img
        src="/logo.png"
        alt=""
        className="watermark-logo"
        onError={(e) => (e.target.style.display = 'none')}
      />
      <img
        src="/logo.png"
        alt=""
        className="watermark-logo-2"
        onError={(e) => (e.target.style.display = 'none')}
      />

      {/* Decorative orbs */}
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>

      {/* ============================================================
          MAIN LAYOUT — Poster + Card + Poster
          ============================================================ */}
      <div className="auth-layout">
        {/* LEFT POSTER */}
        <div className="poster-left">
          <img
            src="/poster.jpg"
            alt="SDLC Poster"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
        </div>

        {/* CENTER LOGIN CARD */}
        <div className="auth-card">
          <img
            src="/logo.png"
            alt="SDLC"
            className="auth-logo-big"
            onError={(e) => (e.target.style.display = 'none')}
          />

          <h1 className="auth-title">SDLC</h1>
          <p className="auth-subtitle">
            Skill Development Learning Centre
          </p>
          <div className="auth-divider"></div>

          <h2
            style={{
              textAlign: 'center',
              fontSize: '18px',
              color: '#333',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            Sign in to Online Test Portal
          </h2>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              required
              value={form.emailId}
              onChange={(e) => setForm({ ...form, emailId: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            New student?{' '}
            <Link to="/register" className="link">
              Register here
            </Link>
          </p>
        </div>

        {/* RIGHT POSTER */}
        <div className="poster-right">
          <img
            src="/poster1.jpg"
            alt="SDLC Poster"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Footer brand */}
      <div className="auth-footer">
        © {new Date().getFullYear()} <strong>SDLC</strong> — IT Training &
        Placement
      </div>
    </div>
  );
}