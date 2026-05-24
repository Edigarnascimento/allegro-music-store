import { createClient } from '@supabase/supabase-js';

function json(res, status, payload) { res.status(status).json(payload); }

async function safeAudit(supabase, payload) {
  try { await supabase.from('music_audit_logs').insert(payload); } catch (error) { console.warn('[asaas/create-pix] audit warn', error?.message || error); }
}

function safeStringify(value) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return String(value);
  }
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***';
  const visibleLocal = localPart.slice(0, 2);
  return `${visibleLocal}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '***';
  if (digits.length <= 4) return `${'*'.repeat(Math.max(digits.length - 2, 0))}${digits.slice(-2)}`;
  return `${digits.slice(0, 2)}***${digits.slice(-2)}`;
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function maskDocument(document) {
  const digits = onlyDigits(document);
  if (!digits) return null;
  if (digits.length <= 4) return `***${digits.slice(-2)}`;
  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

function buildPaymentLogPayload(paymentPayload) {
  return {
    billingType: paymentPayload?.billingType || null,
    value: paymentPayload?.value || null,
    dueDate: paymentPayload?.dueDate || null,
    externalReference: paymentPayload?.externalReference || null,
    hasCustomer: Boolean(paymentPayload?.customer),
    customerPreview: paymentPayload?.customer ? `${String(paymentPayload.customer).slice(0, 6)}***` : null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, message: 'Method not allowed' });
  const { ASAAS_API_KEY, ASAAS_API_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!ASAAS_API_KEY || !ASAAS_API_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return json(res, 200, { ok: false, reason: 'fallback_manual', message: 'PIX automático não configurado. Use o PIX manual.' });
  }
  const pedidoId = req.body?.pedido_id;
  if (!pedidoId) return json(res, 400, { ok: false, reason: 'invalid_request', message: 'pedido_id obrigatório.' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: pedido, error: pedidoError } = await supabase.from('music_pedidos').select('*').eq('id', pedidoId).single();
  if (pedidoError || !pedido) return json(res, 404, { ok: false, reason: 'order_not_found', message: 'Pedido não encontrado.' });
  if (String(pedido.status || '').toLowerCase() === 'pago') return json(res, 409, { ok: false, reason: 'already_paid', message: 'Pedido já pago.' });

  try {
    const logAsaasWarning = ({ stage, status, body }) => {
      const bodyString = safeStringify(body);
      console.warn('[asaas/create-pix] asaas warning', {
        etapa: stage,
        status_http: status || null,
        code: body?.code || null,
        description: body?.description || null,
        message: body?.message || null,
        errors: body?.errors || null,
        status: body?.status || null,
        body: body || null,
        response_body: bodyString,
      });
    };

    const customerPayload = {
      name: pedido.cliente_nome || `Cliente ${String(pedido.id).slice(0, 8)}`,
      email: pedido.cliente_email || undefined,
      mobilePhone: pedido.cliente_whatsapp || undefined,
      phone: pedido.cliente_whatsapp || undefined,
      cpfCnpj: onlyDigits(pedido.cliente_documento) || undefined,
    };

    if (!customerPayload.cpfCnpj) {
      console.warn('[asaas/create-pix] fallback manual', {
        etapa: 'validate_customer_document',
        pedido_id: pedido.id,
        reason: 'missing_cpf_cnpj',
      });
      return json(res, 200, { ok: false, reason: 'fallback_manual', message: 'Falha ao gerar PIX automático. Use o PIX manual.' });
    }

    const customerResp = await fetch(`${ASAAS_API_URL}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', access_token: ASAAS_API_KEY }, body: JSON.stringify(customerPayload) });
    const customerData = await customerResp.json();
    const customerId = customerData?.id;
    if (!customerResp.ok || !customerId) {
      logAsaasWarning({ stage: 'create_customer', status: customerResp.status, body: customerData });
      throw new Error('Falha ao criar cliente Asaas');
    }

    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: Number(pedido.total || 0),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      externalReference: pedido.id,
      description: `Pedido Allegro #${String(pedido.id).slice(0, 8)}`,
    };

    console.info('[asaas/create-pix] create_payment request', {
      payload: buildPaymentLogPayload(paymentPayload),
      customer_contact: {
        email_masked: maskEmail(pedido.cliente_email),
        phone_masked: maskPhone(pedido.cliente_whatsapp),
        document_masked: maskDocument(pedido.cliente_documento),
      },
    });

    const chargeResp = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', access_token: ASAAS_API_KEY }, body: JSON.stringify(paymentPayload)
    });
    const chargeData = await chargeResp.json();
    if (!chargeResp.ok || !chargeData?.id) {
      console.warn('[asaas/create-pix] create_payment failed', {
        status_http: chargeResp.status,
        code: chargeData?.code || null,
        description: chargeData?.description || null,
        message: chargeData?.message || null,
        errors: chargeData?.errors || null,
        status: chargeData?.status || null,
        body: chargeData || null,
        response_body: safeStringify(chargeData),
      });
      logAsaasWarning({ stage: 'create_payment', status: chargeResp.status, body: chargeData });
      throw new Error('Falha ao criar cobrança PIX Asaas');
    }

    let qrData = {};
    // TODO: confirmar endpoint e campos oficiais na documentação atual da Asaas para QR Code Pix.
    const qrResp = await fetch(`${ASAAS_API_URL}/payments/${chargeData.id}/pixQrCode`, { headers: { access_token: ASAAS_API_KEY } });
    if (qrResp.ok) {
      qrData = await qrResp.json();
    } else {
      const qrErrorBody = await qrResp.json().catch(() => null);
      logAsaasWarning({ stage: 'get_qr_code', status: qrResp.status, body: qrErrorBody });
    }

    const paymentRow = {
      pedido_id: pedido.id,
      gateway: 'asaas',
      gateway_payment_id: chargeData.id,
      metodo: 'pix',
      status: 'pendente',
      valor: Number(pedido.total || 0),
      qr_code_pix: qrData?.encodedImage || qrData?.payload || null,
      copia_cola_pix: qrData?.payload || null,
      expires_at: chargeData?.dueDate ? `${chargeData.dueDate}T23:59:59Z` : null,
      raw_response: { charge: chargeData, qr: qrData },
    };

    const { data: saved, error: saveError } = await supabase.from('music_pagamentos').insert(paymentRow).select('*').single();
    if (saveError || !saved) {
      console.warn('[asaas/create-pix] supabase insert warning', {
        etapa: 'insert_payment',
        message: saveError?.message || null,
        details: saveError?.details || null,
        hint: saveError?.hint || null,
        code: saveError?.code || null,
      });
      throw new Error('Falha ao salvar pagamento no Supabase');
    }

    await safeAudit(supabase, { tipo: 'pagamento', acao: 'pix_criado', tabela: 'music_pagamentos', registro_id: saved?.id || null, descricao: `Pagamento PIX criado para pedido ${pedido.id}.`, depois: saved || paymentRow, origem: 'serverless' });

    return json(res, 200, { ok: true, payment_id: saved?.id, status: saved?.status || 'pendente', qr_code: saved?.qr_code_pix || null, qr_code_text: saved?.copia_cola_pix || null, expires_at: saved?.expires_at || null });
  } catch (error) {
    console.warn('[asaas/create-pix] fallback manual', { etapa: 'fallback_manual', error: error?.message || error });
    return json(res, 200, { ok: false, reason: 'fallback_manual', message: 'Falha ao gerar PIX automático. Use o PIX manual.' });
  }
}
