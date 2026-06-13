import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, resolveWhatsappNumber } from '../lib/whatsapp';

const WELCOME_STORAGE_KEY = 'allegro_welcome_seen_v1';
const WHATSAPP_FALLBACK_NUMBER = '5591985284572';

function createConfettiPieces(total = 24) {
  return Array.from({ length: total }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 350,
    duration: 1400 + Math.random() * 1300,
    rotate: (Math.random() * 460) - 230,
  }));
}

function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const storeWhatsappNumber = useStoreWhatsappNumber();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const whatsappNumber = resolveWhatsappNumber(storeWhatsappNumber, WHATSAPP_FALLBACK_NUMBER);

  const confettiPieces = useMemo(() => createConfettiPieces(), [confettiBurst]);

  useEffect(() => {
    if (isAdminRoute) return;

    const hasSeenWelcome = window.localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
    if (hasSeenWelcome) return;

    setIsOpen(true);
    setConfettiBurst((current) => current + 1);
    window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
  }, [isAdminRoute]);

  if (!isOpen || isAdminRoute) return null;

  const closeModal = () => setIsOpen(false);

  const handleKnowStore = () => {
    closeModal();
    navigate('/catalogo');
  };

  const handleViewServices = () => {
    closeModal();
    navigate('/servicos');
  };

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
      <div className="welcome-modal">
        <button type="button" className="welcome-close" onClick={closeModal} aria-label="Fechar mensagem de boas-vindas">×</button>

        <div className="welcome-field-decoration" aria-hidden="true">
          <span className="welcome-field-circle" />
          <span className="welcome-field-goal" />
          <span className="welcome-ball" />
        </div>

        <div className="welcome-confetti" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={`${confettiBurst}-${piece.id}`}
              className="welcome-confetti-piece"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}ms`,
                animationDuration: `${piece.duration}ms`,
                transform: `rotate(${piece.rotate}deg)`,
              }}
            />
          ))}
        </div>

        <p className="welcome-kicker">Esquenta da Copa na Allegro</p>
        <h2 id="welcome-modal-title">Bem-vindo à Allegro no clima da Copa!</h2>
        <p>
          A Allegro Music Store preparou uma experiência especial para quem vive a música. Entre no clima da Copa com produtos musicais, áudio, acessórios, serviços e atendimento pelo WhatsApp.
        </p>
        <p className="welcome-highlight">Música, torcida e atendimento Allegro para deixar sua comemoração ainda mais completa.</p>

        <div className="welcome-actions">
          <button type="button" className="btn" onClick={handleKnowStore}>Conhecer a loja</button>
          <button type="button" className="btn btn-secondary" onClick={handleViewServices}>Ver serviços musicais</button>
          <a
            className="btn btn-whatsapp"
            href={buildWhatsAppLink(whatsappNumber, 'Olá, acessei o site da Allegro Music Store e gostaria de atendimento.')}
            target="_blank"
            rel="noreferrer"
            onClick={closeModal}
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
