import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireFacilitator?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireFacilitator }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || timeoutReached) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireFacilitator && !['facilitator', 'admin'].includes(profile?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}