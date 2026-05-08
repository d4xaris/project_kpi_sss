import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';

export default function ProtectedRoute() {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) navigate('/login', { replace: true });
  }, [isLoggedIn, isLoading]);

  if (isLoading || !isLoggedIn) return null;

  return <Outlet />;
}
