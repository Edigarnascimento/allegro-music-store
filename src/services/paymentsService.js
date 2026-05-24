import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const PAYMENTS_TABLE = 'music_pagamentos';

export async function createAsaasPixPayment({ pedidoId }) {
  const response = await fetch('/api/asaas/create-pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedido_id: pedidoId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    return { ok: false, reason: payload?.reason || 'fallback_manual', message: payload?.message || 'PIX automático indisponível.' };
  }

  return {
    ok: true,
    data: {
      paymentId: payload?.payment_id || '',
      status: payload?.status || 'pendente',
      qrCode: payload?.qr_code || '',
      copiaColaPix: payload?.qr_code_text || payload?.copia_cola_pix || '',
      expiresAt: payload?.expires_at || null,
    },
  };
}

export async function getAdminPayments() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select('*, music_pedidos(id, cliente_nome, cliente_whatsapp)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
