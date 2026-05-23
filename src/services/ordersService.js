import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
const ORDERS_TABLE = 'music_pedidos';
const ORDER_ITEMS_TABLE = 'music_pedido_itens';
export async function createOrder({ customer, items, subtotal, total }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado para receber pedidos.');
  }

  const payload = {
    customer,
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
export async function getAdminOrders() { if (!isSupabaseConfigured || !supabase) return []; const { data, error } = await supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false }); if (error) return []; return data ?? []; }
export async function getOrderItems(orderId) { if (!isSupabaseConfigured || !supabase) return []; const { data, error } = await supabase.from(ORDER_ITEMS_TABLE).select('*').eq('pedido_id', orderId).order('created_at'); if (error) return []; return data ?? []; }
export async function updateOrderStatus(orderId, status) { if (!isSupabaseConfigured || !supabase) return null; const { data, error } = await supabase.from(ORDERS_TABLE).update({ status }).eq('id', orderId).select('*').single(); if (error) throw new Error(error.message); return data; }
