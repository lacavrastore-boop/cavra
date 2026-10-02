import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { cartCount, onCartChange, readCart, setQty, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/lib/money';
import { SHIPPING_COP } from '@/lib/shipping';

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    setItems(readCart());
    const off = onCartChange(setItems);
    const o = () => setOpen(true);
    window.addEventListener('cart:open', o);
    return () => {
      off();
      window.removeEventListener('cart:open', o);
    };
  }, []);

  // Contador en la cabecera
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      const n = cartCount(items);
      el.textContent = String(n);
      el.hidden = n === 0;
    });
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const subtotal = items.reduce((n, i) => n + i.qty * i.price_cop, 0);
  const ease = [0.23, 1, 0.32, 1] as const;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Carrito">
          <motion.button
            aria-label="Cerrar carrito"
            className="absolute inset-0 bg-negro/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-papel shadow-[-24px_0_60px_-20px_rgba(17,17,17,0.35)]"
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.32, ease }}
          >
            <header className="flex items-center justify-between border-b border-linea px-6 py-5">
              <h2 className="text-4xl">Tu carrito</h2>
              <button
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full transition-transform duration-150 hover:bg-tile active:scale-95"
                aria-label="Cerrar"
                autoFocus
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <img src="/img/cabra.webp" alt="" className="h-40 w-auto opacity-90" />
                <p className="font-display text-4xl uppercase leading-none">Vacío como un lunes.</p>
                <a href="/tienda" className="btn" onClick={() => setOpen(false)}>
                  Ver la tienda
                </a>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-linea overflow-y-auto px-6">
                  {items.map((i) => (
                    <li key={`${i.slug}-${i.color}-${i.size}`} className="flex gap-4 py-5">
                      <div className="grid size-24 shrink-0 place-items-center rounded-md bg-tile p-2">
                        <img src={i.image} alt="" className="max-h-full w-auto" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="etiqueta">{i.name}</p>
                        <p className="text-sm text-texto-suave">
                          {i.colorName} · Talla {i.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-linea">
                            <button
                              className="grid size-10 place-items-center active:scale-90"
                              aria-label="Quitar una unidad"
                              onClick={() => setQty(i, i.qty - 1)}
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center tabular-nums">{i.qty}</span>
                            <button
                              className="grid size-10 place-items-center active:scale-90 disabled:opacity-30"
                              aria-label="Agregar una unidad"
                              disabled={i.qty >= i.maxQty}
                              onClick={() => setQty(i, i.qty + 1)}
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <p className="tabular-nums">{formatCOP(i.qty * i.price_cop)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <footer className="border-t border-linea px-6 py-5">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatCOP(subtotal)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-texto-suave">
                    <span>Envío</span>
                    <span className="tabular-nums">{formatCOP(SHIPPING_COP)}</span>
                  </div>
                  <a href="/checkout" className="btn mt-5 flex w-full">
                    Ir a pagar
                  </a>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
