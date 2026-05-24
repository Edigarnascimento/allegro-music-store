import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { createAuditLog } from './auditService';

const PRODUCTS_TABLE = 'music_produtos';
const CATEGORIES_TABLE = 'music_categorias';
const STORE_SETTINGS_TABLE = 'music_configuracoes_loja';
const ORDERS_TABLE = 'music_pedidos';
const ORDER_ITEMS_TABLE = 'music_pedido_itens';
const INTERESTS_TABLE = 'music_interesses';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOW_STOCK_THRESHOLD = 5;
const PAID_STATUSES = new Set(['pago', 'concluido']);

const PRODUCT_IMAGES_BUCKET = 'product-images';

function getProductImagePath(file) {
  const safeName = (file?.name || 'image').toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
  return `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
}

export async function uploadProductImage(file) {
  if (!file) throw new Error('Selecione uma imagem antes de enviar.');
  if (!file.type?.startsWith('image/')) throw new Error('Apenas arquivos de imagem são permitidos.');

  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file);
  }

  const path = getProductImagePath(file);

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

function sanitizeCategoryPayload(payload = {}) {
  return {
    nome: payload?.nome ?? '',
    ativo: payload?.ativo ?? true,
  };
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
    chave_pix: payload?.chave_pix ?? '',
    nome_recebedor_pix: payload?.nome_recebedor_pix ?? '',
    banco_pix: payload?.banco_pix ?? '',
    instrucoes_pix: payload?.instrucoes_pix ?? '',
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStartOfTodayIso() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

function aggregateByProduct(rows = []) {
  const acc = new Map();

  rows.forEach((row) => {
    const name = row?.produto_nome || 'Produto não identificado';
    const current = acc.get(name) || { produto: name, quantidade: 0, total: 0, interesses: 0 };
    current.quantidade += toNumber(row?.quantidade || row?.qtde || 1);
    current.total += toNumber(row?.subtotal || row?.total || 0);
    current.interesses += 1;
    acc.set(name, current);
  });

  return Array.from(acc.values());
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
  const [produtos, pedidos, pedidoItens, interesses] = await Promise.all([
    getAdminProducts(),
    getAdminOrdersRaw(),
    getOrderItemsRaw(),
    getInterestsRaw(),
  ]);

  const pedidosPagosOuConcluidos = pedidos.filter((pedido) => PAID_STATUSES.has(String(pedido?.status || '').toLowerCase()));
  const produtosAtivos = produtos.filter((produto) => produto?.ativo !== false);
  const lowStockProducts = produtosAtivos.filter((produto) => toNumber(produto?.estoque) > 0 && toNumber(produto?.estoque) <= LOW_STOCK_THRESHOLD);
  const outOfStockProducts = produtosAtivos.filter((produto) => toNumber(produto?.estoque) <= 0);

  const totalPedidos = pedidos.reduce((acc, pedido) => acc + toNumber(pedido?.total), 0);
  const ticketMedio = pedidos.length ? totalPedidos / pedidos.length : 0;

  const startOfToday = getStartOfTodayIso();
  const pedidosHoje = pedidos.filter((pedido) => (pedido?.created_at || '') >= startOfToday);
  const faturamentoHoje = pedidosHoje
    .filter((pedido) => PAID_STATUSES.has(String(pedido?.status || '').toLowerCase()))
    .reduce((acc, pedido) => acc + toNumber(pedido?.total), 0);

  const pedidosPorStatus = {
    novos: pedidos.filter((pedido) => String(pedido?.status || '').toLowerCase() === 'novo').length,
    pagos: pedidos.filter((pedido) => String(pedido?.status || '').toLowerCase() === 'pago').length,
    concluidos: pedidos.filter((pedido) => String(pedido?.status || '').toLowerCase() === 'concluido').length,
  };

  const vendidos = aggregateByProduct(pedidoItens)
    .sort((a, b) => b.quantidade - a.quantidade)
    .map((item) => ({ produto: item.produto, quantidade: item.quantidade, total: item.total }));

  const interessesPorProduto = aggregateByProduct(interesses)
    .sort((a, b) => b.interesses - a.interesses)
    .map((item) => ({ produto: item.produto, interesses: item.interesses }));

  return {
    cards: {
      totalEmPedidos: totalPedidos,
      pedidosNovos: pedidosPorStatus.novos,
      pedidosPagos: pedidosPorStatus.pagos,
      pedidosConcluidos: pedidosPorStatus.concluidos,
      ticketMedio,
      totalProdutosAtivos: produtosAtivos.length,
      produtosEstoqueBaixo: lowStockProducts.length,
      produtosIndisponiveis: outOfStockProducts.length,
    },
    comerciais: {
      produtoMaisVendido: vendidos[0]?.produto || 'Sem vendas registradas',
      produtoMaisProcurado: interessesPorProduto[0]?.produto || 'Sem interesses registrados',
      totalInteressesWhatsapp: interesses.length,
      pedidosDoDia: pedidosHoje.length,
      faturamentoDoDia: faturamentoHoje,
      totalPedidosPagosOuConcluidos: pedidosPagosOuConcluidos.length,
    },
    listas: {
      ultimosPedidos: pedidos.slice(0, 5),
      produtosEstoqueBaixo: lowStockProducts.slice(0, 5),
      produtosIndisponiveis: outOfStockProducts.slice(0, 5),
      produtosMaisVendidos: vendidos.slice(0, 5),
      produtosMaisInteressados: interessesPorProduto.slice(0, 5),
    },
  };
}

async function getAdminOrdersRaw() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

async function getOrderItemsRaw() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from(ORDER_ITEMS_TABLE).select('*');
  if (error) return [];
  return data ?? [];
}

async function getInterestsRaw() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from(INTERESTS_TABLE).select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
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

  createAuditLog({
    tipo: 'produto',
    acao: 'produto_criado',
    tabela: PRODUCTS_TABLE,
    registro_id: data?.id,
    descricao: `Produto "${data?.nome || payload?.nome || 'sem nome'}" criado.`,
    depois: data,
    origem: 'admin',
  });

  return data;
}

export async function updateAdminProduct(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    localProducts = localProducts.map((item) => (String(item.id) === String(id) ? { ...item, ...payload } : item));
    return localProducts.find((item) => String(item.id) === String(id));
  }

  const previous = await getAdminProductById(id);
  const { data, error } = await supabase.from(PRODUCTS_TABLE).update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);

  const isStockChange = Object.prototype.hasOwnProperty.call(payload || {}, 'estoque')
    && Number(previous?.estoque ?? 0) !== Number(data?.estoque ?? 0);

  createAuditLog({
    tipo: 'produto',
    acao: 'produto_editado',
    tabela: PRODUCTS_TABLE,
    registro_id: data?.id,
    descricao: `Produto "${data?.nome || previous?.nome || 'sem nome'}" editado.`,
    antes: previous,
    depois: data,
    origem: 'admin',
  });

  if (isStockChange) {
    createAuditLog({
      tipo: 'estoque',
      acao: 'alteracao_estoque_manual',
      tabela: PRODUCTS_TABLE,
      registro_id: data?.id,
      descricao: `Estoque manual alterado para "${data?.nome || previous?.nome || 'sem nome'}".`,
      antes: { estoque: previous?.estoque },
      depois: { estoque: data?.estoque },
      origem: 'admin',
    });
  }

  return data;
}

export async function deleteAdminProduct(productId) {
  if (!productId) throw new Error('Produto inválido para exclusão.');

  if (!isSupabaseConfigured || !supabase) {
    localProducts = localProducts.filter((item) => String(item.id) !== String(productId));
    return true;
  }

  const [{ count: pedidosCount, error: pedidoError }, { count: interessesCount, error: interesseError }] = await Promise.all([
    supabase.from(ORDER_ITEMS_TABLE).select('id', { count: 'exact', head: true }).eq('produto_id', productId),
    supabase.from(INTERESTS_TABLE).select('id', { count: 'exact', head: true }).eq('produto_id', productId),
  ]);

  if (pedidoError) throw new Error(`Não foi possível validar pedidos vinculados: ${pedidoError.message}`);
  if (interesseError) throw new Error(`Não foi possível validar interesses vinculados: ${interesseError.message}`);

  if ((pedidosCount || 0) > 0 || (interessesCount || 0) > 0) {
    throw new Error('Este produto já possui histórico de pedidos ou interesses. Para preservar o histórico, use a opção Inativar.');
  }

  const previous = await getAdminProductById(productId);
  const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', productId);
  if (error) throw new Error(error.message);

  createAuditLog({
    tipo: 'produto',
    acao: 'produto_excluido',
    tabela: PRODUCTS_TABLE,
    registro_id: productId,
    descricao: `Produto "${previous?.nome || 'sem nome'}" excluído.`,
    antes: previous,
    origem: 'admin',
  });

  return true;
}

export async function deleteOrDeactivateProduct(id, hardDelete = false) {
  if (!hardDelete) {
    if (!isSupabaseConfigured || !supabase) {
      localProducts = localProducts.map((item) => (String(item.id) === String(id) ? { ...item, ativo: false } : item));
      return true;
    }

    const previous = await getAdminProductById(id);
    const { data, error } = await supabase.from(PRODUCTS_TABLE).update({ ativo: false }).eq('id', id).select().single();
    if (error) throw new Error(error.message);

    createAuditLog({
      tipo: 'produto',
      acao: 'produto_inativado',
      tabela: PRODUCTS_TABLE,
      registro_id: id,
      descricao: `Produto "${data?.nome || previous?.nome || 'sem nome'}" inativado.`,
      antes: previous,
      depois: data,
      origem: 'admin',
    });

    return true;
  }

  return deleteAdminProduct(id);
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
  const sanitizedPayload = sanitizeCategoryPayload(payload);

  if (!isSupabaseConfigured || !supabase) {
    const item = { ...sanitizedPayload, id: `mock-category-${Date.now()}` };
    localCategories = [item, ...localCategories];
    return item;
  }

  const { data, error } = await supabase.from(CATEGORIES_TABLE).insert(sanitizedPayload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminCategory(id, payload) {
  const sanitizedPayload = sanitizeCategoryPayload(payload);

  if (!isSupabaseConfigured || !supabase) {
    localCategories = localCategories.map((item) => (String(item.id) === String(id) ? { ...item, ...sanitizedPayload } : item));
    return true;
  }

  const { error } = await supabase.from(CATEGORIES_TABLE).update(sanitizedPayload).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteAdminCategory(id) {
  if (!isSupabaseConfigured || !supabase) {
    localCategories = localCategories.filter((item) => String(item.id) !== String(id));
    return true;
  }

  const { error } = await supabase.from(CATEGORIES_TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getStoreSettings() {
  if (!isSupabaseConfigured || !supabase) return localSettings;

  const { data, error } = await supabase.from(STORE_SETTINGS_TABLE).select('*').limit(1).maybeSingle();
  if (error) {
    console.warn('[adminService] fallback configurações mockadas:', error.message);
    return localSettings;
  }

  return data ?? localSettings;
}

export async function upsertStoreSettings(payload) {
  const sanitizedPayload = sanitizeStoreSettingsPayload(payload);

  if (!isSupabaseConfigured || !supabase) {
    localSettings = { ...localSettings, ...sanitizedPayload };
    return localSettings;
  }

  const existing = await getStoreSettings();

  if (existing?.id && isValidUuid(existing.id)) {
    const { data, error } = await supabase
      .from(STORE_SETTINGS_TABLE)
      .update(sanitizedPayload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.from(STORE_SETTINGS_TABLE).insert(sanitizedPayload).select().single();
  if (error) throw new Error(error.message);
  return data;
}


export async function getAdminStoreSettings() {
  return getStoreSettings();
}

export async function updateAdminStoreSettings(payload) {
  const before = await getAdminStoreSettings();
  const updated = await upsertStoreSettings(payload);

  const safeBefore = {
    nome_loja: before?.nome_loja,
    whatsapp: before?.whatsapp,
    instagram: before?.instagram,
    endereco: before?.endereco,
    horario_funcionamento: before?.horario_funcionamento,
    sobre: before?.sobre,
    logo_url: before?.logo_url,
    chave_pix: before?.chave_pix ? '***' : null,
    nome_recebedor_pix: before?.nome_recebedor_pix,
    banco_pix: before?.banco_pix,
  };
  const safeAfter = {
    nome_loja: updated?.nome_loja,
    whatsapp: updated?.whatsapp,
    instagram: updated?.instagram,
    endereco: updated?.endereco,
    horario_funcionamento: updated?.horario_funcionamento,
    sobre: updated?.sobre,
    logo_url: updated?.logo_url,
    chave_pix: updated?.chave_pix ? '***' : null,
    nome_recebedor_pix: updated?.nome_recebedor_pix,
    banco_pix: updated?.banco_pix,
  };

  createAuditLog({
    tipo: 'configuracoes',
    acao: 'configuracoes_loja_alteradas',
    tabela: STORE_SETTINGS_TABLE,
    registro_id: updated?.id || 'store_settings',
    descricao: 'Configurações da loja alteradas no painel administrativo.',
    antes: safeBefore,
    depois: safeAfter,
    origem: 'admin',
  });

  return updated;
}
