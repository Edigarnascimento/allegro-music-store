import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const PRODUCTS_TABLE = 'music_produtos';

export async function getProducts() {
  if (!isSupabaseConfigured || !supabase) {
    return mockProducts;
  }

  const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*').order('name');

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

  return data ?? mockProducts.find((product) => product.id === productId) ?? null;
}
