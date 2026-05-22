import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/contato', label: 'Contato' },
];

function Header() {
  return (
    <header className="header">
      <div className="container nav-wrapper">
        <NavLink to="/" className="brand">
          <span className="brand-mark">♫</span>
          <span>Allegro Music Store</span>
        </NavLink>
        <nav className="nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
          <a className="btn btn-whatsapp header-cta" href="https://wa.me/5511999999999?text=Olá!%20Quero%20atendimento%20da%20Allegro." target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
