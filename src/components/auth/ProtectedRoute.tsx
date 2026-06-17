import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { hasValidSession } from '../../services/api';

export default function ProtectedRoute() {
  const location = useLocation();

  if (!hasValidSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
