const iconMap = {
  strings: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 4h18" />
      <path d="M8 4v16" />
      <path d="M12 4v16" />
      <path d="M16 4v16" />
      <path d="M6 20c1.2 0 2-.8 2-1.7V16" />
      <path d="M10 20c1.2 0 2-.8 2-1.7V16" />
      <path d="M14 20c1.2 0 2-.8 2-1.7V16" />
    </svg>
  ),
  keys: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v10M11 4v10M15 4v10M19 4v10" />
      <path d="M5 14h14" />
    </svg>
  ),
  drums: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <ellipse cx="12" cy="7" rx="7.5" ry="3.5" />
      <path d="M4.5 7v8c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5V7" />
      <path d="M9 3L5 1M15 3l4-2" />
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <rect x="6.5" y="7.5" width="11" height="2.5" rx="1" />
      <circle cx="9" cy="14.5" r="1.5" />
      <circle cx="15" cy="14.5" r="1.5" />
      <path d="M18.5 13v3" />
    </svg>
  ),
  guitar: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M16 3l5 5-3 3-2-2-4.5 4.5" />
      <path d="M12 12c1.8 1.8 1.9 4.8.1 6.6-1.9 1.9-5.1 1.8-7.1-.2s-2.1-5.2-.2-7.1c1.8-1.8 4.8-1.7 6.6.1" />
      <circle cx="8.5" cy="15" r="1.6" />
      <path d="M18 6l-2 2M20 8l-2 2" />
    </svg>
  ),
  wind: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9h12l4-3v12l-4-3H4z" />
      <path d="M8 9v6M12 9v6" />
      <circle cx="18.5" cy="12" r="1" />
    </svg>
  ),
  services: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.5 5.5l4 4" />
      <path d="M5 19l5.5-5.5" />
      <path d="M13.5 4.5l6 6-6.8 6.8a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2z" />
      <path d="M4 20h6" />
    </svg>
  ),
  accessories: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3l2 3.8 4.2.6-3 2.9.7 4.1-3.9-2-3.9 2 .7-4.1-3-2.9 4.2-.6L12 3z" />
      <path d="M7 15l-2 4M17 15l2 4" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  ),
};

function CategoryIcon({ type }) {
  return <span className="category-icon" aria-hidden="true">{iconMap[type] ?? iconMap.accessories}</span>;
}

export default CategoryIcon;
