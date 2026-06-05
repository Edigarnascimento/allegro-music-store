import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/PublicButtonIcons';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

function ContactPage() {
  const whatsappNumber = useStoreWhatsappNumber();
  const storeSettings = useStoreSettings();
  const contactEmail = storeSettings?.email || storeSettings?.contato_email;

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Contato' }]} />
      <div className="section-heading">
        <h1>Contato da Allegro Music Store</h1>
        <p className="subtitle">Fale com a Allegro Music Store para comprar produtos musicais, solicitar orçamento de serviços, tirar dúvidas sobre instrumentos, acessórios, luteria, aulas, partituras e arranjos.</p>
      </div>
      <div className="contact-layout">
        <div className="contact-card">
          <h2>Atendimento pelo WhatsApp, loja física e online</h2>
          <p><strong>WhatsApp:</strong> {whatsappNumber}</p>
          {contactEmail ? (
            <p><strong>E-mail:</strong> {contactEmail}</p>
          ) : (
            <p><strong>E-mail:</strong> Atendimento principal pelo WhatsApp</p>
          )}
          {storeSettings?.endereco ? <p><strong>Endereço:</strong> {storeSettings.endereco}</p> : null}
          {storeSettings?.horario_funcionamento ? <p><strong>Horário:</strong> {storeSettings.horario_funcionamento}</p> : null}
          {storeSettings?.instagram ? <p><strong>Instagram:</strong> {storeSettings.instagram}</p> : null}
          {storeSettings?.sobre ? <p><strong>Atendimento:</strong> {storeSettings.sobre}</p> : null}
          <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, 'Olá, acessei o site da Allegro Music Store e gostaria de atendimento sobre produtos musicais, serviços ou aulas.')} target="_blank" rel="noreferrer"><WhatsAppIcon /><span>Chamar no WhatsApp</span></a>
        </div>
        <div className="contact-card">
          <h2>Como podemos ajudar</h2>
          <ul className="details-benefits">
            <li>Orientação para violões, guitarras, cordas, acessórios musicais e áudio profissional</li>
            <li>Orçamentos de luteria, regulagem de instrumentos, partituras e arranjos musicais</li>
            <li>Informações sobre aulas de violão, teclado e flauta doce</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
