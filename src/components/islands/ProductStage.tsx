import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowLeft, Check, Minus, Plus, Rotate3d } from 'lucide-react';
import type { Product } from '@/data/products';
import { addToCart, openCart } from '@/lib/cart';
import { formatCOP } from '@/lib/money';
import { cn } from '@/lib/utils';

const EASE = [0.23, 1, 0.32, 1] as const;

export default function ProductStage({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const firstAvailable = product.colors.find((c) => product.variants.some((v) => v.color === c.key && v.stock > 0));
  const [colorKey, setColorKey] = useState((firstAvailable ?? product.colors[0]).key);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [back, setBack] = useState(false);

  const color = product.colors.find((c) => c.key === colorKey)!;
  const others = product.colors.filter((c) => c.key !== colorKey);
  const stockOf = (s: string, c = colorKey) => product.variants.find((v) => v.color === c && v.size === s)?.stock ?? 0;
  const stock = size ? stockOf(size) : 0;
  const colorAgotado = product.sizes.every((s) => stockOf(s) === 0);
  const dark = color.stageDark;

  // Si la talla elegida no existe en el nuevo color, se limpia
  useEffect(() => {
    if (size && stockOf(size) === 0) setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey]);

  /* ─── Giro frente / espalda (arrastrar) + inclinación con el cursor ─── */
  const flip = useMotionValue(0);
  const flipS = useSpring(flip, { stiffness: 140, damping: 20 });
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const tY = useSpring(tiltY, { stiffness: 120, damping: 18 });
  const rotY = useTransform([flipS, tY], ([f, t]: number[]) => f + (reduce ? 0 : t));
  const rotX = useTransform(tX, (v) => (reduce ? 0 : v));
  const shadowX = useTransform(rotY, (v) => Math.sin((v * Math.PI) / 180) * -24);
  const startFlip = useRef(0);
  const hasBack = Boolean(color.back);

  useEffect(() => {
    flip.set(back && hasBack ? 180 : 0);
  }, [back, hasBack, flip]);

  const onPanStart = () => {
    startFlip.current = flip.get();
  };
  const onPan = (_: unknown, info: { offset: { x: number } }) => {
    const raw = startFlip.current + info.offset.x * 0.6;
    flip.set(hasBack ? raw : Math.max(-35, Math.min(35, raw)));
  };
  const onPanEnd = () => {
    if (!hasBack) {
      animate(flip, 0, { type: 'spring', stiffness: 160, damping: 16 });
      return;
    }
    const snapped = Math.round(flip.get() / 180) * 180;
    const isBack = Math.abs(snapped / 180) % 2 === 1;
    flip.set(snapped);
    setBack(isBack);
  };
  const stageRef = useRef<HTMLDivElement>(null);

  // Lupa: al pasar el mouse sobre la prenda se amplía la zona bajo el cursor
  const ZOOM = 2.6;
  const LENS = 380;
  const garmentRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const natural = useRef({ w: 0, h: 0 });
  const zoomSrc = back && color.back ? color.back : color.front;
  useEffect(() => {
    natural.current = { w: 0, h: 0 };
    const im = new Image();
    im.onload = () => (natural.current = { w: im.naturalWidth, h: im.naturalHeight });
    im.src = zoomSrc;
  }, [zoomSrc]);
  const hideLens = () => {
    if (lensRef.current) lensRef.current.style.opacity = '0';
  };
  const onGarmentMove = (e: React.PointerEvent) => {
    const box = garmentRef.current;
    const lens = lensRef.current;
    const { w, h } = natural.current;
    if (e.pointerType !== 'mouse' || e.buttons !== 0 || !box || !lens || !w) return hideLens();
    const r = box.getBoundingClientRect();
    const sc = Math.min(r.width / w, r.height / h);
    const dw = w * sc;
    const dh = h * sc;
    const ox = (r.width - dw) / 2;
    const oy = (r.height - dh) / 2;
    const x = e.clientX - r.left - ox;
    const y = e.clientY - r.top - oy;
    if (x < 0 || y < 0 || x > dw || y > dh) return hideLens();
    lens.style.opacity = '1';
    lens.style.transform = `translate3d(${e.clientX - r.left - LENS / 2}px, ${e.clientY - r.top - LENS / 2}px, 0)`;
    lens.style.backgroundSize = `${dw * ZOOM}px ${dh * ZOOM}px`;
    lens.style.backgroundPosition = `${LENS / 2 - x * ZOOM}px ${LENS / 2 - y * ZOOM}px`;
  };
  const onStageMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -10);
  };
  const onStageLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const add = () => {
    if (!size || stock === 0) return;
    addToCart({
      slug: product.slug,
      name: product.name,
      color: color.key,
      colorName: color.name,
      size,
      qty,
      price_cop: product.price_cop,
      image: color.front,
      maxQty: stock,
    });
    setAdded(true);
    window.setTimeout(() => {
      setAdded(false);
      openCart();
    }, 650);
  };

  const ink = dark ? 'text-papel' : 'text-negro';
  const line = dark ? 'border-papel/25' : 'border-negro/15';
  const chip = (active: boolean, disabled = false) =>
    cn(
      'relative grid min-h-12 min-w-12 place-items-center rounded-full border-2 px-4 text-sm font-semibold transition-[transform,background-color,color,border-color] duration-200 active:scale-95',
      disabled && 'cursor-not-allowed opacity-35 line-through',
      active
        ? dark
          ? 'border-papel bg-papel text-negro'
          : 'border-negro bg-negro text-papel'
        : dark
          ? 'border-papel/40 hover:border-papel'
          : 'border-negro/25 hover:border-negro',
    );

  const bigName = useMemo(() => product.name.split(' ').slice(-1)[0], [product.name]);

  return (
    <section className={cn('relative isolate min-h-[100svh] overflow-hidden', ink)}>
      {/* Fondo del escenario: se funde al cambiar de color (solo opacidad) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={color.key}
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{ background: `radial-gradient(120% 90% at 70% 45%, color-mix(in oklab, ${color.stage} 82%, white) 0%, ${color.stage} 55%, color-mix(in oklab, ${color.stage} 80%, black) 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </AnimatePresence>
      <div className="mx-auto grid min-h-[100svh] max-w-[1500px] gap-4 px-5 pb-12 pt-24 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-center lg:gap-10 lg:pb-16">
        {/* ─── Escenario ─── */}
        <div
          ref={stageRef}
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
          className="relative order-1 h-[62svh] min-h-[380px] lg:order-2 lg:h-[82svh]"
        >
          {/* Nombre gigante detrás de la prenda */}
          <p
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-x-[-10%] top-1/2 z-0 -translate-y-1/2 select-none whitespace-nowrap text-center font-display text-[42vw] uppercase leading-none lg:text-[19vw]',
              dark ? 'text-papel/10' : 'text-negro/[0.07]',
            )}
          >
            {bigName}
          </p>
          {/* Otras opciones, desenfocadas atrás */}
          <div className="absolute right-0 top-[4%] z-0 flex h-[92%] flex-col justify-center gap-3 lg:-right-4 lg:gap-6">
            {others.map((c, i) => (
              <motion.button
                key={c.key}
                type="button"
                onClick={() => setColorKey(c.key)}
                aria-label={`Ver en ${c.name}`}
                className="group relative block w-[22vw] max-w-[150px] lg:w-[11vw] lg:max-w-[190px]"
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}
              >
                <img
                  src={c.front}
                  alt=""
                  className="w-full opacity-75 blur-[7px] transition-[opacity,transform] duration-300 ease-out group-hover:scale-105 group-hover:opacity-100"
                />
                <span
                  className={cn(
                    'etiqueta absolute inset-x-0 bottom-1 mx-auto w-fit rounded-full px-2.5 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100',
                    dark ? 'bg-papel text-negro' : 'bg-negro text-papel',
                  )}
                >
                  {c.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Prenda al frente */}
          <div
            ref={garmentRef}
            onPointerMove={onGarmentMove}
            onPointerLeave={hideLens}
            onPointerDown={hideLens}
            className="absolute inset-y-0 left-0 right-[20%] z-10 lg:right-[14%]"
            style={{ perspective: 1400 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={color.key}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 140, scale: 0.72 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -90, scale: 0.9 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <motion.div
                  className="relative h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
                  style={{ rotateY: rotY, rotateX: rotX, transformStyle: 'preserve-3d' }}
                  onPanStart={onPanStart}
                  onPan={onPan}
                  onPanEnd={onPanEnd}
                >
                  <img
                    src={color.front}
                    alt={`${product.name} en ${color.name.toLowerCase()}, frente`}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ backfaceVisibility: 'hidden', filter: 'drop-shadow(0 40px 38px rgba(0,0,0,0.35))' }}
                  />
                  {color.back && (
                    <img
                      src={color.back}
                      alt={`${product.name} en ${color.name.toLowerCase()}, espalda`}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        filter: 'drop-shadow(0 40px 38px rgba(0,0,0,0.35))',
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
            {/* Lupa (solo mouse) */}
            <div
              ref={lensRef}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-0 top-0 z-30 hidden rounded-full opacity-0 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.55)] transition-opacity duration-150 [@media(hover:hover)_and_(pointer:fine)]:block',
                dark ? 'border-2 border-papel' : 'border-2 border-negro',
              )}
              style={{ width: LENS, height: LENS, backgroundImage: `url(${zoomSrc})`, backgroundRepeat: 'no-repeat', backgroundColor: color.stage }}
            />
            {/* sombra en el piso */}
            <motion.div
              aria-hidden="true"
              style={{ x: shadowX }}
              className="absolute bottom-[1%] left-1/2 -z-10 h-6 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => (hasBack ? setBack((b) => !b) : undefined)}
            disabled={!hasBack}
            className={cn(
              'etiqueta absolute bottom-0 left-0 z-20 flex items-center gap-2 rounded-full px-4 py-3 transition-transform duration-150 active:scale-95 disabled:opacity-0',
              dark ? 'bg-papel/15 text-papel hover:bg-papel/25' : 'bg-negro/10 hover:bg-negro/15',
            )}
          >
            <Rotate3d className="size-4" aria-hidden="true" />
            {back ? 'Ver frente' : 'Arrastra para girar'}
          </button>
        </div>

        {/* ─── Panel de compra ─── */}
        <div className="relative z-20 order-2 lg:order-1">
          <a
            href="/tienda"
            onClick={(e) => {
              // Si vienes de otra página de Cavra, vuelve justo ahí; si no, a la tienda
              if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
                e.preventDefault();
                window.history.back();
              }
            }}
            className={cn(
              'etiqueta mb-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 transition-transform duration-150 active:scale-95',
              dark ? 'bg-papel/15 text-papel hover:bg-papel/25' : 'bg-negro/10 hover:bg-negro/15',
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver
          </a>
          <nav aria-label="Ruta" className="etiqueta mb-5 opacity-70">
            <a href="/tienda" className="hover:underline">Tienda</a> / {product.category}
          </nav>
          <h1 className="text-[clamp(3.5rem,9vw,8rem)] leading-[0.84]">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-4">
            <p className="font-display text-4xl tabular-nums md:text-5xl">{formatCOP(product.price_cop)}</p>
            <p className="text-sm opacity-75">{product.tagline}</p>
          </div>
          <p className="mt-5 max-w-[46ch] leading-relaxed opacity-90">{product.description}</p>

          {/* Color */}
          <fieldset className={cn('mt-8 border-t pt-5', line)}>
            <legend className="sr-only">Color</legend>
            <p className="etiqueta mb-3">
              Color: <span className="font-medium normal-case tracking-normal">{color.name}</span>
              {colorAgotado && <span className="ml-2 opacity-70">(agotado)</span>}
            </p>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={c.key === colorKey}
                  aria-label={c.name}
                  onClick={() => setColorKey(c.key)}
                  className={cn(
                    'size-11 rounded-full ring-offset-2 transition-transform duration-150 active:scale-90',
                    c.key === colorKey ? (dark ? 'ring-2 ring-papel' : 'ring-2 ring-negro') : 'ring-1 ring-black/20',
                  )}
                  style={{ background: c.hex, ['--tw-ring-offset-color' as string]: color.stage }}
                />
              ))}
            </div>
          </fieldset>

          {/* Talla */}
          <fieldset className="mt-6">
            <legend className="sr-only">Talla</legend>
            <div className="mb-3 flex items-center justify-between">
              <p className="etiqueta">Talla{size ? `: ${size}` : ''}</p>
              <a href="#guia-tallas" className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100">
                Guía de tallas
              </a>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((s) => {
                const sin = stockOf(s) === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    disabled={sin}
                    aria-label={sin ? `${s}, agotada` : s}
                    onClick={() => {
                      setSize(s);
                      setQty(1);
                    }}
                    className={chip(size === s, sin)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Cantidad + agregar */}
          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <div className={cn('flex items-center rounded-full border-2', dark ? 'border-papel/40' : 'border-negro/25')}>
              <button
                type="button"
                aria-label="Menos"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className={cn('btn-icono-ghost size-12', dark && 'text-papel hover:text-negro')}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Más"
                disabled={!size || qty >= stock}
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
                className={cn('btn-icono-ghost size-12', dark && 'text-papel hover:text-negro')}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={add}
              disabled={!size || stock === 0}
              className={cn('btn flex-1 overflow-hidden', dark && 'btn-claro')}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={added ? 'ok' : size ? 'add' : 'pick'}
                  className="flex items-center gap-2"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  {added ? (
                    <>
                      <Check className="size-4" /> Agregado
                    </>
                  ) : size ? (
                    `Agregar · ${formatCOP(product.price_cop * qty)}`
                  ) : (
                    'Elige tu talla'
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
          <p className="mt-3 min-h-5 text-sm opacity-75" aria-live="polite">
            {size && stock > 0 ? `Disponible en talla ${size}.` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
