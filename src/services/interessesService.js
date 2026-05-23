import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const INTERESSES_TABLE = 'music_interesses';

function sanitizeInterestPayload(payload = {}) {
  return {
    produto_id: payload.produto_id ?? null,
    produto_nome: payload.produto_nome ?? '',
    categoria: payload.categoria ?? '',
    preco: Number(payload.preco ?? 0),
    origem: payload.origem ?? 'catalogo',
    whatsapp_destino: payload.whatsapp_destino ?? '',
    mensagem: payload.mensagem ?? '',
  };
}

export async function createInterest(payload) {
  const sanitizedPayload = sanitizeInterestPayload(payload);

  if (!isSupabaseConfigured || !supabase) {
    console.warn('[interessesService] Supabase não configurado. Interesse não persistido.', sanitizedPayload);
    return null;
  }

  const { data, error } = await supabase
    .from(INTERESSES_TABLE)
    .insert(sanitizedPayload)
    .select()
    .maybeSingle();

  if (error) {
    console.warn('[interessesService] Erro ao registrar interesse:', error.message);
    return null;
  }

  return data;
}

export async function getAdminInterests() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from(INTERESSES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[interessesService] Erro ao buscar interesses:', error.message);
    return [];
  }

  return data ?? [];
}
