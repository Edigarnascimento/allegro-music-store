import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const PRODUCTS_TABLE = 'music_produtos';
const CATEGORIES_TABLE = 'music_categorias';
const STORE_SETTINGS_TABLE = 'music_configuracoes_loja';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const mockSettings = {
  id: 'mock-store-settings',
  nome_loja: 'Allegro Music Store',
  whatsapp: '5511999999999',
  instagram: '@allegromusicstore',
  endereco: 'Rua das Cordas, 123 - São Paulo, SP',
  horario_funcionamento: 'Segunda a Sexta, 09:00 às 18:00',
  sobre: 'Loja especializada em instrumentos musicais e acessórios.',
  logo_url: '',
};

function normalizeMockProduct(product) {
  return {
    id: product.id,
    nome: product.name,
    descricao: product.description || product.shortDescription || '',
    preco: Number(product.price) || 0,
    categoria: product.category,
    imagem_url: product.image,
    destaque: false,
    ativo: true,
    estoque: 0,
  };
}

let localProducts = mockProducts.map(normalizeMockProduct);
let localCategories = Array.from(new Set(localProducts.map((p) => p.categoria))).map((categoria, index) => ({
  id: `mock-cat-${index + 1}`,
  nome: categoria,
  slug: categoria.toLowerCase().replace(/\s+/g, '-'),
  ativo: true,
}));
let localSettings = { ...mockSettings };

function isValidUuid(value) {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

function sanitizeStoreSettingsPayload(payload = {}) {
  return {
    nome_loja: payload?.nome_loja ?? '',
    whatsapp: payload?.whatsapp ?? '',
    instagram: payload?.instagram ?? '',
    endereco: payload?.endereco ?? '',
    horario_funcionamento: payload?.horario_funcionamento ?? '',
    sobre: payload?.sobre ?? '',
    logo_url: payload?.logo_url ?? '',
  };
}

export async function signInAdmin({ email, password }) {
  if (!isSupabaseConfigured || !supabase) {
    if (email && password) {
      return { user: { email, role: 'mock-admin' }, isMock: true };
    }
    throw new Error('Informe e-mail e senha para acessar o modo mockado.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user, isMock: false };
}

export async function signOutAdmin() {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}

export async function getAdminSession() {
  if (!isSupabaseConfigured || !supabase) {
    return { user: { email: 'admin@mock.local' }, isMock: true };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return { user: data.session?.user ?? null, isMock: false };
}

export async function getAdminDashboardStats() {
  const [produtos, categorias] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return {
    totalProdutos: produtos.length,
    produtosAtivos: produtos.filter((p) => p.ativo).length,
    produtosDestaque: produtos.filter((p) => p.destaque).length,
    totalCategorias: categorias.length,
  };
}

export async function getAdminProducts() {
  if (!isSupabaseConfigured || !supabase) return localProducts;

  const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*').order('nome');
  if (error) {
    console.warn('[adminService] fallback produtos mockados:', error.message);
    return localProducts;
  }
  return data?.length ? data : localProducts;
}

export async function getAdminProductById(id) {
  const products = await getAdminProducts();
  return products.find((item) => String(item.id) === String(id)) ?? null;
}

export async function createAdminProduct(payload) {
  if (!isSupabaseConfigured || !supabase) {
    const newProduct = { ...payload, id: `mock-prod-${Date.now()}` };
    localProducts = [newProduct, ...localProducts];
    return newProduct;
  }

  const { data, error } = await supabase.from(PRODUCTS_TABLE).insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminProduct(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    localProducts = localProducts.map((item) => (String(item.id) === String(id) ? { ...item, ...payload } : item));
    return localProducts.find((item) => String(item.id) === String(id));
  }

  const { data, error } = await supabase.from(PRODUCTS_TABLE).update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrDeactivateProduct(id, hardDelete = false) {
  if (!isSupabaseConfigured || !supabase) {
    if (hardDelete) {
      localProducts = localProducts.filter((item) => String(item.id) !== String(id));
      return true;
    }
    localProducts = localProducts.map((item) => (String(item.id) === String(id) ? { ...item, ativo: false } : item));
    return true;
  }

  if (hardDelete) {
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  const { error } = await supabase.from(PRODUCTS_TABLE).update({ ativo: false }).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getAdminCategories() {
  if (!isSupabaseConfigured || !supabase) return localCategories;

  const { data, error } = await supabase.from(CATEGORIES_TABLE).select('*').order('nome');
  if (error) {
    console.warn('[adminService] fallback categorias mockadas:', error.message);
    return localCategories;
  }

  return data?.length ? data : localCategories;
}

export async function createAdminCategory(payload) {
  if (!isSupabaseConfigured || !supabase) {
    const item = { ...payload, id: `mock-category-${Date.now()}` };
    localCategories = [item, ...localCategories];
    return item;
  }

  const { data, error } = await supabase.from(CATEGORIES_TABLE).insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminCategory(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    localCategories = localCategories.map((item) => (String(item.id) === String(id) ? { ...item, ...payload } : item));
    return true;
  }

  const { error } = await supabase.from(CATEGORIES_TABLE).update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getAdminStoreSettings() {
  if (!isSupabaseConfigured || !supabase) return localSettings;

  const { data, error } = await supabase.from(STORE_SETTINGS_TABLE).select('*').limit(1).maybeSingle();
  if (error) {
    console.warn('[adminService] fallback configurações locais:', error.message);
    return sanitizeStoreSettingsPayload(localSettings);
  }

  if (!data) {
    return sanitizeStoreSettingsPayload(localSettings);
  }

  return {
    id: isValidUuid(data.id) ? data.id : undefined,
    ...sanitizeStoreSettingsPayload(data),
  };
}

export async function updateAdminStoreSettings(payload) {
  const sanitizedPayload = sanitizeStoreSettingsPayload(payload);

  if (!isSupabaseConfigured || !supabase) {
    localSettings = { ...localSettings, ...sanitizedPayload };
    return localSettings;
  }

  const { data: existingSettings, error: readError } = await supabase
    .from(STORE_SETTINGS_TABLE)
    .select('id')
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error(`Não foi possível consultar as configurações atuais: ${readError.message}`);
  }

  const existingId = existingSettings?.id;
  if (!isValidUuid(existingId)) {
    const { data, error } = await supabase.from(STORE_SETTINGS_TABLE).insert(sanitizedPayload).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from(STORE_SETTINGS_TABLE)
    .update(sanitizedPayload)
    .eq('id', existingId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
