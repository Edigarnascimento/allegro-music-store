import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/ordersService';
import { buildWhatsAppLink, formatPriceBRL } from '../lib/whatsapp';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { WhatsAppIcon } from '../components/PublicButtonIcons';
import { getStoreSettings } from '../services/storeSettingsService';

const deliveryLabels = {
  retirada_na_loja: 'Retirada na loja',
  entrega: 'Entrega',
};

const paymentLabels = {
  a_combinar: 'A combinar',
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_na_loja: 'Cartão na loja',
};

const formatValueOrFallback = (value) => {
  if (!value || String(value).trim() === '') return 'Não informado';
  return value;
};

function buildOrderWhatsappSummary(summary) {
  const linhasItens = summary.items.map((item) => {
    const subtotalItem = Number(item.preco ?? 0) * Number(item.quantidade ?? 0);

    return `- ${item.quantidade}x ${item.nome} | Unitário: ${formatPriceBRL(item.preco)} | Subtotal: ${formatPriceBRL(subtotalItem)}`;
  });

  const pixLinhas = summary.pix?.isPix
    ? [
      '',
      'Pagamento via PIX:',
      `Chave PIX: ${summary.pix.chave || 'Não informado'}`,
      `Recebedor: ${summary.pix.recebedor || 'Não informado'}`,
      ...(summary.pix.banco ? [`Banco: ${summary.pix.banco}`] : []),
      `Total para pagamento: ${formatPriceBRL(summary.total)}`,
      'Envie o comprovante por este WhatsApp para validação do pagamento.',
    ]
    : [];

  return [
    'Novo pedido - Allegro Music Store',
    `Pedido: #${summary.shortId}`,
    `Cliente: ${summary.cliente.nome}`,
    `WhatsApp do cliente: ${summary.cliente.whatsapp}`,
    `E-mail: ${formatValueOrFallback(summary.cliente.email)}`,
    `Endereço de entrega: ${summary.cliente.endereco}`,
    `Forma de entrega: ${summary.cliente.formaEntregaLabel}`,
    `Forma de pagamento: ${summary.cliente.formaPagamentoLabel}`,
    `Observações: ${formatValueOrFallback(summary.cliente.observacoes)}`,
    '',
    'Itens do pedido:',
    ...linhasItens,
    '',
    `Total do pedido: ${formatPriceBRL(summary.total)}`,
    ...pixLinhas,
    'Aguardo confirmação do pedido.',
  ].join('\n');
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const whatsappNumber = useStoreWhatsappNumber();
  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    endereco: '',
    formaEntrega: 'retirada_na_loja',
    formaPagamento: 'a_combinar',
    observacoes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    getStoreSettings().then(setStoreSettings).catch(() => setStoreSettings(null));
  }, []);

  if (!items.length && !success) {
    return (
      <section className="container section">
        <h1>Carrinho vazio</h1>
        <Link className="btn" to="/catalogo">
          Ir para catálogo
        </Link>
      </section>
    );
  }

  const onChange = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const snapshotItems = items.map((item) => ({ ...item }));
      const snapshotForm = { ...form };
      const total = subtotal;

      const order = await createOrder({
        customer: snapshotForm,
        items: snapshotItems,
        subtotal: total,
        total,
      });

      setSuccess({
        id: order.id,
        shortId: order.id.slice(0, 8),
        total,
        items: snapshotItems,
        cliente: {
          nome: snapshotForm.nome,
          whatsapp: snapshotForm.whatsapp,
          email: snapshotForm.email,
          endereco: snapshotForm.endereco,
          formaEntregaLabel: deliveryLabels[snapshotForm.formaEntrega] || snapshotForm.formaEntrega,
          formaPagamentoLabel: paymentLabels[snapshotForm.formaPagamento] || snapshotForm.formaPagamento,
          observacoes: snapshotForm.observacoes,
        },
        pix: {
          isPix: snapshotForm.formaPagamento === 'pix',
          chave: snapshotForm.formaPagamento === 'pix' ? storeSettings?.chave_pix || '' : '',
          recebedor: snapshotForm.formaPagamento === 'pix' ? storeSettings?.nome_recebedor_pix || '' : '',
          banco: snapshotForm.formaPagamento === 'pix' ? storeSettings?.banco_pix || '' : '',
          instrucoes: snapshotForm.formaPagamento === 'pix' ? storeSettings?.instrucoes_pix || '' : '',
        },
      });

      clearCart();
    } catch (err) {
      setError(`Não foi possível finalizar o pedido: ${err.message}`);
    }
  }

  const whatsappSummary = useMemo(() => {
    if (!success) return '';
    return buildOrderWhatsappSummary(success);
  }, [success]);

  if (success) {
    const pixSemCadastro = success.pix?.isPix && !success.pix?.chave;

    async function handleCopyPixKey() {
      if (!success.pix?.chave) return;
      try {
        await navigator.clipboard.writeText(success.pix.chave);
        setCopyFeedback('Chave PIX copiada com sucesso.');
      } catch (copyError) {
        setCopyFeedback('Não foi possível copiar automaticamente. Copie a chave manualmente.');
      }
    }

    return (
      <section className="container section">
        <h1>Pedido realizado com sucesso!</h1>
        <p>Seu pedido foi registrado. Em breve nossa equipe vai entrar em contato.</p>
        <p>
          <strong>Número do pedido:</strong> #{success.shortId}
        </p>
        <p>
          <strong>Resumo:</strong> {success.items.length} item(ns) · Total {formatPriceBRL(success.total)}
        </p>
        {success.pix?.isPix ? (
          <div className="hero-panel" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Pagamento via PIX</h2>
            {pixSemCadastro ? (
              <p className="admin-alert error">
                PIX indisponível no momento. Fale com nossa equipe pelo WhatsApp para receber os dados de pagamento.
              </p>
            ) : (
              <>
                <p><strong>Chave PIX:</strong> {success.pix.chave}</p>
                <p><strong>Recebedor:</strong> {success.pix.recebedor || 'Não informado'}</p>
                {success.pix.banco ? <p><strong>Banco:</strong> {success.pix.banco}</p> : null}
                <p><strong>Total:</strong> {formatPriceBRL(success.total)}</p>
                {success.pix.instrucoes ? <p><strong>Instruções:</strong> {success.pix.instrucoes}</p> : null}
                <p>Seu pedido será confirmado após o envio e validação do pagamento.</p>
                <button type="button" className="btn btn-secondary" onClick={handleCopyPixKey}>
                  Copiar chave PIX
                </button>
                {copyFeedback ? <p style={{ marginTop: '.5rem' }}>{copyFeedback}</p> : null}
              </>
            )}
          </div>
        ) : null}

        <div className="product-actions">
          <a
            className="btn btn-whatsapp"
            href={buildWhatsAppLink(whatsappNumber, whatsappSummary)}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon />
            <span>Enviar pedido pelo WhatsApp</span>
          </a>
          <Link className="btn btn-secondary" to="/catalogo">
            Voltar ao catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container section">
      <h1>Checkout</h1>
      {error ? <p className="admin-alert error">{error}</p> : null}
      <form className="admin-form" onSubmit={onSubmit}>
        <input required name="nome" placeholder="Nome" value={form.nome} onChange={onChange} />
        <input required name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={onChange} />
        <input name="email" placeholder="E-mail (opcional)" value={form.email} onChange={onChange} />
        <textarea required name="endereco" placeholder="Endereço de entrega" value={form.endereco} onChange={onChange} />
        <select name="formaEntrega" value={form.formaEntrega} onChange={onChange}>
          <option value="retirada_na_loja">Retirada na loja</option>
          <option value="entrega">Entrega</option>
        </select>
        <select name="formaPagamento" value={form.formaPagamento} onChange={onChange}>
          <option value="a_combinar">A combinar</option>
          <option value="pix">PIX</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="cartao_na_loja">Cartão na loja</option>
        </select>
        <textarea name="observacoes" placeholder="Observações" value={form.observacoes} onChange={onChange} />
        <button className="btn" type="submit">
          Finalizar pedido ({formatPriceBRL(subtotal)})
        </button>
      </form>
    </section>
  );
}
