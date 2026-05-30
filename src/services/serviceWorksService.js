import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const SERVICE_WORKS_TABLE = 'music_trabalhos_realizados';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const SERVICE_WORKS_FOLDER = 'services/works';
const ALLOWED_SERVICE_WORK_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const placeholderServiceWorks = [
  { titulo: 'Antes e depois de regulagem', descricao: 'Comparativo visual do instrumento após regulagem e ajustes de tocabilidade.', categoria: 'Luteria', ordem: 1, ativo: true },
  { titulo: 'Troca de cordas', descricao: 'Substituição completa com calibres adequados para seu estilo e instrumento.', categoria: 'Luteria', ordem: 2, ativo: true },
  { titulo: 'Ajuste técnico', descricao: 'Correções de ação, oitavas e conforto para melhor desempenho.', categoria: 'Luteria', ordem: 3, ativo: true },
  { titulo: 'Retífica de trastes', descricao: 'Nivelamento para eliminar trastejamento e melhorar a afinação.', categoria: 'Luteria', ordem: 4, ativo: true },
  { titulo: 'Escrita de partitura', descricao: 'Material personalizado para estudo, ensaio e apresentação.', categoria: 'Partituras', ordem: 5, ativo: true },
  { titulo: 'Arranjo musical', descricao: 'Criação de arranjos para formações diversas com foco musical e prático.', categoria: 'Arranjos', ordem: 6, ativo: true },
  { titulo: 'Aulas e prática musical', descricao: 'Momentos de aprendizado com foco em evolução técnica e musicalidade.', categoria: 'Aulas', ordem: 7, ativo: true },
];

let localServiceWorks = [];

function sortServiceWorks(a, b) {
  const orderDifference = Number(a.ordem ?? 0) - Number(b.ordem ?? 0);
  if (orderDifference !== 0) return orderDifference;
  return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'pt-BR', { sensitivity: 'base' });
}

function normalizeServiceWork(work = {}) {
  return {
    id: work.id,
    titulo: String(work.titulo ?? '').trim(),
    descricao: String(work.descricao ?? '').trim(),
    categoria: String(work.categoria ?? '').trim(),
    imagem_url: String(work.imagem_url ?? '').trim(),
    ordem: Number.isFinite(Number(work.ordem)) ? Number(work.ordem) : 0,
    ativo: work.ativo ?? true,
    created_at: work.created_at,
    updated_at: work.updated_at,
  };
}

function sanitizeServiceWorkPayload(payload = {}) {
  return {
    titulo: String(payload.titulo ?? '').trim(),
    descricao: String(payload.descricao ?? '').trim(),
    categoria: String(payload.categoria ?? '').trim(),
    imagem_url: String(payload.imagem_url ?? '').trim(),
    ordem: Number.isFinite(Number(payload.ordem)) ? Number(payload.ordem) : 0,
    ativo: payload.ativo ?? true,
  };
}

function getImageUploadPath(file) {
  const safeName = (file?.name || 'image').toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
  return `${SERVICE_WORKS_FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
}

export function getPlaceholderServiceWorks() {
  return placeholderServiceWorks.map((work, index) => normalizeServiceWork({ ...work, id: `placeholder-work-${index + 1}` }));
}

export async function getActiveServiceWorks() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from(SERVICE_WORKS_TABLE)
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[serviceWorksService] fallback para placeholders:', error.message);
    return [];
  }

  return (data ?? []).map(normalizeServiceWork).sort(sortServiceWorks);
}

export async function getAdminServiceWorks() {
  if (!isSupabaseConfigured || !supabase) return localServiceWorks.map(normalizeServiceWork).sort(sortServiceWorks);

  const { data, error } = await supabase
    .from(SERVICE_WORKS_TABLE)
    .select('*')
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[serviceWorksService] fallback trabalhos realizados local:', error.message);
    return localServiceWorks.map(normalizeServiceWork).sort(sortServiceWorks);
  }

  return (data ?? []).map(normalizeServiceWork).sort(sortServiceWorks);
}

export async function createAdminServiceWork(payload) {
  const sanitizedPayload = sanitizeServiceWorkPayload(payload);
  if (!sanitizedPayload.titulo) throw new Error('Informe o título do trabalho realizado.');

  if (!isSupabaseConfigured || !supabase) {
    const item = normalizeServiceWork({
      ...sanitizedPayload,
      id: `mock-service-work-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    localServiceWorks = [item, ...localServiceWorks].sort(sortServiceWorks);
    return item;
  }

  const { data, error } = await supabase.from(SERVICE_WORKS_TABLE).insert(sanitizedPayload).select().single();
  if (error) throw new Error(error.message);
  return normalizeServiceWork(data);
}

export async function updateAdminServiceWork(id, payload) {
  if (!id) throw new Error('Trabalho inválido para edição.');
  const sanitizedPayload = { ...sanitizeServiceWorkPayload(payload), updated_at: new Date().toISOString() };
  if (!sanitizedPayload.titulo) throw new Error('Informe o título do trabalho realizado.');

  if (!isSupabaseConfigured || !supabase) {
    localServiceWorks = localServiceWorks.map((item) => (String(item.id) === String(id) ? normalizeServiceWork({ ...item, ...sanitizedPayload }) : item));
    return localServiceWorks.find((item) => String(item.id) === String(id));
  }

  const { data, error } = await supabase.from(SERVICE_WORKS_TABLE).update(sanitizedPayload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeServiceWork(data);
}

export async function deleteAdminServiceWork(id) {
  if (!id) throw new Error('Trabalho inválido para exclusão.');

  if (!isSupabaseConfigured || !supabase) {
    localServiceWorks = localServiceWorks.filter((item) => String(item.id) !== String(id));
    return true;
  }

  const { error } = await supabase.from(SERVICE_WORKS_TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function uploadServiceWorkImage(file) {
  if (!file) throw new Error('Selecione uma imagem antes de enviar.');
  if (!file.type?.startsWith('image/')) throw new Error('Apenas arquivos de imagem são permitidos.');
  if (!ALLOWED_SERVICE_WORK_IMAGE_TYPES.has(file.type)) throw new Error('Envie imagens nos formatos PNG, JPG/JPEG ou WEBP.');

  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file);
  }

  const path = getImageUploadPath(file);
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw new Error(`Falha no upload da imagem: ${uploadError.message}`);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Não foi possível gerar URL pública para a imagem enviada.');

  return data.publicUrl;
}
