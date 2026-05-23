import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CART_STORAGE_KEY = 'allegro_music_cart_v1';
const CartContext = createContext(null);
const normalizeCartItem = (product) => ({ id: product.id, nome: product.nome ?? product.name ?? 'Produto', categoria: product.categoria ?? product.category ?? '', preco: Number(product.preco ?? product.price ?? 0), imagem_url: product.imagem_url ?? product.image ?? '', estoque: Number.isFinite(Number(product.estoque)) ? Number(product.estoque) : null, quantidade: 1 });
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => { const raw = localStorage.getItem(CART_STORAGE_KEY); if (!raw) return; try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setItems(parsed); } catch { setItems([]); } }, []);
  useEffect(() => { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }, [items]);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.preco * item.quantidade, 0), [items]);
  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantidade, 0), [items]);
  const addToCart = (product) => { const normalized = normalizeCartItem(product); const hasStock = Number.isFinite(normalized.estoque); if (hasStock && normalized.estoque <= 0) return { ok: false, message: 'Produto indisponível no momento.' }; let feedback = { ok: true }; setItems((prev) => { const existing = prev.find((item) => item.id === normalized.id); if (existing) { const nextQty = existing.quantidade + 1; if (hasStock && nextQty > normalized.estoque) { feedback = { ok: false, message: `Você já adicionou o limite disponível (${normalized.estoque} unidade(s)).` }; return prev; } return prev.map((item) => item.id === normalized.id ? { ...item, quantidade: nextQty, estoque: normalized.estoque } : item); } return [...prev, normalized]; }); return feedback; };
  const updateQuantity = (productId, quantity) => { let feedback = { ok: true }; setItems((prev) => prev.map((item) => { if (item.id !== productId) return item; const desired = Math.max(1, Number(quantity || 1)); const hasStock = Number.isFinite(Number(item.estoque)); if (hasStock && desired > Number(item.estoque)) { feedback = { ok: false, message: `Quantidade ajustada para ${item.estoque} devido ao estoque disponível.` }; return { ...item, quantidade: Number(item.estoque) }; } return { ...item, quantidade: desired }; })); return feedback; };
  const removeFromCart = (productId) => setItems((prev) => prev.filter((item) => item.id !== productId));
  const clearCart = () => setItems([]);
  return <CartContext.Provider value={{ items, subtotal, total: subtotal, totalItems, addToCart, updateQuantity, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart deve ser usado dentro de CartProvider'); return context; }
