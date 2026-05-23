import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const STORE_SETTINGS_TABLE = 'music_configuracoes_loja';

const mockStoreSettings = {
  nome_loja: 'Allegro Music Store',
  whatsapp: '5511999999999',
  instagram: '',
  endereco: '',
  horario_funcionamento: '',
  sobre: '',
  logo_url: '',
};

export async function getStoreSettings() {
  if (!isSupabaseConfigured || !supabase) {
    return mockStoreSettings;
  }

  const { data, error } = await supabase
    .from(STORE_SETTINGS_TABLE)
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[storeSettingsService] fallback para configuração local:', error.message);
    return mockStoreSettings;
  }

  return data ?? mockStoreSettings;
}
