import { createClient } from '@supabase/supabase-js';

function json(res, status, payload) { res.status(status).json(payload); }
function onlyDigits(value) { return String(value || '').replace(/\D/g, ''); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, message: 'Method not allowed' });
  const { ASAAS_API_KEY, ASAAS_API_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!ASAAS_API_KEY || !ASAAS_API_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return json(res, 503, { ok: false, reason: 'not_configured', message: 'Pagamento online indisponível no momento.' });
  }

  const pedidoId = req.body?.pedido_id;
  const metodo = req.body?.metodo;
  if (!pedidoId) return json(res, 400, { ok: false, reason: 'invalid_request', message: 'pedido_id obrigatório.' });
  if (!['cartao_credito_online', 'cartao_debito_online'].includes(metodo)) {
    return json(res, 400, { ok: false, reason: 'invalid_method', message: 'Método de pagamento inválido.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: pedido, error: pedidoError } = await supabase.from('music_pedidos').select('*').eq('id', pedidoId).single();
  if (pedidoError || !pedido) return json(res, 404, { ok: false, reason: 'order_not_found', message: 'Pedido não encontrado.' });

  try {
    const customerPayload = {
      name: pedido.cliente_nome || `Cliente ${String(pedido.id).slice(0, 8)}`,
      email: pedido.cliente_email || undefined,
      mobilePhone: pedido.cliente_whatsapp || undefined,
      phone: pedido.cliente_whatsapp || undefined,
      cpfCnpj: onlyDigits(pedido.cliente_documento) || undefined,
    };

    const customerResp = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', access_token: ASAAS_API_KEY }, body: JSON.stringify(customerPayload),
    });
    const customerData = await customerResp.json();
    if (!customerResp.ok || !customerData?.id) throw new Error('Falha ao criar cliente Asaas');

    const billingType = 'UNDEFINED';
    const paymentPayload = {
      customer: customerData.id,
      billingType,
      chargeType: 'DETACHED',
      value: Number(pedido.total || 0),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      externalReference: pedido.id,
      description: `Pedido Allegro #${String(pedido.id).slice(0, 8)}`,
    };

    const chargeResp = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', access_token: ASAAS_API_KEY }, body: JSON.stringify(paymentPayload),
    });
    const chargeData = await chargeResp.json();
    if (!chargeResp.ok || !chargeData?.id) throw new Error('Falha ao criar cobrança Asaas');

    const paymentUrl = chargeData?.invoiceUrl || chargeData?.bankSlipUrl || chargeData?.checkoutUrl || chargeData?.paymentLink || null;
    const paymentRow = {
      pedido_id: pedido.id,
      gateway: 'asaas',
      gateway_payment_id: chargeData.id,
      metodo,
      status: 'pendente',
      valor: Number(pedido.total || 0),
      payment_url: paymentUrl,
      raw_response: { charge: chargeData },
    };

    const { data: saved, error: saveError } = await supabase.from('music_pagamentos').insert(paymentRow).select('*').single();
    if (saveError || !saved) throw new Error('Falha ao salvar pagamento no Supabase');

    return json(res, 200, {
      ok: true,
      payment_id: saved.id,
      status: saved.status || 'pendente',
      payment_url: saved.payment_url || null,
      invoice_url: saved.payment_url || null,
    });
  } catch (error) {
    return json(res, 200, { ok: false, reason: 'card_payment_unavailable', message: 'Não foi possível gerar o link de pagamento agora.' });
  }
}
