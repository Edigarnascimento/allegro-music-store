import { useEffect, useState } from 'react';
import { getStoreSettings } from '../services/storeSettingsService';

const defaultSettings = {
  nome_loja: 'Allegro Music Store',
  whatsapp: '',
  instagram: '',
  endereco: '',
  horario_funcionamento: '',
  sobre: '',
  email: '',
  contato_email: '',
  logo_url: '',
};

export function useStoreSettings() {
  const [storeSettings, setStoreSettings] = useState(defaultSettings);

  useEffect(() => {
    let isMounted = true;

    async function loadStoreSettings() {
      try {
        const settings = await getStoreSettings();
        if (!isMounted) return;

        setStoreSettings({
          ...defaultSettings,
          ...(settings || {}),
        });
      } catch (error) {
        if (!isMounted) return;
        setStoreSettings(defaultSettings);
      }
    }

    loadStoreSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return storeSettings;
}
