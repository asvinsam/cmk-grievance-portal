import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLE_HOME = {
  CITIZEN: '/citizen/dashboard',
  CMO_ADMIN: '/cmo/dashboard',
  DEPT_OFFICER: '/officer/dashboard'
};

export const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }
  return children;
};
