import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const STORE_SETTINGS_TABLE = 'music_configuracoes_loja';

const mockStoreSettings = {
  storeName: 'Allegro Music Store',
  whatsappNumber: '5511999999999',
  supportEmail: 'contato@allegromusicstore.com.br',
  adminPanelEnabled: false,
};

export async function getStoreSettings() {
  if (!isSupabaseConfigured || !supabase) {
    return mockStoreSettings;
  }

  const { data, error } = await supabase
    .from(STORE_SETTINGS_TABLE)
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.warn('[storeSettingsService] fallback para configuração local:', error.message);
    return mockStoreSettings;
  }

  return data ?? mockStoreSettings;
}
