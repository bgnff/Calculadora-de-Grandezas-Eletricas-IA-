import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: Error | null; user: User | null }>;
  signInAsGuest: (
    customEmail?: string,
    customName?: string
  ) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const LOCAL_USER_STORAGE_KEY = 'voltiva_local_user';

function buildLocalUser(email = 'convidado@voltiva.local', fullName = 'Usuário Convidado'): User {
  const safeId = 'local-' + (email ? email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 'guest');
  return {
    id: safeId,
    app_metadata: { provider: 'local' },
    user_metadata: { full_name: fullName },
    aud: 'authenticated',
    confirmation_sent_at: '',
    recovery_sent_at: '',
    email_change_sent_at: '',
    new_email: '',
    invited_at: '',
    action_link: '',
    email,
    phone: '',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: '',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [],
    is_anonymous: false,
  } as User;
}

function buildLocalSession(user: User): Session {
  return {
    access_token: 'local-demo-token',
    token_type: 'bearer',
    expires_in: 3600 * 24 * 365,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
    refresh_token: 'local-demo-refresh-token',
    user,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 1. Verifica se há uma sessão de convidado / local salva no localStorage
    try {
      const storedLocal = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      if (storedLocal) {
        const parsedUser = JSON.parse(storedLocal) as User;
        setUser(parsedUser);
        setSession(buildLocalSession(parsedUser));
        setIsGuest(true);
        setLoading(false);
        return;
      }
    } catch {
      // Ignora erro de JSON e prossegue
    }

    // 2. Se o Supabase não estiver configurado, finaliza o loading
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 3. Se estiver configurado, carrega a sessão ativa do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(false);
      setLoading(false);
    });

    // Escuta mudanças no estado de autenticação (LOGIN, LOGOUT, TOKEN_REFRESHED, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsGuest(false);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInAsGuest = useCallback(
    async (customEmail?: string, customName?: string) => {
      const email = customEmail || 'convidado@voltiva.local';
      const name = customName || (customEmail ? customEmail.split('@')[0] : 'Usuário Convidado');
      const localUser = buildLocalUser(email, name);
      try {
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localUser));
      } catch {
        // storage fallback
      }
      setUser(localUser);
      setSession(buildLocalSession(localUser));
      setIsGuest(true);
      return { error: null, user: localUser };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Modo contingência local quando Supabase não estiver configurado
      const localUser = buildLocalUser(email, email.split('@')[0]);
      try {
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localUser));
      } catch {
        // storage fallback
      }
      setUser(localUser);
      setSession(buildLocalSession(localUser));
      setIsGuest(true);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!isSupabaseConfigured) {
        // Modo contingência local quando Supabase não estiver configurado
        const localUser = buildLocalUser(email, fullName || email.split('@')[0]);
        try {
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localUser));
        } catch {
          // storage fallback
        }
        setUser(localUser);
        setSession(buildLocalSession(localUser));
        setIsGuest(true);
        return {
          error: null,
          user: localUser,
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });
      return {
        error: error as Error | null,
        user: data.user,
      };
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    } catch {
      // storage fallback
    }

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isGuest,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}

