import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

/**
 * Estrutura inicial para futuras rotinas do painel administrativo.
 * Não implementa autenticação nem CRUD completo nesta etapa.
 */
export async function getAdminHealthStatus() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      mode: 'mock',
      message: 'Supabase não configurado. Painel administrativo em modo preparação.',
    };
  }

  return {
    connected: true,
    mode: 'supabase',
    message: 'Integração base pronta para evolução do painel administrativo.',
  };
}
