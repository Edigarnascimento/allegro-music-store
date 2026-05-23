const DEFAULT_WHATSAPP_NUMBER = '5511999999999';

function sanitizeWhatsappNumber(value) {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

export function resolveWhatsappNumber(...candidates) {
  for (const candidate of candidates) {
    const sanitized = sanitizeWhatsappNumber(candidate);
    if (sanitized) return sanitized;
  }

  return DEFAULT_WHATSAPP_NUMBER;
}

export function formatPriceBRL(value) {
  return `R$ ${Number(value ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildWhatsAppLink(number, message) {
  return `https://wa.me/${resolveWhatsappNumber(number)}?text=${encodeURIComponent(message)}`;
}
