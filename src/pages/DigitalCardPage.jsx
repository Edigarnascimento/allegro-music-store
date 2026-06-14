import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { trackEvent } from '../services/analyticsService';

const storeSite = 'https://www.allegromusicstore.com.br';
const services = 'instrumentos musicais, acessórios, áudio profissional, luteria, partituras, arranjos e aulas';
const whatsappMessage = 'Olá, acessei o cartão digital da Allegro Music Store no clima da Copa e gostaria de atendimento.';

function DigitalCardPage() {
  const storeSettings = useStoreSettings();
  const whatsappNumber = useStoreWhatsappNumber();
  const storeName = storeSettings?.nome_loja || 'Allegro Music Store';
  const logoUrl = storeSettings?.logo_url;
  const storeAddress = storeSettings?.endereco;
  const storeHours = storeSettings?.horario_funcionamento;
  const storeInstagram = storeSettings?.instagram;
  const contactEmail = storeSettings?.email || storeSettings?.contato_email;
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const locationLink = storeAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`
    : storeSite;

  useEffect(() => {
    trackEvent('click_digital_card', { origem: 'digital_card_page_access' });
  }, []);

  return (
    <section className="digital-card-page section">
      <div className="digital-card-confetti" aria-hidden="true" />
      <div className="container">
        <div className="digital-card" role="region" aria-label="Cartão digital Allegro Music Store no clima da Copa">
          <div className="digital-card-field-lines" aria-hidden="true" />
          <div className="digital-card-ball" aria-hidden="true">
            <span />
          </div>

          <div className="digital-card-brand">
            {logoUrl ? <img src={logoUrl} alt={`Logo ${storeName}`} /> : null}
            <div>
              <p className="digital-card-kicker">Cartão digital • Brasil em campo</p>
              <h1>Allegro Music Store</h1>
              <p className="digital-card-subtitle">Loja física e online para quem vive a música</p>
            </div>
          </div>

          <div className="digital-card-campaign-callout">
            <strong>Entre no clima da Copa</strong>
            <p>Entre no clima da Copa com produtos musicais, acessórios, áudio, serviços e atendimento especial.</p>
          </div>

          <div className="digital-card-info-grid">
            <div className="digital-card-info">
              <h2>Contato e localização</h2>
              <ul>
                <li>
                  <strong>Loja:</strong> {storeName}
                </li>
                <li>
                  <strong>Site:</strong>{' '}
                  <a href={storeSite} target="_blank" rel="noreferrer">{storeSite}</a>
                </li>
                <li>
                  <strong>WhatsApp:</strong>{' '}
                  <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp', { origem: 'digital_card_contact' })}>{whatsappNumber}</a>
                </li>
                {storeAddress ? <li><strong>Endereço:</strong> {storeAddress}</li> : null}
                {storeHours ? <li><strong>Horário:</strong> {storeHours}</li> : null}
                {storeInstagram ? <li><strong>Instagram:</strong> {storeInstagram}</li> : null}
                {contactEmail ? <li><strong>E-mail:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></li> : null}
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
            <Link className="btn btn-main digital-card-primary-btn" to="/catalogo" onClick={() => trackEvent('click_catalog', { origem: 'digital_card_actions' })}>Ver catálogo</Link>
            <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp', { origem: 'digital_card_actions' })}>Falar no WhatsApp</a>
            <Link className="btn btn-secondary" to="/servicos" onClick={() => trackEvent('click_services', { origem: 'digital_card_actions' })}>Ver serviços</Link>
            <a className="btn btn-secondary" href={locationLink} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_location', { origem: 'digital_card_actions' })}>Localização</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalCardPage;
