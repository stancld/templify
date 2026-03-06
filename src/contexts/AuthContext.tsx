import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import type { AppRole } from '../types';
import type { Database } from '../lib/database.types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
type UserRoleRow = Pick<Database['public']['Tables']['user_roles']['Row'], 'role'>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    const loadRole = async (nextSession: Session | null) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', nextUser.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Error loading user role:', error);
        setRole(null);
      } else {
        const roleRow = data as UserRoleRow | null;
        setRole(roleRow?.role ?? null);
      }

      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void loadRole(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      void loadRole(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
