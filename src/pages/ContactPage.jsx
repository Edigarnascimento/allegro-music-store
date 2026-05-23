import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

function ContactPage() {
  const whatsappNumber = useStoreWhatsappNumber();

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Contato' }]} />
      <div className="section-heading">
        <h1>Contato</h1>
        <p className="subtitle">Atendimento consultivo para compras, serviços e pós-venda.</p>
      </div>
      <div className="contact-layout">
        <div className="contact-card">
          <h2>Fale com um especialista</h2>
          <p><strong>WhatsApp:</strong> Atendimento oficial pelo botão abaixo</p>
          <p><strong>E-mail:</strong> contato@allegromusicstore.com</p>
          <p><strong>Endereço:</strong> Atendimento sob agendamento em São Paulo - SP</p>
          <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, 'Olá! Gostaria de informações sobre a Allegro Music Store.')} target="_blank" rel="noreferrer"><WhatsAppIcon /><span>Chamar no WhatsApp</span></a>
        </div>
        <div className="contact-card">
          <h2>Atendimento confiável</h2>
          <ul className="details-benefits">
            <li>Orientação por perfil musical e orçamento</li>
            <li>Atualizações do pedido também pelo WhatsApp</li>
            <li>Confirmação de estoque e disponibilidade pela equipe</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
