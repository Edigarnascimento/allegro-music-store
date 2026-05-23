import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
const ORDERS_TABLE = 'music_pedidos';
const ORDER_ITEMS_TABLE = 'music_pedido_itens';
const PRODUCTS_TABLE = 'music_produtos';
export async function createOrder({ customer, items, subtotal, total }) { if (!isSupabaseConfigured || !supabase) throw new Error('Supabase não está configurado para receber pedidos.');
  const productIds = items.map((item) => item.id);
  const { data: stockRows, error: stockError } = await supabase.from(PRODUCTS_TABLE).select('id,nome,estoque').in('id', productIds);
  if (stockError) throw new Error(`Erro ao validar estoque: ${stockError.message}`);
  const stockById = new Map((stockRows ?? []).map((row) => [row.id, row]));
  for (const item of items) {
    const stockRow = stockById.get(item.id);
    if (!stockRow) throw new Error(`Produto não encontrado para validação de estoque: ${item.nome}.`);
    if (Number.isFinite(Number(stockRow.estoque)) && Number(stockRow.estoque) < Number(item.quantidade)) throw new Error(`Estoque insuficiente para ${item.nome}. Disponível: ${stockRow.estoque}.`);
  }
  const { data: order, error: orderError } = await supabase.from(ORDERS_TABLE).insert({ cliente_nome: customer.nome, cliente_whatsapp: customer.whatsapp, cliente_email: customer.email || null, endereco_entrega: customer.endereco, observacoes: customer.observacoes || null, forma_entrega: customer.formaEntrega, forma_pagamento: customer.formaPagamento, subtotal, total, status: 'novo' }).select('*').single(); if (orderError) throw new Error(orderError.message);
  const payload = items.map((item) => ({ pedido_id: order.id, produto_id: item.id, produto_nome: item.nome, categoria: item.categoria, quantidade: item.quantidade, preco_unitario: item.preco, subtotal: item.preco * item.quantidade })); const { error: itemsError } = await supabase.from(ORDER_ITEMS_TABLE).insert(payload); if (itemsError) throw new Error(itemsError.message);
  for (const item of items) {
    const current = stockById.get(item.id);
    if (!Number.isFinite(Number(current?.estoque))) continue;
    const nextStock = Number(current.estoque) - Number(item.quantidade);
    if (nextStock < 0) throw new Error(`Atualização de estoque inválida para ${item.nome}.`);
    const { error: updateError } = await supabase.from(PRODUCTS_TABLE).update({ estoque: nextStock }).eq('id', item.id).gte('estoque', Number(item.quantidade));
    if (updateError) throw new Error(`Erro ao atualizar estoque de ${item.nome}: ${updateError.message}`);
  }
 return order; }
export async function getAdminOrders() { if (!isSupabaseConfigured || !supabase) return []; const { data, error } = await supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false }); if (error) return []; return data ?? []; }
export async function getOrderItems(orderId) { if (!isSupabaseConfigured || !supabase) return []; const { data, error } = await supabase.from(ORDER_ITEMS_TABLE).select('*').eq('pedido_id', orderId).order('created_at'); if (error) return []; return data ?? []; }
export async function updateOrderStatus(orderId, status) { if (!isSupabaseConfigured || !supabase) return null; const { data, error } = await supabase.from(ORDERS_TABLE).update({ status }).eq('id', orderId).select('*').single(); if (error) throw new Error(error.message); return data; }
