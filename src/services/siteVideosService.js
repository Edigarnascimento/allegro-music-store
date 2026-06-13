import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export const SITE_VIDEOS_TABLE = 'music_videos_site';

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

export const defaultSiteVideos = [];

export function normalizeSiteVideo(video = {}) {
  return {
    ...video,
    titulo: video?.titulo ?? '',
    descricao: video?.descricao ?? '',
    categoria: video?.categoria ?? '',
    video_url: video?.video_url ?? '',
    thumbnail_url: video?.thumbnail_url ?? '',
    ordem: Number.isFinite(Number(video?.ordem)) ? Number(video.ordem) : 0,
    ativo: video?.ativo ?? true,
  };
}

export function getYouTubeVideoId(videoUrl = '') {
  if (!videoUrl) return '';

  try {
    const url = new URL(videoUrl.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase()) && !YOUTUBE_HOSTS.has(hostname)) return '';

    if (hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';

    const watchId = url.searchParams.get('v');
    if (watchId) return watchId;

    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts.findIndex((part) => ['shorts', 'embed', 'live'].includes(part));
    if (embedIndex >= 0) return parts[embedIndex + 1] || '';
  } catch {
    return '';
  }

  return '';
}

export function getYouTubeEmbedUrl(videoUrl = '') {
  const videoId = getYouTubeVideoId(videoUrl);
  return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : '';
}

export function getYouTubeThumbnailUrl(videoUrl = '') {
  const videoId = getYouTubeVideoId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : '';
}

function sortByOrder(a, b) {
  const orderDifference = Number(a.ordem ?? 0) - Number(b.ordem ?? 0);
  if (orderDifference !== 0) return orderDifference;
  return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'pt-BR', { sensitivity: 'base' });
}

export async function getSiteVideos({ limit = 5 } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return defaultSiteVideos.map(normalizeSiteVideo).filter((video) => video.ativo).sort(sortByOrder).slice(0, limit);
  }

  const { data, error } = await supabase
    .from(SITE_VIDEOS_TABLE)
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.warn('[siteVideosService] fallback para vídeos locais:', error.message);
    return defaultSiteVideos.map(normalizeSiteVideo).filter((video) => video.ativo).sort(sortByOrder).slice(0, limit);
  }

  return (data ?? []).map(normalizeSiteVideo).filter((video) => video.ativo).sort(sortByOrder).slice(0, limit);
}
