import { products as mockProducts } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const CATEGORIES_TABLE = 'music_categorias';

const defaultCategoryNames = ['Cordas', 'Teclas', 'Bateria', 'Áudio', 'Acessórios'];

const mockCategories = Array.from(new Set(mockProducts.map((product) => product.category)))
  .filter(Boolean)
  .map((category) => ({
    slug: category.toLowerCase(),
    nome: category,
    ativo: true,
  }));

const fallbackCategories = defaultCategoryNames.map((name) => ({ nome: name, ativo: true }));

function normalizeCategory(category) {
  const name = (category?.nome ?? category?.name ?? '').trim();
  return {
    ...category,
    nome: name,
    name,
    descricao: (category?.descricao ?? '').trim(),
    ativo: category?.ativo ?? true,
  };
}

function sortByName(a, b) {
  return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
}

export async function getCategories() {
  if (!isSupabaseConfigured || !supabase) {
    return [...mockCategories, ...fallbackCategories].map(normalizeCategory).sort(sortByName);
  }

  const { data, error } = await supabase.from(CATEGORIES_TABLE).select('*').eq('ativo', true).order('nome');

  if (error) {
    console.warn('[categoriesService] fallback para categorias mockadas:', error.message);
    return [...mockCategories, ...fallbackCategories].map(normalizeCategory).sort(sortByName);
  }

  const normalized = (data ?? []).map(normalizeCategory).filter((category) => category.ativo && category.nome).sort(sortByName);
  return normalized.length ? normalized : [...mockCategories, ...fallbackCategories].map(normalizeCategory).sort(sortByName);
}
