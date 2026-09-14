import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Remove sufixos como /rest/v1 ou barras no final caso o usuário cole a URL da Data API
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Voltiva] Supabase URL ou Anon Key não configuradas no ambiente. ' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env ou no painel da Netlify. ' +
    'A aplicação continuará em modo de contingência local.'
  );
}

// Inicializa o cliente se as variáveis estiverem configuradas, ou com fallback de desenvolvimento
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
