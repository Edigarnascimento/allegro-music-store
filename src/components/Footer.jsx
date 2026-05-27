import { NavLink } from 'react-router-dom';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

const institutionalLinks = [
  { label: 'Política de Privacidade', to: '/institucional/privacidade' },
  { label: 'Trocas e Devoluções', to: '/institucional/trocas' },
  { label: 'Formas de Pagamento', to: '/institucional/pagamento' },
  { label: 'Entrega e Retirada', to: '/institucional/entrega' },
  { label: 'Sobre a Loja', to: '/institucional/sobre' },
  { label: 'Acompanhar pedido', to: '/acompanhar-pedido' },
];

function Footer() {
  const whatsappNumber = useStoreWhatsappNumber();
  const storeSettings = useStoreSettings();
  const contactEmail = storeSettings?.email || storeSettings?.contato_email;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>{storeSettings?.nome_loja || 'Allegro Music Store'}</h3>
          <p>Instrumentos, áudio e acessórios com atendimento consultivo e suporte pós-venda.</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          {storeSettings?.horario_funcionamento ? <p>{storeSettings.horario_funcionamento}</p> : <p>Consulte os horários pelo WhatsApp.</p>}
          <p>Pedidos via PIX são confirmados após validação manual do pagamento.</p>
        </div>
        <div>
          <h4>Contato rápido</h4>
          <a href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda com um pedido na Allegro Music Store.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
          {storeSettings?.endereco ? <p>{storeSettings.endereco}</p> : null}
          {contactEmail ? <p>{contactEmail}</p> : <p>Atendimento principal pelo WhatsApp</p>}
        </div>
        <div>
          <h4>Institucional</h4>
          {institutionalLinks.map((link) => (
            <p key={link.to}><NavLink to={link.to}>{link.label}</NavLink></p>
          ))}
        </div>
      </div>
      <div className="container footer-copy">© {new Date().getFullYear()} Allegro Music Store — Todos os direitos reservados.</div>
    </footer>
  );
}

export default Footer;
