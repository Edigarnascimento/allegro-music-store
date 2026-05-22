import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const CATEGORIES_TABLE = 'music_categorias';

const mockCategories = Array.from(new Set(mockProducts.map((product) => product.category))).map((category) => ({
  slug: category.toLowerCase(),
  name: category,
}));

export async function getCategories() {
  if (!isSupabaseConfigured || !supabase) {
    return mockCategories;
  }

  const { data, error } = await supabase.from(CATEGORIES_TABLE).select('*').order('name');

  if (error) {
    console.warn('[categoriesService] fallback para categorias mockadas:', error.message);
    return mockCategories;
  }

  return data?.length ? data : mockCategories;
}
