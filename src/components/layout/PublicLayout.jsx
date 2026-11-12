import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Shield icon SVG (no official seals/logos)
const ShieldIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 3L5 10V20C5 28.3 11.7 36.2 20 38C28.3 36.2 35 28.3 35 20V10L20 3Z" fill="#E08A00" stroke="#0B2A4A" strokeWidth="2"/>
    <path d="M15 20L18 23L25 16" stroke="#0B2A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="14" r="3" fill="#0B2A4A" opacity="0.5"/>
  </svg>
);

const UtilityBar = () => {
  const [lang, setLang] = useState('en');
  const [textSize, setTextSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);

  const setTextSizeMode = (size) => {
    document.documentElement.classList.remove('text-sm-mode', 'text-lg-mode');
    if (size === 'small') document.documentElement.classList.add('text-sm-mode');
    if (size === 'large') document.documentElement.classList.add('text-lg-mode');
    setTextSize(size);
  };

  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('high-contrast');
    setHighContrast(!highContrast);
  };

  return (
    <div className="bg-navy-950 text-gray-300 text-xs py-1 px-4" role="toolbar" aria-label="Accessibility tools">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-3 items-center">
          <a href="#main-content" className="hover:text-white underline">Skip to content</a>
          <span aria-hidden>|</span>
          <span>Text Size:</span>
          <button onClick={() => setTextSizeMode('small')} aria-label="Small text" className={`px-1.5 py-0.5 rounded hover:bg-navy-700 ${textSize === 'small' ? 'bg-navy-700' : ''}`}>A-</button>
          <button onClick={() => setTextSizeMode('normal')} aria-label="Normal text" className={`px-1.5 py-0.5 rounded hover:bg-navy-700 ${textSize === 'normal' ? 'bg-navy-700' : ''}`}>A</button>
          <button onClick={() => setTextSizeMode('large')} aria-label="Large text" className={`px-1.5 py-0.5 rounded hover:bg-navy-700 ${textSize === 'large' ? 'bg-navy-700' : ''}`}>A+</button>
          <span aria-hidden>|</span>
          <button onClick={toggleHighContrast} aria-pressed={highContrast} className="hover:text-white px-1.5 py-0.5 rounded hover:bg-navy-700">
            {highContrast ? 'Standard View' : 'High Contrast'}
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setLang('en')}
            className={`hover:text-white ${lang === 'en' ? 'text-saffron-400 font-semibold' : ''}`}
            aria-label="Switch to English"
          >English</button>
          <span aria-hidden>|</span>
          <button
            onClick={() => setLang('ml')}
            className={`hover:text-white font-malayalam ${lang === 'ml' ? 'text-saffron-400 font-semibold' : ''}`}
            aria-label="Switch to Malayalam"
          >മലയാളം</button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <Link to="/" className="flex items-center gap-3 group" aria-label="CM Kerala Grievance Portal home">
          <ShieldIcon />
          <div>
            <div className="text-saffron-400 font-bold text-lg leading-tight">CM Kerala Grievance Portal</div>
            <div className="text-blue-200 text-xs font-medium">(Prototype — Not an Official Website)</div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-200">Welcome, <span className="font-semibold text-white">{user.name?.split(' ')[0]}</span></span>
              <span className="text-xs bg-saffron-500 text-white px-2 py-0.5 rounded-full font-medium">{user.role?.replace('_', ' ')}</span>
              <button onClick={handleLogout} className="text-sm text-blue-200 hover:text-white underline">Logout</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-sm text-blue-200 hover:text-white underline">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NavBar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/departments', label: 'Departments' },
    { to: '/track', label: 'Track Grievance' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/faq', label: 'FAQ' }
  ];

  return (
    <nav className="bg-saffron-500 shadow-sm sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop */}
        <ul className="hidden md:flex gap-1 py-0">
          {publicLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-navy-900 font-semibold text-sm px-3 py-3 hover:bg-saffron-600 hover:text-white transition-colors block"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user && (
            <>
              {user.role === 'CITIZEN' && (
                <>
                  <li><Link to="/citizen/dashboard" className="text-navy-900 font-semibold text-sm px-3 py-3 hover:bg-saffron-600 hover:text-white transition-colors block">My Dashboard</Link></li>
                  <li><Link to="/citizen/submit" className="bg-navy-900 text-white font-semibold text-sm px-4 py-3 hover:bg-navy-700 transition-colors block">Submit Grievance</Link></li>
                </>
              )}
              {user.role === 'CMO_ADMIN' && (
                <li><Link to="/cmo/dashboard" className="bg-navy-900 text-white font-semibold text-sm px-4 py-3 hover:bg-navy-700 transition-colors block">CMO Dashboard</Link></li>
              )}
              {user.role === 'DEPT_OFFICER' && (
                <li><Link to="/officer/dashboard" className="bg-navy-900 text-white font-semibold text-sm px-4 py-3 hover:bg-navy-700 transition-colors block">Officer Dashboard</Link></li>
              )}
            </>
          )}
        </ul>
        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between py-2">
          <span className="font-semibold text-navy-900 text-sm">Navigation Menu</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-navy-900" aria-label="Toggle menu" aria-expanded={mobileOpen}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <ul className="md:hidden pb-2">
            {publicLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setMobileOpen(false)} className="block text-navy-900 font-semibold text-sm px-3 py-2 hover:bg-saffron-600 hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-gray-300 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">About Portal</h3>
            <p className="text-xs leading-relaxed text-gray-400">
              A recruitment prototype demonstrating a Chief Minister's Public Grievance Redressal system. Not an official Government of Kerala website.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/" className="hover:text-white hover:underline">Home</Link></li>
              <li><Link to="/about" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white hover:underline">How It Works</Link></li>
              <li><Link to="/track" className="hover:text-white hover:underline">Track Grievance</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Departments</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/departments" className="hover:text-white hover:underline">Public Works</Link></li>
              <li><Link to="/departments" className="hover:text-white hover:underline">Health & Welfare</Link></li>
              <li><Link to="/departments" className="hover:text-white hover:underline">Education</Link></li>
              <li><Link to="/departments" className="hover:text-white hover:underline">View All Departments</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Help</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/faq" className="hover:text-white hover:underline">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:underline">Contact Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white hover:underline">Grievance Process</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-700 pt-6 text-xs text-gray-500 text-center space-y-2">
          <p className="text-amber-400 font-medium">
            ⚠️ Recruitment Prototype. Not an official Government of Kerala / Chief Minister's Office website. All data is fictional.
          </p>
          <p>Recruitment prototype by [Candidate Name] | Last Updated: November 2026 | 👁 Visitor Count: 12,453 (sample)</p>
          <p>© {year} CM Kerala Grievance Portal (Prototype). Built for WhiteMatrix Software Solutions recruitment test.</p>
        </div>
      </div>
    </footer>
  );
};

const DisclaimerBanner = () => (
  <div className="disclaimer-banner" role="alert" aria-live="polite">
    ⚠️ Recruitment Prototype — Not an official Government of Kerala / Chief Minister's Office website — All data is fictional
  </div>
);

export const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <DisclaimerBanner />
    <UtilityBar />
    <Header />
    <NavBar />
    <main id="main-content" className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
