import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { createAuditLog } from './auditService';

const ORDERS_TABLE = 'music_pedidos';
const ORDER_ITEMS_TABLE = 'music_pedido_itens';

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

  const { data, error } = await supabase.rpc('create_music_order', payload);

  if (error) {
    throw new Error(`Erro ao finalizar pedido: ${error.message}`);
  }

  if (!data) {
    throw new Error('Erro ao finalizar pedido: resposta vazia da função create_music_order.');
  }

  return data;
}

export async function getAdminOrders() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*, music_pagamentos(id, gateway, status, paid_at)')
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


export async function getPublicOrderStatus(orderCode, customerWhatsapp) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado para consulta pública de pedidos.');
  }

  const { data, error } = await supabase.rpc('get_public_order_status', {
    order_code: orderCode,
    customer_whatsapp: customerWhatsapp,
  });

  if (error) {
    throw new Error(error.message || 'Não foi possível consultar o pedido.');
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}
