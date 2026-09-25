import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, UserProfile, UserRole, SignUpParentParams, SignInParams } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  role: UserRole | 'anon';
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isParent: boolean;
  isVendor: boolean;
  isSupport: boolean;
  signUpParent: (params: SignUpParentParams) => Promise<{ success: boolean; error?: string }>;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load profile for authenticated user
  const loadUserProfile = async (userId: string) => {
    try {
      const prof = await authService.getProfile(userId);
      setProfile(prof);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user) {
        loadUserProfile(initSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen to active auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadUserProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpParent = async (params: SignUpParentParams) => {
    setIsLoading(true);
    const result = await authService.signUpParent(params);
    setIsLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    if (result.profile) {
      setProfile(result.profile);
    }
    return { success: true };
  };

  const signIn = async (params: SignInParams) => {
    setIsLoading(true);
    const result = await authService.signIn(params);
    setIsLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    if (result.profile) {
      setProfile(result.profile);
    }
    return { success: true, role: result.profile?.role };
  };

  const signOut = async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const result = await authService.resetPasswordForEmail(email);
    return { success: !result.error, error: result.error || undefined };
  };

  const updatePassword = async (newPassword: string) => {
    const result = await authService.updatePassword(newPassword);
    return { success: !result.error, error: result.error || undefined };
  };

  const resendVerification = async (email: string) => {
    const result = await authService.resendVerificationEmail(email);
    return { success: !result.error, error: result.error || undefined };
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const currentRole = profile?.role || 'anon';
  const isAuthenticated = Boolean(user);
  const isAdmin = currentRole === 'admin';
  const isParent = currentRole === 'parent';
  const isVendor = currentRole === 'vendor';
  const isSupport = currentRole === 'support';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role: currentRole,
        isLoading,
        isAuthenticated,
        isAdmin,
        isParent,
        isVendor,
        isSupport,
        signUpParent,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
