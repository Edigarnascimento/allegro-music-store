import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const PRODUCTS_TABLE = 'music_produtos';
const PRODUCT_IMAGES_TABLE = 'music_produto_imagens';

function normalizeGalleryImages(images = []) {
  return images
    .filter((image) => image?.image_url)
    .sort((a, b) => Number(a.ordem ?? 0) - Number(b.ordem ?? 0));
}

async function getProductImages(productId) {
  if (!productId || !isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from(PRODUCT_IMAGES_TABLE)
    .select('*')
    .eq('produto_id', productId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[productsService] galeria indisponível para o produto:', error.message);
    return [];
  }

  return normalizeGalleryImages(data ?? []);
}

export async function getProducts() {
  if (!isSupabaseConfigured || !supabase) {
    return mockProducts;
  }

  const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*').order('nome');

  if (error) {
    console.warn('[productsService] fallback para dados mockados:', error.message);
    return mockProducts;
  }

  return data?.length ? data : mockProducts;
}

export async function getProductById(productId) {
  if (!isSupabaseConfigured || !supabase) {
    return mockProducts.find((product) => product.id === productId) ?? null;
  }

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    console.warn('[productsService] fallback para produto mockado:', error.message);
    return mockProducts.find((product) => product.id === productId) ?? null;
  }

  const fallbackProduct = mockProducts.find((product) => product.id === productId) ?? null;
  const product = data ?? fallbackProduct;
  if (!product) return null;

  const imagens = data ? await getProductImages(product.id) : [];
  return { ...product, imagens };
}
