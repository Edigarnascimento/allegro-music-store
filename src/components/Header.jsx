import { NavLink } from 'react-router-dom';

const quickLinks = [
  { label: 'Central de atendimento', to: '/contato' },
  { label: 'WhatsApp', href: 'https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20ajuda%20na%20loja.' },
  { label: 'Login (em breve)', to: '/' },
];

const categoryLinks = [
  { icon: '🎸', label: 'Cordas', to: '/catalogo' },
  { icon: '🎹', label: 'Teclas', to: '/catalogo' },
  { icon: '🥁', label: 'Bateria', to: '/catalogo' },
  { icon: '🎤', label: 'Áudio', to: '/catalogo' },
  { icon: '🎼', label: 'Acessórios', to: '/catalogo' },
];

function Header() {
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
        <form className="search-bar" role="search">
          <input type="search" placeholder="Busque instrumentos, acessórios e equipamentos" aria-label="Buscar produtos" />
          <button type="button" className="btn">Buscar</button>
        </form>
        </div>
      </div>
      <div className="menu-bar">
        <div className="container menu-content">
          {categoryLinks.map((category) => (
            <NavLink key={category.label} to={category.to} className="menu-link">
              <span>{category.icon}</span>{category.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
