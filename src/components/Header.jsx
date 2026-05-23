import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';

const quickLinks = [
  { label: 'Central de atendimento', to: '/contato' },
  { label: 'WhatsApp', href: 'https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20ajuda%20na%20loja.' },
  { label: 'Login (em breve)', to: '/' },
];

const categoryLinks = [
  { icon: 'strings', label: 'Cordas' },
  { icon: 'keys', label: 'Teclas' },
  { icon: 'drums', label: 'Bateria' },
  { icon: 'audio', label: 'Áudio' },
  { icon: 'accessories', label: 'Acessórios' },
];

function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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
