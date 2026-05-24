import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AUDIT_TABLE = 'music_audit_logs';

export async function createAuditLog({
  tipo,
  acao,
  tabela,
  registro_id,
  descricao,
  antes,
  depois,
  origem = 'admin',
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: authData } = await supabase.auth.getUser();
    const usuario_email = authData?.user?.email || null;

    const payload = {
      tipo,
      acao,
      tabela,
      registro_id: registro_id ? String(registro_id) : null,
      descricao,
      antes: antes ?? null,
      depois: depois ?? null,
      usuario_email,
      origem: origem || 'admin',
    };

    const { error } = await supabase.from(AUDIT_TABLE).insert(payload);
    if (error) {
      console.warn('[auditService] Falha ao salvar log de auditoria:', error.message);
    }
  } catch (error) {
    console.warn('[auditService] Falha ao salvar log de auditoria:', error?.message || error);
  }

  return null;
}

export async function getAuditLogsByType(tipo = 'all') {
  if (!isSupabaseConfigured || !supabase) return [];

  let query = supabase.from(AUDIT_TABLE).select('*').order('created_at', { ascending: false });
  if (tipo !== 'all') query = query.eq('tipo', tipo);

  const { data, error } = await query;
  if (error) {
    console.warn('[auditService] Falha ao carregar logs de auditoria:', error.message);
    return [];
  }

  return data ?? [];
}
