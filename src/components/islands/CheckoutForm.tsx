import { useEffect, useState } from 'react';
import { onCartChange, readCart, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/lib/money';
import { DEPARTAMENTOS, SHIPPING_COP } from '@/lib/shipping';

const campo = 'mt-1 w-full rounded-md border-2 border-negro bg-blanco px-3 py-3 text-base';

export default function CheckoutForm() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pedido, setPedido] = useState<{ reference: string; total: number } | null>(null);

  useEffect(() => {
    setItems(readCart());
    return onCartChange(setItems);
  }, []);

  if (items === null) return null;

  if (pedido) {
    return (
      <div className="mt-10 rounded-md border-2 border-negro p-6" role="status">
        <p className="etiqueta text-texto-suave">Pedido creado</p>
        <p className="mt-1 font-display text-6xl">{pedido.reference}</p>
        <p className="mt-3">Total a pagar: <strong>{formatCOP(pedido.total)}</strong></p>
        <p className="mt-3 text-texto-suave">El pago con Wompi se activa en el siguiente paso.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p className="font-display text-4xl uppercase">Tu carrito está vacío.</p>
        <a href="/tienda" className="btn mt-5 inline-block">Ver la tienda</a>
      </div>
    );
  }

  const subtotal = items.reduce((n, i) => n + i.qty * i.price_cop, 0);

  async function enviar(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const f = new FormData(e.currentTarget);
    const texto = (k: string) => String(f.get(k) ?? '');
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: texto('name'),
            email: texto('email'),
            phone: texto('phone'),
            address: texto('address'),
            city: texto('city'),
            department: texto('department'),
            notes: texto('notes'),
          },
          items: items!.map((i) => ({ slug: i.slug, color: i.color, size: i.size, qty: i.qty })),
          acceptTerms: f.get('terms') === 'on',
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'No pudimos crear tu pedido.');
      setPedido(j);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu pedido.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-10 grid gap-10 md:grid-cols-[1fr_380px]">
      <form onSubmit={enviar} className="space-y-4" noValidate={false}>
        <h2 className="text-4xl">Tus datos</h2>
        <label className="etiqueta block">Nombre completo
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={campo} />
        </label>
        <label className="etiqueta block">Correo
          <input name="email" type="email" required maxLength={120} autoComplete="email" className={campo} />
        </label>
        <label className="etiqueta block">Celular
          <input name="phone" type="tel" required inputMode="numeric" autoComplete="tel-national" placeholder="3001234567" className={campo} />
        </label>

        <h2 className="pt-4 text-4xl">Envío</h2>
        <label className="etiqueta block">Dirección
          <input name="address" required minLength={5} maxLength={160} autoComplete="street-address" className={campo} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="etiqueta block">Ciudad
            <input name="city" required minLength={2} maxLength={60} autoComplete="address-level2" className={campo} />
          </label>
          <label className="etiqueta block">Departamento
            <select name="department" required defaultValue="" className={campo}>
              <option value="" disabled>Elige uno</option>
              {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <label className="etiqueta block">Indicaciones (opcional)
          <textarea name="notes" rows={2} maxLength={300} placeholder="Torre, apto, portería…" className={campo} />
        </label>

        <label className="flex items-start gap-3 pt-2">
          <input name="terms" type="checkbox" required className="mt-1 size-5" />
          <span>Acepto las políticas de compra y envío de Cavra.</span>
        </label>

        {error && <p role="alert" className="rounded-md border-2 border-oxido p-3 text-oxido">{error}</p>}
        <button type="submit" className="btn w-full" disabled={enviando}>
          {enviando ? 'Creando tu pedido…' : 'Continuar al pago'}
        </button>
      </form>

      <aside className="h-fit rounded-md border-2 border-negro p-5 md:sticky md:top-28">
        <h2 className="text-4xl">Tu pedido</h2>
        <ul className="mt-3 divide-y divide-linea">
          {items.map((i) => (
            <li key={`${i.slug}-${i.color}-${i.size}`} className="flex justify-between gap-3 py-3 text-sm">
              <span>{i.qty} × {i.name} <span className="text-texto-suave">· {i.colorName} · {i.size}</span></span>
              <span className="tabular-nums">{formatCOP(i.qty * i.price_cop)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between text-sm"><span>Subtotal</span><span className="tabular-nums">{formatCOP(subtotal)}</span></div>
        <div className="mt-1 flex justify-between text-sm"><span>Envío</span><span className="tabular-nums">{formatCOP(SHIPPING_COP)}</span></div>
        <div className="mt-3 flex justify-between border-t-2 border-negro pt-3 text-xl font-bold">
          <span>Total</span><span className="tabular-nums">{formatCOP(subtotal + SHIPPING_COP)}</span>
        </div>
        <p className="mt-3 text-xs text-texto-suave">El total final lo confirma Cavra con los precios vigentes.</p>
      </aside>
    </div>
  );
}
