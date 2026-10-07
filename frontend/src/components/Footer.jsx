import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const branches = [
    {
      name: 'Karur',
      address:
        '1st Floor, VV TOWERS, Kovai Road, Opposite LGB Petrol Bunk, Karur, Tamil Nadu 639 002',
      phone: '+91 98426 62681',
    },
    {
      name: 'Namakkal',
      address:
        '1ST FLOOR, 15/32, P.R TOWERS, Kottai Rd, opposite to UZHAVAR SANTHAI, Namakkal, Tamil Nadu 637001',
      phone: '07200564957',
    },
    {
      name: 'Dindigul',
      address:
        'No 6, 2nd Floor, JK Towers, Thiruvalluvar Salai, near IOB Bank, Spencer Compound, Dindigul, Tamil Nadu 624003',
      phone: '+91 99883 34020',
    },
    {
      name: 'Coimbatore',
      address:
        '1656, Ground Floor, MM Complex, Avinashi Rd, Peelamedu, Hope College, Coimbatore, Tamil Nadu 641004',
      phone: '09994482027',
    },
  ];

  const socials = [
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: 'f',
      color: '#1877f2',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: '📷',
      color: '#e1306c',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: 'in',
      color: '#0077b5',
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com',
      icon: '▶',
      color: '#ff0000',
    },
  ];

  return (
    <footer className="site-footer">
      {/* ===== Top decorative strip ===== */}
      <div className="footer-strip"></div>

      {/* ===== Main footer content ===== */}
      <div className="footer-main">
        {/* Brand + SDLC Team */}
        <div className="footer-brand">
          <img
            src="/logo.png"
            alt="SDLC"
            className="footer-logo"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <h3 className="footer-title">SDLC Team</h3>
          <p className="footer-tagline">
            Skill Development Learning Centre
          </p>
          <p className="footer-desc">
            Empowering students with industry-ready skills in Java, Python,
            Full Stack, Data Science & more. Training, placement & career
            support under one roof.
          </p>
        </div>

        {/* Branch locations */}
        <div className="footer-branches">
          <h4 className="footer-heading">📍 Our Branches</h4>
          <div className="branches-grid">
            {branches.map((b) => (
              <div key={b.name} className="branch-card">
                <h5>{b.name}</h5>
                <p>{b.address}</p>
                <p className="branch-phone">
                  <strong>📞 {b.phone}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Bottom bar: social + copyright ===== */}
      <div className="footer-bottom">
        <div className="footer-socials">
          <span className="follow-label">Follow us on :</span>
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              style={{ background: s.color }}
              aria-label={s.name}
              title={s.name}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <div className="footer-copy">
          © {year} <strong>SDLC — Skill Development Learning Centre</strong>.
          All Rights Reserved.
        </div>
      </div>

      {/* ===== Floating WhatsApp button ===== */}
      <a
        href="https://wa.me/919842662681"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
          <path d="M20.52 3.48A11.9 11.9 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.2-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.94 9.94 0 0 1-5.07-1.39l-.36-.21-3.68.96.98-3.58-.23-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93S22 9.33 22 12c0 5.52-4.48 10-10 10zm5.48-7.51c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.19-.57-.34z" />
        </svg>
      </a>
    </footer>
  );
}