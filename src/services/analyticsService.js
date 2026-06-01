import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const ANALYTICS_TABLE = 'music_analytics_events';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const DEDUPE_WINDOW_MS = 1000;
const PAGE_VIEW_EVENTS = new Set(['page_view_home', 'page_view_product']);
const SENSITIVE_KEYS = ['cpf', 'documento', 'telefone', 'phone', 'whatsapp', 'email', 'pagamento', 'payment', 'endereco', 'address'];

const lastEvents = new Map();

function isBrowser() {
  return typeof window !== 'undefined';
}

function getPagePath() {
  if (!isBrowser()) return '';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isAdminPath(path = getPagePath()) {
  return String(path || '').startsWith('/admin');
}

function isValidUuid(value) {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

function hasSensitiveKey(key) {
  const normalized = String(key || '').toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => normalized.includes(sensitiveKey));
}

function sanitizeMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};

  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (hasSensitiveKey(key)) return acc;
    if (value === null || value === undefined) return acc;

    if (['string', 'number', 'boolean'].includes(typeof value)) {
      acc[key] = typeof value === 'string' ? value.slice(0, 200) : value;
      return acc;
    }

    if (Array.isArray(value)) {
      acc[key] = value.slice(0, 10).map((item) => (typeof item === 'string' ? item.slice(0, 120) : item));
      return acc;
    }

    return acc;
  }, {});
}

function shouldSkipDuplicate(eventName, payload) {
  const now = Date.now();
  const key = [eventName, payload.page_path, payload.produto_id || '', payload.produto_nome || ''].join('|');
  const lastTrackedAt = lastEvents.get(key) || 0;

  lastEvents.set(key, now);
  return now - lastTrackedAt < DEDUPE_WINDOW_MS;
}

export function buildAnalyticsPayload(eventName, metadata = {}) {
  const pagePath = metadata.page_path || getPagePath();
  const produtoId = isValidUuid(metadata.produto_id) ? metadata.produto_id : null;
  const produtoNome = metadata.produto_nome ? String(metadata.produto_nome).slice(0, 200) : null;
  const cleanMetadata = sanitizeMetadata(metadata);

  delete cleanMetadata.page_path;
  delete cleanMetadata.produto_id;
  delete cleanMetadata.produto_nome;

  return {
    event_name: String(eventName || '').trim(),
    page_path: pagePath,
    produto_id: produtoId,
    produto_nome: produtoNome,
    metadata: cleanMetadata,
    user_agent: isBrowser() ? window.navigator.userAgent : null,
  };
}

export function trackEvent(eventName, metadata = {}) {
  if (!eventName || !isSupabaseConfigured || !supabase) return;

  const payload = buildAnalyticsPayload(eventName, metadata);
  if (!payload.event_name || isAdminPath(payload.page_path) || shouldSkipDuplicate(eventName, payload)) return;

  supabase
    .from(ANALYTICS_TABLE)
    .insert(payload)
    .then(({ error }) => {
      if (error) {
        console.debug('[analyticsService] Evento não registrado:', error.message);
      }
    })
    .catch((error) => {
      console.debug('[analyticsService] Evento não registrado:', error?.message || error);
    });
}

function getStartOfDay(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getPeriodStart(days) {
  const start = getStartOfDay();
  start.setDate(start.getDate() - (Number(days) - 1));
  return start;
}

function countEvents(events, predicate) {
  return events.filter(predicate).length;
}

function aggregateBy(events, getKey, getLabel = getKey) {
  const totals = new Map();

  events.forEach((event) => {
    const key = getKey(event);
    if (!key) return;

    const current = totals.get(key) || { key, label: getLabel(event), total: 0 };
    current.total += 1;
    totals.set(key, current);
  });

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

function emptyAnalyticsStats() {
  return {
    cards: {
      visitasHoje: 0,
      visitas7Dias: 0,
      visitas30Dias: 0,
      cliquesWhatsapp: 0,
      cliquesCarrinho: 0,
      cliquesCheckout: 0,
    },
    rankings: {
      produtosMaisAcessados: [],
      eventosMaisFrequentes: [],
    },
    events: [],
  };
}

export async function getAnalyticsDashboardStats(periodDays = 7) {
  if (!isSupabaseConfigured || !supabase) return emptyAnalyticsStats();

  const thirtyDaysAgo = getPeriodStart(30).toISOString();
  const { data, error } = await supabase
    .from(ANALYTICS_TABLE)
    .select('id,event_name,page_path,produto_id,produto_nome,metadata,user_agent,created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    console.warn('[analyticsService] Falha ao carregar analytics:', error.message);
    return emptyAnalyticsStats();
  }

  const events = data ?? [];
  const todayStart = getStartOfDay().toISOString();
  const sevenDaysStart = getPeriodStart(7).toISOString();
  const selectedStart = getPeriodStart(periodDays).toISOString();
  const periodEvents = events.filter((event) => (event.created_at || '') >= selectedStart);
  const pageViews = events.filter((event) => PAGE_VIEW_EVENTS.has(event.event_name));
  const periodPageViews = periodEvents.filter((event) => PAGE_VIEW_EVENTS.has(event.event_name));

  return {
    cards: {
      visitasHoje: countEvents(pageViews, (event) => (event.created_at || '') >= todayStart),
      visitas7Dias: countEvents(pageViews, (event) => (event.created_at || '') >= sevenDaysStart),
      visitas30Dias: pageViews.length,
      cliquesWhatsapp: countEvents(periodEvents, (event) => event.event_name === 'click_whatsapp'),
      cliquesCarrinho: countEvents(periodEvents, (event) => event.event_name === 'click_cart'),
      cliquesCheckout: countEvents(periodEvents, (event) => event.event_name === 'click_checkout'),
    },
    rankings: {
      produtosMaisAcessados: aggregateBy(
        periodPageViews.filter((event) => event.event_name === 'page_view_product'),
        (event) => event.produto_id || event.produto_nome,
        (event) => event.produto_nome || event.produto_id || 'Produto sem nome',
      ).slice(0, 8),
      eventosMaisFrequentes: aggregateBy(periodEvents, (event) => event.event_name).slice(0, 10),
    },
    events: periodEvents,
  };
}
