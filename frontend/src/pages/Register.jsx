import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: '',
    studentId: '',
    emailId: '',
    phone: '',
    address: '',
    location: '',
    collegeName: '',
    password: '',
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await API.post('/auth/register', form);
      setMsg({
        text: '✅ Registration successful! Redirecting to login...',
        type: 'success',
      });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || 'Registration failed',
        type: 'error',
      });
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

      {/* Main card */}
      <div className="auth-card" style={{ maxWidth: '600px' }}>
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
          Student Registration
        </h2>

        {msg.text && <p className={msg.type}>{msg.text}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="studentName"
            placeholder="Student Name"
            onChange={handleChange}
            required
          />
          <input
            name="studentId"
            placeholder="Student ID"
            onChange={handleChange}
            required
          />
          <input
            name="emailId"
            type="email"
            placeholder="Email ID"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
          />
          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            required
          />
          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            required
          />
          <input
            name="collegeName"
            placeholder="College Name"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already registered?{' '}
          <Link to="/login" className="link">
            Login
          </Link>
        </p>
      </div>

      {/* Footer brand */}
      <div className="auth-footer">
        © {new Date().getFullYear()} <strong>SDLC</strong> — IT Training &
        Placement
      </div>
    </div>
  );
}