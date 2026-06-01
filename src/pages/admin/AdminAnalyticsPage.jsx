import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsDashboardStats } from '../../services/analyticsService';

const periodOptions = [
  { label: 'Hoje', value: 1 },
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
];

const eventLabels = {
  page_view_home: 'Visita à Home',
  page_view_product: 'Visita a Produto',
  click_whatsapp: 'Clique no WhatsApp',
  click_cart: 'Clique/Acesso ao Carrinho',
  click_services: 'Clique/Acesso a Serviços',
  click_digital_card: 'Clique/Acesso ao Cartão digital',
  click_checkout: 'Clique/Acesso ao Checkout',
};

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
}

function EmptyState({ message }) {
  return <p className="admin-empty-state">{message}</p>;
}

export default function AdminAnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(7);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAnalyticsDashboardStats(periodDays)
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [periodDays]);

  const cards = useMemo(() => {
    const values = stats?.cards || {};
    return [
      { label: 'Visitas hoje', value: values.visitasHoje },
      { label: 'Visitas últimos 7 dias', value: values.visitas7Dias },
      { label: 'Visitas últimos 30 dias', value: values.visitas30Dias },
      { label: 'Cliques no WhatsApp', value: values.cliquesWhatsapp },
      { label: 'Cliques em carrinho', value: values.cliquesCarrinho },
      { label: 'Cliques em checkout', value: values.cliquesCheckout },
    ];
  }, [stats]);

  return (
    <div className="admin-page admin-analytics-page">
      <div className="admin-page-title-row">
        <div>
          <h1>Analytics</h1>
          <p className="admin-page-subtitle">Acompanhe visitas, cliques importantes e produtos mais acessados sem coletar dados sensíveis.</p>
        </div>
        <div className="admin-analytics-filters" aria-label="Filtros de período">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`admin-action-btn ${periodDays === option.value ? 'is-danger-strong' : ''}`}
              onClick={() => setPeriodDays(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p>Carregando analytics...</p> : null}

      {!loading ? (
        <>
          <section className="admin-stats-grid admin-stats-grid-highlight">
            {cards.map((card) => (
              <article key={card.label} className="admin-stat-card">
                <h3>{card.label}</h3>
                <p>{formatNumber(card.value)}</p>
              </article>
            ))}
          </section>

          <section className="admin-kpi-grid">
            <article className="admin-page admin-analytics-panel">
              <h2>Produtos mais acessados</h2>
              {stats?.rankings?.produtosMaisAcessados?.length ? (
                <ul className="admin-list admin-analytics-list">
                  {stats.rankings.produtosMaisAcessados.map((item) => (
                    <li key={item.key}>
                      <span>{item.label}</span>
                      <strong>{formatNumber(item.total)} visita(s)</strong>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState message="Sem visitas de produto neste período." />}
            </article>

            <article className="admin-page admin-analytics-panel">
              <h2>Páginas/eventos mais frequentes</h2>
              {stats?.rankings?.eventosMaisFrequentes?.length ? (
                <ul className="admin-list admin-analytics-list">
                  {stats.rankings.eventosMaisFrequentes.map((item) => (
                    <li key={item.key}>
                      <span>{eventLabels[item.label] || item.label}</span>
                      <strong>{formatNumber(item.total)} evento(s)</strong>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState message="Sem eventos registrados neste período." />}
            </article>
          </section>

          <section className="admin-page admin-analytics-privacy-note">
            <h2>Privacidade</h2>
            <p>Este painel registra somente nomes de eventos, caminho da página, produto relacionado e user agent. CPF, telefone, e-mail, endereço e dados de pagamento não devem ser enviados para analytics.</p>
          </section>
        </>
      ) : null}
    </div>
  );
}
