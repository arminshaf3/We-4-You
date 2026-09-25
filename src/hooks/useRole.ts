import { useAuthContext } from '../context/AuthContext';
import { UserRole } from '../services/authService';

/**
 * Hook to check and enforce user roles
 */
export const useRole = () => {
  const { role, isAdmin, isParent, isVendor, isSupport, isAuthenticated, isLoading } = useAuthContext();

  const hasRole = (allowedRoles: (UserRole | 'anon')[]): boolean => {
    return allowedRoles.includes(role);
  };

  const hasAnyRole = (...roles: UserRole[]): boolean => {
    if (role === 'anon') return false;
    return roles.includes(role);
  };

  return {
    role,
    isAdmin,
    isParent,
    isVendor,
    isSupport,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
  };
};

export default useRole;
