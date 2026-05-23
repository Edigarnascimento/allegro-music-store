import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CART_STORAGE_KEY = 'allegro_music_cart_v1';
const CartContext = createContext(null);
const normalizeCartItem = (product) => ({ id: product.id, nome: product.nome ?? product.name ?? 'Produto', categoria: product.categoria ?? product.category ?? '', preco: Number(product.preco ?? product.price ?? 0), imagem_url: product.imagem_url ?? product.image ?? '', quantidade: 1 });
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => { const raw = localStorage.getItem(CART_STORAGE_KEY); if (!raw) return; try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setItems(parsed); } catch { setItems([]); } }, []);
  useEffect(() => { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }, [items]);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.preco * item.quantidade, 0), [items]);
  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantidade, 0), [items]);
  const addToCart = (product) => { const normalized = normalizeCartItem(product); setItems((prev) => { const existing = prev.find((item) => item.id === normalized.id); return existing ? prev.map((item) => item.id === normalized.id ? { ...item, quantidade: item.quantidade + 1 } : item) : [...prev, normalized]; }); };
  const updateQuantity = (productId, quantity) => setItems((prev) => prev.map((item) => item.id === productId ? { ...item, quantidade: Math.max(1, Number(quantity || 1)) } : item));
  const removeFromCart = (productId) => setItems((prev) => prev.filter((item) => item.id !== productId));
  const clearCart = () => setItems([]);
  return <CartContext.Provider value={{ items, subtotal, total: subtotal, totalItems, addToCart, updateQuantity, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart deve ser usado dentro de CartProvider'); return context; }
