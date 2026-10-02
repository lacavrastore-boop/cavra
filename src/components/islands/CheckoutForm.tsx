import { useEffect, useState } from 'react';
import { onCartChange, readCart, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/lib/money';
import { DEPARTAMENTOS, SHIPPING_COP } from '@/lib/shipping';

const campo =
  'mt-2 min-h-[3.25rem] w-full rounded-xl border border-linea bg-blanco px-4 py-3 text-base text-negro outline-none transition-colors duration-150 placeholder:text-texto-suave focus:border-negro';
const ayuda = 'mt-1.5 block text-xs text-texto-suave';
const entra = (i: number) => ({ animation: 'entra 560ms var(--ease-out) both', animationDelay: `${i * 90}ms` });

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
      <div className="mt-10 max-w-xl rounded-3xl bg-tile p-7 md:p-9" style={entra(0)} role="status">
        <p className="etiqueta text-texto-suave">Listo para pagar</p>
        <p className="mt-2 font-display text-8xl leading-[0.9]">{formatCOP(pedido.total)}</p>
        <p className="mt-5 text-sm text-texto-suave">
          Referencia de pago: <strong className="text-negro">{pedido.reference}</strong>. Tu número de pedido te llega cuando se confirma el pago.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-6 md:flex-row md:items-center">
        <img src="/img/cabra.webp" alt="" width="200" height="254" className="h-auto w-36 md:w-48" />
        <div>
          <p className="font-display text-6xl leading-[0.9]">Vacío como un lunes.</p>
          <p className="mt-3 text-texto-suave">Todavía no hay nada en tu carrito.</p>
          <a href="/tienda" className="btn mt-6">Ver la tienda</a>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((n, i) => n + i.qty * i.price_cop, 0);
  const total = subtotal + SHIPPING_COP;

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
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
      <form onSubmit={enviar} className="space-y-6">
        <fieldset className="rounded-3xl bg-tile p-6 md:p-8" style={entra(0)}>
          <legend className="sr-only">Quién la recibe</legend>
          <h2 className="font-display text-5xl leading-[0.9] md:text-6xl">¿Quién la recibe?</h2>
          <div className="mt-6 space-y-5">
            <label className="etiqueta block">Nombre completo
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
            </label>
            <label className="etiqueta block">Correo
              <input name="email" type="email" required maxLength={120} autoComplete="email" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
              <span className={`${ayuda} font-normal normal-case tracking-normal`}>Aquí te llega la confirmación.</span>
            </label>
            <label className="etiqueta block">Celular
              <input name="phone" type="tel" required inputMode="numeric" autoComplete="tel-national" placeholder="3001234567" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
              <span className={`${ayuda} font-normal normal-case tracking-normal`}>Para que la transportadora te encuentre.</span>
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl bg-tile p-6 md:p-8" style={entra(1)}>
          <legend className="sr-only">A dónde la mandamos</legend>
          <h2 className="font-display text-5xl leading-[0.9] md:text-6xl">¿A dónde la mandamos?</h2>
          <div className="mt-6 space-y-5">
            <label className="etiqueta block">Dirección
              <input name="address" required minLength={5} maxLength={160} autoComplete="street-address" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="etiqueta block">Ciudad
                <input name="city" required minLength={2} maxLength={60} autoComplete="address-level2" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
              </label>
              <label className="etiqueta block">Departamento
                <select name="department" required defaultValue="" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`}>
                  <option value="" disabled>Elige uno</option>
                  {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <label className="etiqueta block">Indicaciones (opcional)
              <textarea name="notes" rows={2} maxLength={300} placeholder="Torre, apto, portería…" className={`${campo} font-sans text-base font-normal normal-case tracking-normal`} />
            </label>
          </div>
        </fieldset>

        <div style={entra(2)} className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 size-6 shrink-0 cursor-pointer appearance-none rounded-md border border-negro bg-blanco transition-colors duration-150 checked:bg-negro checked:[background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fbf5ee' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7'/%3E%3C/svg%3E&quot;)]"
            />
            <span className="text-sm">Acepto las políticas de compra y envío de Cavra.</span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-oxido bg-oxido/10 p-4 text-sm font-semibold text-oxido">{error}</p>
          )}

          <button type="submit" disabled={enviando} className="btn w-full">
            {enviando ? 'Un momento…' : `Pagar ${formatCOP(total)}`}
          </button>
          <p className="text-center text-xs text-texto-suave">El pago lo procesa Wompi. Cavra no guarda los datos de tu tarjeta.</p>
        </div>
      </form>

      <aside className="order-first lg:sticky lg:top-28 lg:order-last lg:self-start" style={entra(1)}>
        <div className="rounded-3xl bg-blanco p-6 shadow-[0_30px_60px_-30px_rgba(17,17,17,0.3)] md:p-8">
          <h2 className="font-display text-5xl leading-[0.9]">Tu pedido</h2>
          <ul className="mt-6 divide-y divide-linea">
            {items.map((i) => (
              <li key={`${i.slug}-${i.color}-${i.size}`} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-tile p-2">
                  <img src={i.image} alt="" className="max-h-full w-auto" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="etiqueta">{i.name}</p>
                  <p className="mt-1 text-sm text-texto-suave">{i.colorName} · Talla {i.size} · x{i.qty}</p>
                </div>
                <p className="tabular-nums">{formatCOP(i.qty * i.price_cop)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t border-linea pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatCOP(subtotal)}</dd></div>
            <div className="flex justify-between text-texto-suave"><dt>Envío</dt><dd className="tabular-nums">{formatCOP(SHIPPING_COP)}</dd></div>
          </dl>
          <div className="mt-4 flex items-end justify-between border-t border-negro pt-4">
            <span className="font-display text-3xl leading-none">Total</span>
            <span className="font-display text-6xl leading-[0.85] tabular-nums">{formatCOP(total)}</span>
          </div>
          <p className="mt-4 text-xs text-texto-suave">El total final lo confirma Cavra con los precios vigentes.</p>
        </div>
      </aside>
    </div>
  );
}
