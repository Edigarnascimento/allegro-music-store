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
          Allegro Music Store
        </NavLink>
        <nav className="nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
