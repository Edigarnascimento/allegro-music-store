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
  const footerText = storeSettings?.footer_text || 'Instrumentos, áudio e acessórios com atendimento consultivo e suporte pós-venda.';
  const atendimentoLinha1 = storeSettings?.atendimento_linha_1 || 'Segunda a sexta, das 8h às 18h';
  const atendimentoLinha2 = storeSettings?.atendimento_linha_2 || 'Sábado, das 8h às 18h';
  const footerPaymentNotice = storeSettings?.footer_payment_notice || 'Pagamentos via PIX e cartão online são processados com segurança.';
  const footerWhatsappLabel = storeSettings?.footer_whatsapp_label || 'Falar no WhatsApp';
  const logoUrl = storeSettings?.logo_url;
  const storeName = storeSettings?.nome_loja || 'Allegro Music Store';

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          {logoUrl ? <img className="footer-logo" src={logoUrl} alt={`Logo ${storeName}`} /> : null}
          <h3>{storeName}</h3>
          <p>{footerText}</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          <p>{atendimentoLinha1}</p>
          <p>{atendimentoLinha2}</p>
          <p>{footerPaymentNotice}</p>
        </div>
        <div>
          <h4>Contato rápido</h4>
          <a href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda com um pedido na Allegro Music Store.')} target="_blank" rel="noreferrer">{footerWhatsappLabel}</a>
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
