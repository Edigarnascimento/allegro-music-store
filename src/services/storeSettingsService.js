import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const STORE_SETTINGS_TABLE = 'music_configuracoes_loja';

const mockStoreSettings = {
  nome_loja: 'Allegro Music Store',
  whatsapp: '5591985284572',
  instagram: '@allegromusic',
  endereco: 'Rua Padre Cícero, 22 Mercado Municipal Paragominas - Pará',
  horario_funcionamento: 'Segunda a sábado, das 8h às 18h',
  sobre: '',
  email: '',
  logo_url: '',
  footer_text: 'Instrumentos, áudio e acessórios com atendimento consultivo e suporte pós-venda.',
  atendimento_linha_1: 'Segunda a sexta, das 8h às 18h',
  atendimento_linha_2: 'Sábado, das 8h às 18h',
  footer_payment_notice: 'Pagamentos via PIX e cartão online são processados com segurança.',
  footer_whatsapp_label: 'Falar no WhatsApp',
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
