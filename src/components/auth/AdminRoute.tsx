import { Navigate, Outlet } from 'react-router-dom';
import { getSessionClaims } from '../../services/api';

export default function AdminRoute() {
  const claims = getSessionClaims();
  if (!claims || claims.role !== 'ADMIN') {
    return <Navigate to="/sistema" replace />;
  }
  return <Outlet />;
}
