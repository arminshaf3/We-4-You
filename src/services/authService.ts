import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'admin' | 'parent' | 'vendor' | 'support';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface SignUpParentParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  preferredLanguage?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export const authService = {
  isConfigured: isSupabaseConfigured,

  /**
   * Public Parent Sign-up.
   * Strictly creates profile with role 'parent'.
   * Never allows selecting admin/support/vendor from public signup form.
   */
  async signUpParent(params: SignUpParentParams): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, profile: null, error: 'Supabase is not configured.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            phone: params.phone,
            role: 'parent', // Strictly forced
          },
        },
      });

      if (authError || !authData.user) {
        return { user: null, profile: null, error: authError?.message || 'Sign up failed.' };
      }

      const userId = authData.user.id;

      // 1. Create Profile record (role is strictly 'parent')
      const profilePayload = {
        id: userId,
        email: params.email.trim(),
        full_name: params.fullName,
        phone: params.phone,
        role: 'parent',
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload)
        .select()
        .single();

      // 2. Create matching Guardian record linked to profile
      await supabase.from('guardians').insert({
        profile_id: userId,
        full_name: params.fullName,
        relationship: 'Parent / Guardian',
        mobile: params.phone,
        email: params.email.trim(),
        preferred_language: params.preferredLanguage || 'English',
      });

      const profile: UserProfile = {
        id: userId,
        email: params.email,
        fullName: params.fullName,
        phone: params.phone,
        role: 'parent',
        createdAt: profileData?.created_at,
      };

      return { user: authData.user, profile, error: null };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'An unexpected error occurred during signup.' };
    }
  },

  /**
   * Universal Sign-in for Parent, Vendor, Support, Admin
   */
  async signIn(params: SignInParams): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, profile: null, error: 'Supabase is not configured.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: params.email.trim(),
        password: params.password,
      });

      if (authError || !authData.user) {
        return { user: null, profile: null, error: authError?.message || 'Invalid credentials.' };
      }

      const profile = await this.getProfile(authData.user.id);
      return { user: authData.user, profile, error: null };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'Login failed.' };
    }
  },

  /**
   * Fetch user profile by Auth ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback check metadata if profile table row not yet created
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user && userData.user.id === userId) {
          const meta = userData.user.user_metadata || {};
          return {
            id: userId,
            email: userData.user.email || '',
            fullName: meta.full_name || 'Authorized User',
            phone: meta.phone,
            role: (meta.role as UserRole) || 'parent',
          };
        }
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone || undefined,
        role: (data.role as UserRole) || 'parent',
        avatarUrl: data.avatar_url || undefined,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Sign out current session
   */
  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  /**
   * Password reset request email
   */
  async resetPasswordForEmail(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    return { error: error ? error.message : null };
  },

  /**
   * Update password for authenticated user (after clicking reset link)
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error ? error.message : null };
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    return { error: error ? error.message : null };
  },
};
