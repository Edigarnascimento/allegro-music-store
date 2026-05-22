import { Link } from 'react-router-dom';

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className="breadcrumb-item">
            {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
            {!isLast ? <span className="breadcrumb-separator">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
