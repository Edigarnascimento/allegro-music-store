import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { createAuditLog } from './auditService';

const ORDERS_TABLE = 'music_pedidos';
const ORDER_ITEMS_TABLE = 'music_pedido_itens';
const STOCK_RETURNABLE_STATUSES = new Set(['cancelado', 'expirado', 'estornado']);

export async function createOrder({ customer, items, subtotal, total }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado para receber pedidos.');
  }

  const normalizedCustomer = {
    ...customer,
    documento: customer?.documento || customer?.cpf_cnpj || '',
  };

  const payload = {
    customer: normalizedCustomer,
    items,
    subtotal,
    total,
  };

  const { data, error } = await supabase.rpc('create_music_order', { payload });

  if (error) {
    console.error('create_music_order RPC failed', {
      message: error.message,
      hasDocumento: Boolean(normalizedCustomer?.documento?.trim()),
    });
    throw new Error(`Erro ao finalizar pedido: ${error.message || 'falha na função create_music_order.'}`);
  }

  const order = Array.isArray(data) ? data[0] : data;

  if (!order || !order.id) {
    throw new Error('Erro ao finalizar pedido: resposta inválida da função create_music_order.');
  }

  return order;
}

export async function getAdminOrders() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*, music_pagamentos(id, gateway, status, paid_at, payment_url)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOrderItems(orderId) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from(ORDER_ITEMS_TABLE).select('*').eq('pedido_id', orderId).order('created_at');
  if (error) return [];
  return data ?? [];
}

export async function updateOrderStatus(orderId, status) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: currentOrder, error: currentOrderError } = await supabase.from(ORDERS_TABLE).select('*').eq('id', orderId).single();
  if (currentOrderError) throw new Error(currentOrderError.message);

  const { data, error } = await supabase.from(ORDERS_TABLE).update({ status }).eq('id', orderId).select('*').single();
  if (error) throw new Error(error.message);

  const shouldReturnStock = STOCK_RETURNABLE_STATUSES.has(status);
  const stockAlreadyReturned = Boolean(currentOrder?.estoque_devolvido);

  if (shouldReturnStock && !stockAlreadyReturned) {
    const { data: stockReturnData, error: stockReturnError } = await supabase.rpc('return_order_stock', { order_id: orderId });

    if (stockReturnError) {
      throw new Error(stockReturnError.message || 'Falha ao devolver estoque do pedido.');
    }

    createAuditLog({
      tipo: 'estoque',
      acao: 'estoque_devolvido_por_cancelamento_manual',
      tabela: ORDERS_TABLE,
      registro_id: orderId,
      descricao: `Estoque devolvido automaticamente após alteração manual do status do pedido para "${status}".`,
      antes: { estoque_devolvido: currentOrder?.estoque_devolvido || false, status: currentOrder?.status },
      depois: {
        estoque_devolvido: true,
        estoque_devolvido_at: stockReturnData?.estoque_devolvido_at || null,
        status,
      },
      origem: 'admin',
    });
  }

  createAuditLog({
    tipo: 'pedido',
    acao: 'status_pedido_alterado',
    tabela: ORDERS_TABLE,
    registro_id: orderId,
    descricao: `Status do pedido alterado de "${currentOrder?.status || 'desconhecido'}" para "${data?.status || status}".`,
    antes: { status: currentOrder?.status },
    depois: { status: data?.status || status },
    origem: 'admin',
  });

  return data;
}


function normalizeOrderCode(orderCode) {
  return String(orderCode || '').trim().replace(/^#/, '');
}

export async function getPublicOrderStatus(orderCode, customerWhatsapp) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado para consulta pública de pedidos.');
  }

  const { data, error } = await supabase.rpc('get_public_order_status', {
    order_code: normalizeOrderCode(orderCode),
    customer_whatsapp: String(customerWhatsapp || '').trim(),
  });

  if (error) {
    throw new Error(error.message || 'Não foi possível consultar o pedido.');
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}
