const ORDER_STATUS_LABELS = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  enviado: 'Enviado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const DELIVERY_METHOD_LABELS = {
  retirada_na_loja: 'Retirada na loja',
  entrega: 'Entrega',
  delivery: 'Entrega',
  correios: 'Correios',
  transportadora: 'Transportadora',
};

const PAYMENT_METHOD_LABELS = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

function getValueOrFallback(value) {
  if (value === null || value === undefined) return 'Não informado';
  if (typeof value === 'string' && value.trim() === '') return 'Não informado';
  return value;
}

export function formatOrderStatus(status) {
  const normalized = getValueOrFallback(status);
  if (normalized === 'Não informado') return normalized;
  return ORDER_STATUS_LABELS[normalized] ?? normalized;
}

export function formatDeliveryMethod(formaEntrega) {
  const normalized = getValueOrFallback(formaEntrega);
  if (normalized === 'Não informado') return normalized;
  return DELIVERY_METHOD_LABELS[normalized] ?? normalized;
}

export function formatPaymentMethod(formaPagamento) {
  const normalized = getValueOrFallback(formaPagamento);
  if (normalized === 'Não informado') return normalized;
  return PAYMENT_METHOD_LABELS[normalized] ?? normalized;
}

export function formatCurrencyBRL(valor) {
  return `R$ ${Number(valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getFormattedValueOrFallback(value) {
  return getValueOrFallback(value);
}
