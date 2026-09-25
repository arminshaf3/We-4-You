import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/authService';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading, role, user, signOut } = useAuth();
  const location = useLocation();

  // 1. Show loading indicator while session/profile resolves
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-mint animate-spin mb-4" />
        <p className="text-navy font-semibold text-base">Verifying authorization...</p>
        <p className="text-xs text-content-muted mt-1">Checking secure session and role permissions</p>
      </div>
    );
  }

  // 2. If not logged in, redirect to login page
  if (!isAuthenticated || !user) {
    const defaultRedirect = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={redirectTo || defaultRedirect} state={{ from: location }} replace />;
  }

  // 3. If role is restricted and user does not have permission
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-brand-lg shadow-card border border-border-subtle max-w-md w-full">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-heading font-bold text-navy">Access Restricted</h2>
            <p className="text-sm text-content-muted mt-2">
              Your account role (<span className="font-semibold text-navy capitalize">{role}</span>) does not have permission to access this section.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => signOut()}
              >
                Switch Account
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
