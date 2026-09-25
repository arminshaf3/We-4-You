import { useAuthContext } from '../context/AuthContext';

/**
 * Hook to access Supabase authentication and user state
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
