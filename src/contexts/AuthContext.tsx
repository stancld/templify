import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseEnabled = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      return;
    }

    const supabase = getSupabaseClient();
    let mounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isSupabaseEnabled]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase not configured' } as AuthError };
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    },
    [isSupabaseEnabled]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase not configured' } as AuthError };
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    [isSupabaseEnabled]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseEnabled) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  }, [isSupabaseEnabled]);

  const signOut = useCallback(async () => {
    if (!isSupabaseEnabled) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [isSupabaseEnabled]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase not configured' } as AuthError };
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    },
    [isSupabaseEnabled]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!isSupabaseEnabled) {
        return { error: { message: 'Supabase not configured' } as AuthError };
      }
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    },
    [isSupabaseEnabled]
  );

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isSupabaseEnabled,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
