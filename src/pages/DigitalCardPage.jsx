import { useEffect } from 'react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { trackEvent } from '../services/analyticsService';

const storeSite = 'https://www.allegromusicstore.com.br';
const services = 'instrumentos, acessórios, luteria, partituras, arranjos e aulas';

function DigitalCardPage() {
  const storeSettings = useStoreSettings();
  const whatsappNumber = useStoreWhatsappNumber();
  const storeName = storeSettings?.nome_loja || 'Allegro Music Store';
  const logoUrl = storeSettings?.logo_url;
  const storeAddress = storeSettings?.endereco;
  const whatsappLink = buildWhatsAppLink(whatsappNumber, 'Olá, acessei o site da Allegro Music Store e gostaria de atendimento.');

  useEffect(() => {
    trackEvent('click_digital_card', { origem: 'digital_card_page_access' });
  }, []);

  return (
    <section className="digital-card-page section">
      <div className="container">
        <div className="digital-card" role="region" aria-label="Cartão digital Allegro Music Store">
          <div className="digital-card-brand">
            {logoUrl ? <img src={logoUrl} alt={`Logo ${storeName}`} /> : null}
            <div>
              <p className="digital-card-kicker">Cartão digital</p>
              <h1>{storeName}</h1>
            </div>
          </div>

          <div className="digital-card-info-grid">
            <div className="digital-card-info">
              <h2>Contato e localização</h2>
              <ul>
                <li>
                  <strong>Site:</strong>{' '}
                  <a href={storeSite} target="_blank" rel="noreferrer">{storeSite}</a>
                </li>
                <li>
                  <strong>WhatsApp:</strong>{' '}
                  <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp', { origem: 'digital_card_contact' })}>{whatsappNumber}</a>
                </li>
                {storeAddress ? <li><strong>Endereço:</strong> {storeAddress}</li> : null}
                <li>
                  <strong>Serviços:</strong> {services}
                </li>
              </ul>
            </div>

            <div className="digital-card-qr-wrap" aria-label="QR Codes para acesso rápido">
              <div className="digital-card-qr">
                <h3>QR Code do site</h3>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(storeSite)}`}
                  alt="QR Code para acessar o site da Allegro Music Store"
                  loading="lazy"
                />
              </div>
              <div className="digital-card-qr">
                <h3>QR Code do WhatsApp</h3>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(whatsappLink)}`}
                  alt="QR Code para conversar no WhatsApp da Allegro Music Store"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="digital-card-actions" aria-label="Ações do cartão digital">
            <a className="btn" href={storeSite} target="_blank" rel="noreferrer">Comprar na loja online</a>
            <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp', { origem: 'digital_card_actions' })}>Falar no WhatsApp</a>
            <a className="btn btn-secondary" href="/servicos" onClick={() => trackEvent('click_services', { origem: 'digital_card_actions' })}>Ver serviços musicais</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalCardPage;
