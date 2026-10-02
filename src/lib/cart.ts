/**
 * Carrito en el navegador (localStorage). Solo guarda qué quiere comprar la persona.
 * El precio que se cobra NO sale de aquí: en la fase de checkout el servidor lo recalcula desde la base de datos.
 */
export interface CartItem {
  slug: string;
  name: string;
  color: string;
  colorName: string;
  size: string;
  qty: number;
  price_cop: number; // solo para mostrar
  image: string;
  maxQty: number;
}

const KEY = 'cavra:cart';
const EVT = 'cart:change';

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* sin almacenamiento: el carrito vive solo en esta pestaña */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: items }));
}

const same = (a: CartItem, b: Pick<CartItem, 'slug' | 'color' | 'size'>) =>
  a.slug === b.slug && a.color === b.color && a.size === b.size;

export function addToCart(item: CartItem) {
  const items = readCart();
  const found = items.find((i) => same(i, item));
  if (found) found.qty = Math.min(found.qty + item.qty, item.maxQty);
  else items.push({ ...item, qty: Math.min(item.qty, item.maxQty) });
  write(items);
}

export function setQty(key: Pick<CartItem, 'slug' | 'color' | 'size'>, qty: number) {
  const items = readCart()
    .map((i) => (same(i, key) ? { ...i, qty: Math.max(0, Math.min(qty, i.maxQty)) } : i))
    .filter((i) => i.qty > 0);
  write(items);
}

export function cartCount(items = readCart()) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function onCartChange(fn: (items: CartItem[]) => void) {
  const h = (e: Event) => fn((e as CustomEvent<CartItem[]>).detail);
  const s = (e: StorageEvent) => e.key === KEY && fn(readCart());
  window.addEventListener(EVT, h);
  window.addEventListener('storage', s);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener('storage', s);
  };
}

export const openCart = () => window.dispatchEvent(new CustomEvent('cart:open'));
