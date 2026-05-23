import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/ordersService';
import { buildWhatsAppLink, formatPriceBRL } from '../lib/whatsapp';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { WhatsAppIcon } from '../components/PublicButtonIcons';

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
