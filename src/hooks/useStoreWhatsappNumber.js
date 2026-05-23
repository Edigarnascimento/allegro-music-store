import { useEffect, useState } from 'react';
import { getStoreSettings } from '../services/storeSettingsService';
import { resolveWhatsappNumber } from '../lib/whatsapp';

export function useStoreWhatsappNumber() {
  const [whatsappNumber, setWhatsappNumber] = useState(resolveWhatsappNumber());

  useEffect(() => {
    let isMounted = true;

    async function loadStoreSettings() {
      try {
        const settings = await getStoreSettings();
        if (!isMounted) return;

        setWhatsappNumber(
          resolveWhatsappNumber(
            settings?.whatsapp,
          ),
        );
      } catch (error) {
        if (!isMounted) return;
        setWhatsappNumber(resolveWhatsappNumber());
      }
    }

    loadStoreSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return whatsappNumber;
}
