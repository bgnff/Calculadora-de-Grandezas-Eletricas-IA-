import { supabase } from '@/lib/supabase/client';

export const authService = {
  async getSession() {
    return supabase.auth.getSession();
  },

  async getUser() {
    return supabase.auth.getUser();
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, fullName?: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async resetPassword(email: string, redirectTo?: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
  },

  async updatePassword(password: string) {
    return supabase.auth.updateUser({ password });
  },
};
