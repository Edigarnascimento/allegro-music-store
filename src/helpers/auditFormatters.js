const AUDIT_TYPE_LABELS = {
  configuracoes: 'Configurações',
  produto: 'Produto',
  pedido: 'Pedido',
  estoque: 'Estoque',
};

const AUDIT_ACTION_LABELS = {
  configuracoes_loja_alteradas: 'Configurações da loja alteradas',
  status_pedido_alterado: 'Status do pedido alterado',
  produto_inativado: 'Produto inativado',
  produto_editado: 'Produto editado',
  alteracao_estoque_manual: 'Alteração manual de estoque',
};

const AUDIT_ORIGIN_LABELS = {
  admin: 'Painel administrativo',
  sistema: 'Sistema',
  api: 'API',
};

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function humanizeFallback(value) {
  const normalized = normalizeValue(value);

  if (!normalized) return '-';

  return normalized
    .split('_')
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function formatAuditType(tipo) {
  const normalized = normalizeValue(tipo);
  return AUDIT_TYPE_LABELS[normalized] || humanizeFallback(tipo);
}

export function formatAuditAction(acao) {
  const normalized = normalizeValue(acao);
  return AUDIT_ACTION_LABELS[normalized] || humanizeFallback(acao);
}

export function formatAuditOrigin(origem) {
  const normalized = normalizeValue(origem || 'admin');
  return AUDIT_ORIGIN_LABELS[normalized] || humanizeFallback(origem || 'admin');
}

export function getAuditBadgeClassByType(tipo) {
  const normalized = normalizeValue(tipo);

  if (normalized === 'pedido') return 'audit-badge--pedido';
  if (normalized === 'estoque') return 'audit-badge--estoque';
  if (normalized === 'configuracoes') return 'audit-badge--configuracoes';

  return 'audit-badge--produto';
}
