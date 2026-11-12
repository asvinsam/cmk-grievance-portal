import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 3L5 10V20C5 28.3 11.7 36.2 20 38C28.3 36.2 35 28.3 35 20V10L20 3Z" fill="#E08A00" stroke="#fff" strokeWidth="2"/>
    <path d="M15 20L18 23L25 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SidebarLink = ({ to, icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-saffron-500 text-navy-900' : 'text-blue-100 hover:bg-navy-700 hover:text-white'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {badge && <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
    </Link>
  );
};

const CitizenSidebar = () => (
  <nav aria-label="Citizen navigation">
    <ul className="space-y-1 py-4">
      <li><SidebarLink to="/citizen/dashboard" icon="🏠" label="My Dashboard" /></li>
      <li><SidebarLink to="/citizen/submit" icon="✍️" label="Submit Grievance" /></li>
      <li><SidebarLink to="/citizen/grievances" icon="📋" label="My Grievances" /></li>
      <li><SidebarLink to="/track" icon="🔍" label="Track Grievance" /></li>
      <li><SidebarLink to="/citizen/notifications" icon="🔔" label="Notifications" /></li>
    </ul>
  </nav>
);

const CMOSidebar = () => (
  <nav aria-label="CMO Admin navigation">
    <ul className="space-y-1 py-4">
      <li><SidebarLink to="/cmo/dashboard" icon="📊" label="Dashboard" /></li>
      <li><SidebarLink to="/cmo/grievances" icon="📋" label="All Grievances" /></li>
      <li><SidebarLink to="/cmo/stats" icon="📈" label="Statistics" /></li>
      <li><SidebarLink to="/cmo/notifications" icon="🔔" label="Notifications" /></li>
    </ul>
  </nav>
);

const OfficerSidebar = () => (
  <nav aria-label="Officer navigation">
    <ul className="space-y-1 py-4">
      <li><SidebarLink to="/officer/dashboard" icon="📊" label="Dashboard" /></li>
      <li><SidebarLink to="/officer/grievances" icon="📋" label="Assigned Grievances" /></li>
      <li><SidebarLink to="/officer/notifications" icon="🔔" label="Notifications" /></li>
    </ul>
  </nav>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => {
    if (user?.role === 'CMO_ADMIN') return <CMOSidebar />;
    if (user?.role === 'DEPT_OFFICER') return <OfficerSidebar />;
    return <CitizenSidebar />;
  };

  const roleLabel = { CITIZEN: 'Citizen Portal', CMO_ADMIN: 'CMO Admin', DEPT_OFFICER: 'Dept. Officer' }[user?.role] || '';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Disclaimer banner */}
      <div className="disclaimer-banner">
        ⚠️ Recruitment Prototype — Not an official Government of Kerala website — All data is fictional
      </div>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="dashboard-sidebar flex flex-col" aria-label="Dashboard sidebar">
          <div className="flex items-center gap-2 px-4 py-5 border-b border-navy-700">
            <ShieldIcon />
            <div>
              <div className="text-saffron-400 font-bold text-xs leading-tight">CM Kerala</div>
              <div className="text-blue-200 text-xs">Grievance Portal</div>
            </div>
          </div>
          <div className="px-2 py-3 border-b border-navy-700">
            <div className="text-xs text-blue-300 uppercase tracking-wider px-4 mb-1">{roleLabel}</div>
            <div className="text-sm text-white font-medium px-4 truncate">{user?.name}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent />
          </div>
          <div className="p-4 border-t border-navy-700">
            <Link to="/" className="block text-blue-300 hover:text-white text-xs mb-2">← Public Portal</Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm w-full text-left">Logout</button>
          </div>
        </aside>
        {/* Main content */}
        <main id="main-content" className="dashboard-main p-6" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
