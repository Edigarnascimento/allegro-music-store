import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { useCart } from '../context/CartContext';

const quickLinks = [
  { label: 'Serviços', to: '/servicos' },
  { label: 'Central de atendimento', to: '/contato' },
  { label: 'Sobre a loja', to: '/institucional/sobre' },
  { label: 'Acompanhar pedido', to: '/acompanhar-pedido' },
];

const navigationLinks = [
  { label: 'Categorias', to: '/#categorias' },
  { label: 'Mais vendidos', to: '/#produtos' },
  { label: 'Novidades', to: '/catalogo' },
  { label: 'Chegou na Allegro', to: '/#chegou-na-allegro' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Contato', to: '/contato' },
];

function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const { totalItems } = useCart();
  const whatsappNumber = useStoreWhatsappNumber();
  const storeSettings = useStoreSettings();
  const logoUrl = storeSettings?.logo_url;
  const storeName = storeSettings?.nome_loja || 'Allegro Music Store';

  useEffect(() => {
    let timeoutId;

    function handleCartHighlight() {
      setCartPulse(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setCartPulse(false), 2200);
    }

    window.addEventListener('cart:item-added', handleCartHighlight);
    return () => {
      window.removeEventListener('cart:item-added', handleCartHighlight);
      window.clearTimeout(timeoutId);
    };
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/catalogo?q=${encodeURIComponent(query)}` : '/catalogo');
  }

  return (
    <header className="header">
      <div className="topbar">
        <div className="container topbar-content">
          <span className="topbar-note">Loja online de instrumentos, áudio e serviços musicais</span>
          <nav className="quick-links" aria-label="Links rápidos">
            {quickLinks.map((link) => (
              <NavLink key={link.label} to={link.to}>{link.label}</NavLink>
            ))}
            <a href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda na loja.')} target="_blank" rel="noreferrer">WhatsApp</a>
          </nav>
        </div>
      </div>
      <div className="header-main-wrap">
        <div className="container header-main">
          <NavLink to="/" className="brand">
            {logoUrl ? (
              <img className="brand-logo" src={logoUrl} alt={`Logo ${storeName}`} />
            ) : (
              <span className="brand-mark">♫</span>
            )}
            <span className="brand-text">
              <strong>{storeName}</strong>
              <small>Instrumentos e Áudio Profissional</small>
            </span>
          </NavLink>
          <form className="search-bar" role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Busque instrumentos, acessórios, áudio e serviços"
              aria-label="Buscar produtos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" className="btn btn-main btn-search">Buscar</button>
          </form>
          <NavLink to="/carrinho" className={`btn btn-secondary cart-shortcut ${cartPulse ? 'is-highlighted' : ''}`} aria-live="polite" aria-label={`Carrinho com ${totalItems} item(ns)`}>
            <span role="img" aria-hidden="true">🛒</span>
            <span>Carrinho</span>
            <span className="cart-counter">{totalItems}</span>
          </NavLink>
        </div>
      </div>
      <div className="menu-bar marketplace-nav">
        <nav className="container menu-content" aria-label="Navegação principal">
          {navigationLinks.map((link) => (
            <Link key={link.label} to={link.to} className="menu-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
