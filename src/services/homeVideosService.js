import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const HOME_VIDEOS_TABLE = 'music_home_videos';

export const DEFAULT_HOME_VIDEO_WHATSAPP_MESSAGE = 'Olá, vi no site da Allegro Music Store que chegaram novidades e gostaria de saber mais sobre os produtos disponíveis.';

export const defaultHomeVideos = [
  {
    id: 'default-reposicao-cordas',
    titulo: 'Reposição de cordas para violão',
    categoria: 'Cordas',
    descricao: 'Cordas de aço e nylon com reposição frequente para todos os níveis de músicos.',
    video_url: '',
    botao_texto: 'Ver produtos',
    botao_link: '/catalogo?categoria=Cordas',
    whatsapp_mensagem: '',
    ordem: 1,
    ativo: true,
  },
  {
    id: 'default-palhetas-acessorios',
    titulo: 'Palhetas e acessórios',
    categoria: 'Acessórios',
    descricao: 'Novas palhetas, correias, afinadores e itens essenciais para o dia a dia.',
    video_url: '',
    botao_texto: 'Ver produtos',
    botao_link: '/catalogo?categoria=Acessórios',
    whatsapp_mensagem: '',
    ordem: 2,
    ativo: true,
  },
  {
    id: 'default-cabos-conectores',
    titulo: 'Cabos e conectores',
    categoria: 'Áudio',
    descricao: 'Cabos P10, XLR e conectores de alta durabilidade para ensaios e apresentações.',
    video_url: '',
    botao_texto: 'Ver produtos',
    botao_link: '/catalogo?categoria=Áudio',
    whatsapp_mensagem: '',
    ordem: 3,
    ativo: true,
  },
  {
    id: 'default-iniciante-musicos',
    titulo: 'Produtos para músicos iniciantes',
    categoria: 'Iniciante',
    descricao: 'Kits acessíveis para começar com qualidade no estudo de música.',
    video_url: '',
    botao_texto: 'Ver produtos',
    botao_link: '/catalogo',
    whatsapp_mensagem: '',
    ordem: 4,
    ativo: true,
  },
  {
    id: 'default-servico-luteria',
    titulo: 'Serviço de luteria',
    categoria: 'Luteria',
    descricao: 'Ajustes, regulagem e cuidados técnicos para manter seu instrumento pronto para tocar.',
    video_url: 'https://www.instagram.com/reel/DXkefWWDV9_/?igsh=MWZpeHVtczU4ZjF0OQ==',
    botao_texto: 'Ver serviços',
    botao_link: '/servicos',
    whatsapp_mensagem: 'Olá, vi um vídeo de serviço de luteria no site da Allegro Music Store e gostaria de saber mais.',
    ordem: 5,
    ativo: true,
  },
];

export function normalizeHomeVideo(video = {}) {
  return {
    ...video,
    titulo: video?.titulo ?? '',
    categoria: video?.categoria ?? '',
    descricao: video?.descricao ?? '',
    video_url: video?.video_url ?? '',
    botao_texto: video?.botao_texto || 'Ver produtos',
    botao_link: video?.botao_link || '/catalogo',
    whatsapp_mensagem: video?.whatsapp_mensagem ?? '',
    ordem: Number.isFinite(Number(video?.ordem)) ? Number(video.ordem) : 0,
    ativo: video?.ativo ?? true,
  };
}

function sortByOrder(a, b) {
  const orderDifference = Number(a.ordem ?? 0) - Number(b.ordem ?? 0);
  if (orderDifference !== 0) return orderDifference;
  return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'pt-BR', { sensitivity: 'base' });
}

export async function getHomeVideos() {
  if (!isSupabaseConfigured || !supabase) {
    return defaultHomeVideos.map(normalizeHomeVideo).filter((video) => video.ativo).sort(sortByOrder);
  }

  const { data, error } = await supabase
    .from(HOME_VIDEOS_TABLE)
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[homeVideosService] fallback para cards locais:', error.message);
    return defaultHomeVideos.map(normalizeHomeVideo).filter((video) => video.ativo).sort(sortByOrder);
  }

  return (data ?? []).map(normalizeHomeVideo).filter((video) => video.ativo).sort(sortByOrder);
}
