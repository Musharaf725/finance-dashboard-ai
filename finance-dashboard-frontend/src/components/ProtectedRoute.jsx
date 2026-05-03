import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.jsx';

const ROLE_ORDER = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
};

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && ROLE_ORDER[currentUser.role] < ROLE_ORDER[requiredRole]) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
