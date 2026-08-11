import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError, getCurrentUser, type PortalRole, type PortalUser } from '../../lib/api';

interface RoleGateProps {
  roles: PortalRole[];
  children: (user: PortalUser) => ReactNode;
}

export function RoleGate({ roles, children }: RoleGateProps) {
  const location = useLocation();
  const rolesKey = roles.join(',');
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((current) => {
        if (!active) return;
        setUser(current);
        setUnauthorized(!rolesKey.split(',').includes(current.tipo_conta));
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          setUnauthorized(true);
        } else {
          setUnauthorized(true);
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [rolesKey]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-bg-main text-text-main">Carregando portal...</div>;
  }

  if (!user || unauthorized) {
    return <Navigate to="/portal" replace state={{ from: location.pathname }} />;
  }

  return <>{children(user)}</>;
}
