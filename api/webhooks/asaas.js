import { createClient } from '@supabase/supabase-js';

function json(res, status, payload) { res.status(status).json(payload); }

const STATUS_MAP = {
  PAYMENT_CREATED: 'pendente',
  PAYMENT_UPDATED: 'pendente',
  PAYMENT_CONFIRMED: 'pago',
  PAYMENT_RECEIVED: 'pago',
  PAYMENT_OVERDUE: 'expirado',
  PAYMENT_DELETED: 'cancelado',
  PAYMENT_REFUNDED: 'estornado',
  PAYMENT_REFUND_IN_PROGRESS: 'estorno_em_processamento',
  PAYMENT_REFUND_DENIED: 'estorno_negado',
  // Compatibilidade com nomes antigos
  RECEIVED: 'pago',
  CONFIRMED: 'pago',
  OVERDUE: 'expirado',
  DELETED: 'cancelado',
  CANCELED: 'cancelado',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ASAAS_WEBHOOK_TOKEN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json(res, 200, { ok: true });

  if (ASAAS_WEBHOOK_TOKEN) {
    const token = req.headers['asaas-access-token'] || req.headers['x-asaas-token'] || req.headers.authorization;
    if (!token || String(token).replace('Bearer ', '') !== ASAAS_WEBHOOK_TOKEN) return json(res, 401, { ok: false });
  }

  const eventType = req.body?.event || 'unknown';
  const gatewayPaymentId = req.body?.payment?.id || null;
  const mappedStatus = STATUS_MAP[eventType] || 'pendente';

  console.info('[webhook/asaas] evento recebido', {
    eventType,
    gatewayPaymentId,
    mappedStatus,
    pagamentoEncontrado: Boolean(gatewayPaymentId),
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: pagamento } = gatewayPaymentId
    ? await supabase.from('music_pagamentos').select('*').eq('gateway_payment_id', gatewayPaymentId).maybeSingle()
    : { data: null };

  await supabase.from('music_payment_events').insert({
    pagamento_id: pagamento?.id || null,
    pedido_id: pagamento?.pedido_id || null,
    gateway: 'asaas',
    event_type: eventType,
    payload: req.body,
  });

  if (!pagamento) {
    console.info('[webhook/asaas] pagamento não encontrado', {
      eventType,
      gatewayPaymentId,
      mappedStatus,
      pagamentoEncontrado: false,
    });
    return json(res, 200, { ok: true });
  }

  console.info('[webhook/asaas] pagamento localizado', {
    eventType,
    gatewayPaymentId,
    mappedStatus,
    pagamentoEncontrado: true,
  });

  const updatePayload = { status: mappedStatus, updated_at: new Date().toISOString() };
  if (mappedStatus === 'pago') updatePayload.paid_at = new Date().toISOString();

  const { data: pagamentoAtualizado } = await supabase.from('music_pagamentos').update(updatePayload).eq('id', pagamento.id).select('*').single();

  if (mappedStatus === 'pago') {
    await supabase.from('music_pedidos').update({ status: 'pago' }).eq('id', pagamento.pedido_id);
    try {
      await supabase.from('music_audit_logs').insert([
        { tipo: 'pagamento', acao: 'pix_confirmado_webhook', tabela: 'music_pagamentos', registro_id: pagamento.id, descricao: `Webhook confirmou pagamento ${pagamento.gateway_payment_id}.`, depois: pagamentoAtualizado, origem: 'webhook' },
        { tipo: 'pedido', acao: 'pedido_marcado_como_pago_automaticamente', tabela: 'music_pedidos', registro_id: pagamento.pedido_id, descricao: `Pedido ${pagamento.pedido_id} marcado como pago automaticamente via Asaas.`, origem: 'webhook' },
      ]);
    } catch (error) {
      console.warn('[webhook/asaas] audit warn', error?.message || error);
    }
  }

  return json(res, 200, { ok: true });
}
