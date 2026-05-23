import { NavLink } from 'react-router-dom';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

const institutionalLinks = [
  { label: 'Política de Privacidade', to: '/institucional/privacidade' },
  { label: 'Trocas e Devoluções', to: '/institucional/trocas' },
  { label: 'Formas de Pagamento', to: '/institucional/pagamento' },
  { label: 'Entrega e Retirada', to: '/institucional/entrega' },
  { label: 'Sobre a Loja', to: '/institucional/sobre' },
];

function Footer() {
  const whatsappNumber = useStoreWhatsappNumber();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Allegro Music Store</h3>
          <p>Instrumentos, áudio e acessórios com atendimento consultivo e suporte pós-venda.</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          <p>Seg a Sex: 9h às 19h</p>
          <p>Sáb: 9h às 15h</p>
          <p>Pedidos via PIX são confirmados após validação manual do pagamento.</p>
        </div>
        <div>
          <h4>Contato rápido</h4>
          <a href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda com um pedido na Allegro Music Store.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
          <p>contato@allegromusicstore.com</p>
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
