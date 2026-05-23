import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/ordersService';
import { buildWhatsAppLink, formatPriceBRL } from '../lib/whatsapp';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const whatsappNumber = useStoreWhatsappNumber();
  const [form, setForm] = useState({ nome:'', whatsapp:'', email:'', endereco:'', formaEntrega:'retirada_na_loja', formaPagamento:'a_combinar', observacoes:'' });
  const [error, setError] = useState(''); const [success, setSuccess] = useState(null);
  if (!items.length && !success) return <section className="container section"><h1>Carrinho vazio</h1><Link className="btn" to="/catalogo">Ir para catálogo</Link></section>;
  const onChange=(e)=>setForm((p)=>({...p,[e.target.name]:e.target.value}));
  async function onSubmit(e){e.preventDefault();setError('');try{const order=await createOrder({customer:form,items,subtotal,total:subtotal});clearCart();setSuccess(order);}catch(err){setError(`Não foi possível finalizar o pedido: ${err.message}`);}}
  if (success) { const resumo = [`Novo pedido #${success.id}`,`Cliente: ${form.nome}`,`WhatsApp: ${form.whatsapp}`,`Total: ${formatPriceBRL(subtotal)}`,...items.map((i)=>`- ${i.nome} x${i.quantidade}`)].join('\n'); return <section className="container section"><h1>Pedido realizado com sucesso!</h1><p>Em breve entraremos em contato.</p><div className="product-actions"><a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber,resumo)} target="_blank" rel="noreferrer">Enviar resumo no WhatsApp</a><Link className="btn btn-secondary" to="/catalogo">Voltar ao catálogo</Link></div></section>; }
  return <section className="container section"><h1>Checkout</h1>{error?<p className="admin-alert error">{error}</p>:null}<form className="admin-form" onSubmit={onSubmit}><input required name="nome" placeholder="Nome" value={form.nome} onChange={onChange}/><input required name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={onChange}/><input name="email" placeholder="E-mail (opcional)" value={form.email} onChange={onChange}/><textarea required name="endereco" placeholder="Endereço de entrega" value={form.endereco} onChange={onChange}/><select name="formaEntrega" value={form.formaEntrega} onChange={onChange}><option value="retirada_na_loja">Retirada na loja</option><option value="entrega">Entrega</option></select><select name="formaPagamento" value={form.formaPagamento} onChange={onChange}><option value="a_combinar">A combinar</option><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao_na_loja">Cartão na loja</option></select><textarea name="observacoes" placeholder="Observações" value={form.observacoes} onChange={onChange}/><button className="btn" type="submit">Finalizar pedido ({formatPriceBRL(subtotal)})</button></form></section>;
}
