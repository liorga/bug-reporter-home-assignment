import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserStatus } from './models/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStatus?: UserStatus;
}

export function ProtectedRoute({
  children,
  requiredStatus = 'allowed',
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredStatus === 'admin' && user?.status !== 'admin') {
    return <Navigate to="/report" replace />;
  }

  return <>{children}</>;
}
