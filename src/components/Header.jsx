import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { useCart } from '../context/CartContext';
import CategoryIcon from './CategoryIcon';
import { getCategories } from '../services/categoriesService';

const quickLinks = [
  { label: 'Central de atendimento', to: '/contato' },
  { label: 'Sobre a loja', to: '/institucional/sobre' },
  { label: 'Acompanhar pedido', to: '/acompanhar-pedido' },
];

const fallbackCategoryLinks = [
  { icon: 'strings', label: 'Cordas' },
  { icon: 'keys', label: 'Teclas' },
  { icon: 'drums', label: 'Bateria' },
  { icon: 'audio', label: 'Áudio' },
  { icon: 'accessories', label: 'Acessórios' },
];

const iconByCategoryName = {
  cordas: 'strings',
  teclas: 'keys',
  bateria: 'drums',
  áudio: 'audio',
  audio: 'audio',
  acessórios: 'accessories',
  acessorios: 'accessories',
};

function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);
  const { totalItems } = useCart();
  const whatsappNumber = useStoreWhatsappNumber();

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      const data = await getCategories();
      if (isMounted) setCategories(data);
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryLinks = useMemo(() => {
    const source = categories.length
      ? categories.map((category) => ({ label: category.nome ?? category.name ?? '' })).filter((category) => category.label)
      : fallbackCategoryLinks;

    return source.map((category) => {
      const normalizedName = category.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return {
        ...category,
        icon: category.icon ?? iconByCategoryName[normalizedName] ?? 'generic',
      };
    });
  }, [categories]);


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
          {quickLinks.map((link) => (
            link.href ? <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a> : <NavLink key={link.label} to={link.to}>{link.label}</NavLink>
          ))}
          <a href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda na loja.')} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
      <div className="header-main-wrap">
        <div className="container header-main">
        <NavLink to="/" className="brand">
          <span className="brand-mark">♫</span>
          <span className="brand-text">
            <strong>Allegro Music Store</strong>
            <small>Instrumentos e Áudio Profissional</small>
          </span>
        </NavLink>
        <form className="search-bar" role="search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Busque instrumentos, acessórios e equipamentos"
            aria-label="Buscar produtos"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="btn btn-main btn-search">Buscar</button>
        </form>
        <NavLink to="/carrinho" className={`btn btn-secondary cart-shortcut ${cartPulse ? 'is-highlighted' : ''}`} aria-live="polite">Carrinho <span className="cart-counter">{totalItems}</span></NavLink>
        </div>
      </div>
      <div className="menu-bar">
        <div className="container menu-content">
          {categoryLinks.map((category) => (
            <NavLink key={category.label} to={`/catalogo?categoria=${encodeURIComponent(category.label)}`} className="menu-link">
              <CategoryIcon type={category.icon} /><span className="menu-link-label">{category.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
