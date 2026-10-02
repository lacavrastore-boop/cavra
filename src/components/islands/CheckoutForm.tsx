import { useEffect, useState } from 'react';
import { onCartChange, readCart, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/lib/money';
import { DEPARTAMENTOS, SHIPPING_COP } from '@/lib/shipping';

const campo =
  'mt-1.5 w-full rounded-lg border-[3px] border-negro bg-blanco px-4 py-3 text-base font-semibold text-negro outline-none transition-shadow duration-150 placeholder:font-normal placeholder:text-texto-suave focus:shadow-[4px_4px_0_var(--negro)]';
const etiqueta = 'block text-sm font-bold';
const ayuda = 'mt-1 block text-xs font-medium opacity-75';
const entra = (i: number) => ({ animation: 'entra 520ms var(--ease-out) both', animationDelay: `${i * 90}ms` });

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
      <div className="mt-10 max-w-xl" style={entra(0)} role="status">
        <div className="rounded-2xl border-[3px] border-negro bg-crema p-6 sombra-dura">
          <p className="font-display text-3xl leading-none text-cafe">Listo para pagar</p>
          <p className="mt-2 font-display text-8xl leading-[0.9]">{formatCOP(pedido.total)}</p>
          <p className="mt-4 text-sm font-medium">
            Referencia de pago: <strong>{pedido.reference}</strong>. Tu número de pedido te llega cuando se confirma el pago.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-6 md:flex-row md:items-center">
        <img src="/img/cabra.webp" alt="" width="200" height="254" className="h-auto w-40 md:w-52" />
        <div>
          <p className="font-display text-6xl leading-[0.9]">Vacío como un lunes.</p>
          <p className="mt-3 font-medium">Todavía no hay nada en tu carrito.</p>
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
    <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_400px] lg:gap-12">
      <form onSubmit={enviar} className="space-y-8">
        <fieldset className="rounded-2xl border-[3px] border-negro bg-crema p-5 sombra-dura md:p-7" style={entra(0)}>
          <legend className="sr-only">Quién la recibe</legend>
          <h2 className="font-display text-5xl leading-[0.9] md:text-6xl">¿Quién la recibe?</h2>
          <div className="mt-5 space-y-4">
            <label className={etiqueta}>Nombre completo
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={campo} />
            </label>
            <label className={etiqueta}>Correo
              <input name="email" type="email" required maxLength={120} autoComplete="email" className={campo} />
              <span className={ayuda}>Aquí te llega la confirmación.</span>
            </label>
            <label className={etiqueta}>Celular
              <input name="phone" type="tel" required inputMode="numeric" autoComplete="tel-national" placeholder="3001234567" className={campo} />
              <span className={ayuda}>Para que la transportadora te encuentre.</span>
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border-[3px] border-negro bg-petroleo p-5 text-papel sombra-dura md:p-7" style={entra(1)}>
          <legend className="sr-only">A dónde la mandamos</legend>
          <h2 className="font-display text-5xl leading-[0.9] md:text-6xl">¿A dónde la mandamos?</h2>
          <div className="mt-5 space-y-4">
            <label className={etiqueta}>Dirección
              <input name="address" required minLength={5} maxLength={160} autoComplete="street-address" className={`${campo} text-negro`} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={etiqueta}>Ciudad
                <input name="city" required minLength={2} maxLength={60} autoComplete="address-level2" className={`${campo} text-negro`} />
              </label>
              <label className={etiqueta}>Departamento
                <select name="department" required defaultValue="" className={`${campo} text-negro`}>
                  <option value="" disabled>Elige uno</option>
                  {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <label className={etiqueta}>Indicaciones (opcional)
              <textarea name="notes" rows={2} maxLength={300} placeholder="Torre, apto, portería…" className={`${campo} text-negro`} />
            </label>
          </div>
        </fieldset>

        <div style={entra(2)} className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3 font-semibold">
            <input
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 size-6 shrink-0 cursor-pointer appearance-none rounded-md border-[3px] border-negro bg-blanco transition-colors duration-150 checked:bg-negro checked:[background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fbf5ee' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7'/%3E%3C/svg%3E&quot;)]"
            />
            <span>Acepto las políticas de compra y envío de Cavra.</span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border-[3px] border-negro bg-oxido p-4 font-bold text-papel">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex min-h-16 w-full items-center justify-center rounded-2xl border-[3px] border-negro bg-negro px-6 font-display text-4xl tracking-wide text-papel shadow-[6px_6px_0_var(--cafe)] transition-[transform,box-shadow,background-color] duration-150 [transition-timing-function:var(--ease-out)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--cafe)] disabled:cursor-wait disabled:opacity-60 md:text-5xl [@media(hover:hover)]:hover:-translate-x-0.5 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[9px_9px_0_var(--cafe)]"
          >
            {enviando ? 'Un momento…' : `Pagar ${formatCOP(total)}`}
          </button>
          <p className="text-sm font-medium text-texto-suave">El pago lo procesa Wompi. Cavra no guarda los datos de tu tarjeta.</p>
        </div>
      </form>

      <aside className="relative order-first mt-24 lg:sticky lg:top-28 lg:order-last lg:mt-0 lg:self-start">
        <img
          src="/img/cabra.webp"
          alt=""
          width="200"
          height="254"
          className="pointer-events-none absolute -top-[104px] right-3 z-0 h-auto w-[150px] -rotate-3 select-none"
          style={{ animation: 'entra 700ms var(--ease-out) 400ms both' }}
        />
        <div
          className="relative z-10 [filter:drop-shadow(5px_5px_0_var(--negro))_drop-shadow(-1.5px_0_0_var(--negro))_drop-shadow(0_-1.5px_0_var(--negro))]"
          style={{ animation: 'tiquete-entra 650ms var(--ease-out) 200ms both', transformOrigin: 'top center', rotate: '1.2deg' }}
        >
          <div className="tiquete rounded-t-md p-6 pb-7">
            <h2 className="font-display text-5xl leading-[0.9]">Tu pedido</h2>
            <ul className="mt-5 space-y-4">
              {items.map((i) => (
                <li key={`${i.slug}-${i.color}-${i.size}`} className="flex items-center gap-3">
                  <div className="grid size-16 shrink-0 place-items-center rounded-lg border-2 border-negro bg-tile p-1">
                    <img src={i.image} alt="" className="max-h-full w-auto" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">{i.name}</p>
                    <p className="text-sm text-texto-suave">{i.colorName} · Talla {i.size} · x{i.qty}</p>
                  </div>
                  <p className="font-bold tabular-nums">{formatCOP(i.qty * i.price_cop)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-1 border-t-[3px] border-dashed border-negro pt-4 text-sm font-semibold">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatCOP(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Envío</dt><dd className="tabular-nums">{formatCOP(SHIPPING_COP)}</dd></div>
            </dl>
            <div className="mt-3 flex items-end justify-between border-t-[3px] border-dashed border-negro pt-3">
              <span className="font-display text-3xl leading-none">Total</span>
              <span className="font-display text-6xl leading-[0.85] text-oxido tabular-nums">{formatCOP(total)}</span>
            </div>
            <p className="mt-4 text-xs font-medium text-texto-suave">El total final lo confirma Cavra con los precios vigentes.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
