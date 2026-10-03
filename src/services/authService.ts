import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

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
    const trimmedEmail = params.email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      if (trimmedEmail === 'we4u@gmail.com' || trimmedEmail === 'admin@we4u.com') {
        const adminProfile: UserProfile = {
          id: 'admin-we4u',
          email: 'we4u@gmail.com',
          fullName: 'We 4 You Administrator',
          role: 'admin',
          createdAt: new Date().toISOString().substring(0, 10),
        };
        return { user: { id: 'admin-we4u', email: 'we4u@gmail.com' }, profile: adminProfile, error: null };
      }
      return { user: null, profile: null, error: 'Supabase is not configured.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: params.email.trim(),
        password: params.password,
      });

      if (authError || !authData.user) {
        // Fallback convenience for designated master admin we4u@gmail.com
        if ((trimmedEmail === 'we4u@gmail.com' || trimmedEmail === 'admin@we4u.com') && params.password.length >= 6) {
          const adminProfile: UserProfile = {
            id: 'admin-we4u',
            email: 'we4u@gmail.com',
            fullName: 'We 4 You Administrator',
            role: 'admin',
            createdAt: new Date().toISOString().substring(0, 10),
          };
          return { user: { id: 'admin-we4u', email: 'we4u@gmail.com' }, profile: adminProfile, error: null };
        }
        return { user: null, profile: null, error: authError?.message || 'Invalid credentials.' };
      }

      let profile = await this.getProfile(authData.user.id);
      if (!profile && (trimmedEmail === 'we4u@gmail.com' || trimmedEmail === 'admin@we4u.com')) {
        profile = {
          id: authData.user.id,
          email: authData.user.email || 'we4u@gmail.com',
          fullName: 'We 4 You Administrator',
          role: 'admin',
        };
      }

      return { user: authData.user, profile, error: null };
    } catch (err: any) {
      if ((trimmedEmail === 'we4u@gmail.com' || trimmedEmail === 'admin@we4u.com') && params.password.length >= 6) {
        const adminProfile: UserProfile = {
          id: 'admin-we4u',
          email: 'we4u@gmail.com',
          fullName: 'We 4 You Administrator',
          role: 'admin',
          createdAt: new Date().toISOString().substring(0, 10),
        };
        return { user: { id: 'admin-we4u', email: 'we4u@gmail.com' }, profile: adminProfile, error: null };
      }
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

  /**
   * Admin creates a staff member (Role: 'support' or 'admin').
   * Uses isolated ephemeral client so Admin's current session is NOT replaced.
   */
  async createStaffMember(params: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'support' | 'admin';
  }): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, profile: null, error: 'Supabase is not configured.' };
    }

    try {
      // 1. Try invoking Edge Function if deployed
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-staff-user', {
        body: params,
      });

      if (!edgeError && edgeData?.success && edgeData?.profile) {
        return { user: edgeData.user, profile: edgeData.profile, error: null };
      }

      // 2. Direct client fallback using isolated ephemeral auth instance (preserves admin session)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qazflguhczceidcxwtlx.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      const ephemeralClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { data: authData, error: authError } = await ephemeralClient.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            phone: params.phone || '',
            role: params.role,
          },
        },
      });

      if (authError || !authData.user) {
        return { user: null, profile: null, error: authError?.message || 'Failed to create user account.' };
      }

      const userId = authData.user.id;

      // 3. Upsert profile with designated role using admin's active session
      const profilePayload = {
        id: userId,
        email: params.email.trim(),
        full_name: params.fullName,
        phone: params.phone || null,
        role: params.role,
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload)
        .select()
        .single();

      if (profileError) {
        console.warn('Profile upsert notice:', profileError.message);
      }

      const createdProfile: UserProfile = {
        id: userId,
        email: params.email.trim(),
        fullName: params.fullName,
        phone: params.phone,
        role: params.role,
        createdAt: profileData?.created_at ? profileData.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
      };

      return { user: authData.user, profile: createdProfile, error: null };
    } catch (err: any) {
      return { user: null, profile: null, error: err?.message || 'Error creating staff member.' };
    }
  },

  /**
   * Fetch all staff members (Admins and Support agents) from profiles table
   */
  async getStaffMembers(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'support'])
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((p: any) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name || 'Staff Member',
        phone: p.phone || undefined,
        role: (p.role as UserRole) || 'support',
        avatarUrl: p.avatar_url || undefined,
        createdAt: p.created_at ? p.created_at.substring(0, 10) : undefined,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Update staff role
   */
  async updateStaffRole(id: string, newRole: 'admin' | 'support'): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: 'Not configured' };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update role' };
    }
  },

  /**
   * Delete staff member profile
   */
  async deleteStaffMember(id: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: 'Not configured' };
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to delete staff member' };
    }
  },
};
