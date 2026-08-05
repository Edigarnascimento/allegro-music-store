import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, resolveWhatsappNumber } from '../lib/whatsapp';

const WELCOME_STORAGE_KEY = 'allegro_welcome_seen_v1';
const WHATSAPP_FALLBACK_NUMBER = '5591985284572';


function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const storeWhatsappNumber = useStoreWhatsappNumber();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const whatsappNumber = resolveWhatsappNumber(storeWhatsappNumber, WHATSAPP_FALLBACK_NUMBER);

  useEffect(() => {
    if (isAdminRoute) return;

    const hasSeenWelcome = window.localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
    if (hasSeenWelcome) return;

    setIsOpen(true);
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

        <div className="welcome-sound-decoration" aria-hidden="true">
          <span className="welcome-sound-wave" />
          <span className="welcome-sound-bar" />
          <span className="welcome-music-note welcome-music-note-one">♪</span>
          <span className="welcome-music-note welcome-music-note-two">♬</span>
        </div>

        <p className="welcome-kicker">Allegro Music Store</p>
        <h2 id="welcome-modal-title">Bem-vindo à Allegro Music Store</h2>
        <p>
          Loja física e online para quem vive a música, com atendimento especializado para escolher instrumentos, acessórios e áudio profissional.
        </p>
        <p className="welcome-highlight">Luteria, partituras, arranjos e aulas em um só lugar, com suporte da equipe Allegro.</p>

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
