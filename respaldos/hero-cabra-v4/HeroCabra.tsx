import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/* Cabra por capas: cuello quieto + cabeza que gira sobre el cuello + ojos que siguen el cursor.
   Todo se mueve en vivo (sin cuadros). Geometría en px de las capas (1229 x 1560). */
const IMG_W = 1229;
const IMG_H = 1560;
const FACE = { x: 470, y: 600 }; // punto entre los ojos
const PIVOTE = { x: 700, y: 980 }; // donde la cabeza se une al cuello

/* Cuello que se dobla: en vez de cortar la imagen, la zona del cuello se divide en franjas
   diagonales (paralelas a la mandíbula). La cara gira completa (peso 1), cada franja gira un
   poco menos y el cuerpo queda quieto (peso 0). Sin cortes ni copias superpuestas. */
const LINEA = { x: 1229, y: 690 }; // la línea pasa bajo la oreja derecha y sigue la mandíbula
const N = { x: 0.504, y: 0.864 }; // normal de la línea (hacia el cuerpo)
const U = { x: -N.y, y: N.x }; // dirección de la línea
const DOBLEZ = 360; // ancho (px) de la zona que se dobla
const FRANJAS = 30;
const LARGO = 4000;
function franja(d0: number, d1: number) {
  const p = (d: number, s: number) => {
    const x = LINEA.x + N.x * d + U.x * s * LARGO;
    const y = LINEA.y + N.y * d + U.y * s * LARGO;
    return `${((x / IMG_W) * 100).toFixed(3)}% ${((y / IMG_H) * 100).toFixed(3)}%`;
  };
  return `polygon(${p(d0, -1)}, ${p(d0, 1)}, ${p(d1, 1)}, ${p(d1, -1)})`;
}
const suave = (t: number) => t * t * (3 - 2 * t);
const PIEZAS = (() => {
  const paso = DOBLEZ / FRANJAS;
  const out: { clip: string; w: number }[] = [{ clip: franja(DOBLEZ - 2, 6000), w: 0 }];
  for (let i = FRANJAS - 1; i >= 0; i--) {
    const c = (i + 0.5) / FRANJAS;
    out.push({ clip: franja(i * paso - 2, (i + 1) * paso + 2), w: 1 - suave(c) });
  }
  return out;
})();
const CLIP_CABEZA = franja(-6000, 2);
const EYES = [
  { key: 'r', box: [540, 570, 684, 624], pupil: 27, rangeX: 190, rangeY: 60, restY: -30 },
  { key: 'l', box: [250, 571, 309, 615], pupil: 21, rangeX: 75, rangeY: 55, restY: -30 },
] as const;

const pct = (v: number, total: number) => `${(v / total) * 100}%`;
const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v));

interface Huella {
  id: number;
  x: number;
  y: number;
  rot: number;
}

function Ojo({
  eye,
  nx,
  ny,
  lid,
}: {
  eye: (typeof EYES)[number];
  nx: MotionValue<number>;
  ny: MotionValue<number>;
  lid: MotionValue<string>;
}) {
  const [x0, y0, x1, y1] = eye.box;
  const w = x1 - x0;
  const h = y1 - y0;
  const px = useTransform(nx, (v) => `${v * eye.rangeX}%`);
  const py = useTransform(ny, (v) => `${eye.restY + v * eye.rangeY}%`);
  const mask = `url(/img/ojo-${eye.key}.png) center / 100% 100% no-repeat`;
  return (
    <div
      aria-hidden="true"
      className="absolute"
      style={{
        left: pct(x0, IMG_W),
        top: pct(y0, IMG_H),
        width: pct(w, IMG_W),
        height: pct(h, IMG_H),
        mask,
        WebkitMask: mask,
      }}
    >
      <motion.div
        className="absolute rounded-full bg-[#101010]"
        style={{
          width: pct(eye.pupil, w),
          aspectRatio: '1',
          left: `calc(50% - ${pct(eye.pupil / 2, w)})`,
          top: `calc(50% - ${pct(eye.pupil / 2, h)})`,
          x: px,
          y: py,
        }}
      />
      {/* párpado: baja para parpadear */}
      <motion.div
        className="absolute inset-0 origin-top"
        style={{
          y: lid,
          background: 'linear-gradient(to bottom, #7a7a75 0%, #6d6d68 78%, #161616 80%, #161616 100%)',
        }}
      />
    </div>
  );
}

function Pieza({
  clip,
  w,
  rot,
  x,
  y,
}: {
  clip: string;
  w: number;
  rot: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const r = useTransform(rot, (v) => v * w);
  const tx = useTransform(x, (v) => v * w);
  const ty = useTransform(y, (v) => v * w);
  return (
    <motion.img
      src="/img/cabra-base.webp"
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute inset-0 h-full w-full"
      style={{
        clipPath: clip,
        rotate: r,
        x: tx,
        y: ty,
        transformOrigin: `${pct(PIVOTE.x, IMG_W)} ${pct(PIVOTE.y, IMG_H)}`,
      }}
    />
  );
}

export default function HeroCabra() {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const [huellas, setHuellas] = useState<Huella[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const idCount = useRef(0);
  const lastMove = useRef(0);

  // Hacia dónde mira la cabra (-1..1)
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const nx = useSpring(tx, { stiffness: 260, damping: 26, mass: 0.6 });
  const ny = useSpring(ty, { stiffness: 260, damping: 26, mass: 0.6 });
  // Cabeza: más lenta que los ojos
  const hx = useSpring(tx, { stiffness: 55, damping: 14, mass: 1.1 });
  const hy = useSpring(ty, { stiffness: 55, damping: 14, mass: 1.1 });
  // La cabeza gira sobre el cuello (inclinación), se asoma un poco hacia el cursor y cabecea arriba/abajo
  const headRot = useTransform([hx, hy], ([x, y]: number[]) => (reduce ? 0 : x * 4.2 + y * x * -1.2));
  const headX = useTransform(hx, (v) => (reduce ? 0 : v * 10));
  const headY = useTransform(hy, (v) => (reduce ? 0 : v * 7));
  // Fondo: se mueve al revés que el cursor (profundidad)
  const bgX = useTransform(hx, (v) => (reduce ? 0 : v * -36));
  const bgY = useTransform(hy, (v) => (reduce ? 0 : v * -18));
  const bgX2 = useTransform(hx, (v) => (reduce ? 0 : v * 26));
  const lid = useMotionValue('-102%');
  const { scrollY } = useScroll();
  const capa1 = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.35));
  const capa2 = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.18));
  const capaCabra = useTransform(scrollY, (v) => (reduce ? 0 : v * -0.12));

  // Seguir el cursor (o el dedo) en toda la ventana
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      lastMove.current = performance.now();
      const el = face.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + (FACE.x / IMG_W) * r.width;
      const cy = r.top + (FACE.y / IMG_H) * r.height;
      tx.set(clamp((e.clientX - cx) / (window.innerWidth * 0.45)));
      ty.set(clamp((e.clientY - cy) / (window.innerHeight * 0.45)));

      // Huellas de pezuña dentro del hero (solo mouse)
      if (reduce || e.pointerType !== 'mouse' || !root.current) return;
      const hr = root.current.getBoundingClientRect();
      if (e.clientY < hr.top || e.clientY > hr.bottom) return;
      const p = { x: e.clientX - hr.left, y: e.clientY - hr.top };
      const prev = last.current;
      if (!prev) {
        last.current = p;
        return;
      }
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      if (Math.hypot(dx, dy) < 88) return;
      last.current = p;
      const ang = Math.atan2(dy, dx);
      const lado = idCount.current % 2 ? 1 : -1;
      const h: Huella = {
        id: ++idCount.current,
        x: p.x + Math.cos(ang + Math.PI / 2) * 14 * lado,
        y: p.y + Math.sin(ang + Math.PI / 2) * 14 * lado,
        rot: (ang * 180) / Math.PI + 90,
      };
      setHuellas((hs) => [...hs.slice(-11), h]);
      window.setTimeout(() => setHuellas((hs) => hs.filter((x) => x.id !== h.id)), 1100);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, tx, ty]);

  // Sin cursor (celular o mouse quieto): la cabra mira alrededor sola
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (performance.now() - lastMove.current < 2600) return;
      tx.set((Math.random() * 2 - 1) * 0.8);
      ty.set((Math.random() * 2 - 1) * 0.5);
    }, 1700);
    return () => window.clearInterval(id);
  }, [reduce, tx, ty]);

  // Parpadeo
  useEffect(() => {
    if (reduce) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(async () => {
        await animate(lid, '0%', { duration: 0.07, ease: 'easeIn' });
        await animate(lid, '-102%', { duration: 0.12, ease: 'easeOut' });
        loop();
      }, 2200 + Math.random() * 3800);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [reduce, lid]);

  return (
    <div ref={root} className="relative isolate min-h-[100svh] overflow-hidden bg-papel pt-20 md:pt-24">
      {/* Capa 1: tipografía gigante en contorno (profundidad) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none">
        <motion.div style={{ y: capa1 }} className="absolute left-0 right-0 top-[9%]">
          <motion.p
            style={{ x: bgX, y: bgY }}
            className="contorno whitespace-nowrap font-display text-[34vw] leading-none text-negro/15 md:text-[26vw]"
          >
            CABRA CABRA
          </motion.p>
        </motion.div>
        <motion.div style={{ y: capa2 }} className="absolute left-0 right-0 top-[50%]">
          <motion.p
            style={{ x: bgX2 }}
            className="contorno -ml-[40vw] whitespace-nowrap font-display text-[34vw] leading-none text-negro/15 md:text-[26vw]"
          >
            GOAT NO GOAT NO
          </motion.p>
        </motion.div>
      </div>

      {/* Huellas del cursor */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <AnimatePresence>
          {huellas.map((h) => (
            <motion.img
              key={h.id}
              src="/img/huella.svg"
              alt=""
              width={22}
              height={28}
              className="absolute h-7 w-auto"
              style={{ left: h.x - 11, top: h.y - 14, rotate: h.rot }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1500px] grid-rows-[auto_1fr] px-5 md:min-h-[calc(100svh-6rem)] md:px-10 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1">
        {/* Texto */}
        <div className="relative z-20 flex flex-col justify-center pb-4 pt-6 lg:justify-start lg:pb-16 lg:pt-[9vh]">
          <h1 className="text-[clamp(4.2rem,19vw,11.5rem)] leading-[0.84]">
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              El{' '}
              <span className="relative inline-block text-texto-suave">
                goat
                <motion.span
                  aria-hidden="true"
                  className="absolute left-[-6%] right-[-6%] top-[46%] h-[0.12em] origin-left -rotate-6 rounded-full bg-oxido"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, delay: 0.75, ease: [0.77, 0, 0.175, 1] }}
                />
              </span>{' '}
              no,
            </motion.span>
            <motion.span
              className="block text-cafe"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
            >
              la cabra.
            </motion.span>
          </h1>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center"
          >
            <p className="max-w-[30ch] text-base leading-relaxed md:text-lg">
              Calle pero elegante. Ropa hecha en Colombia, lanzada en drops.
            </p>
            <a href="#drop" className="btn self-start sm:self-auto">
              Ver el drop 01
            </a>
          </motion.div>
        </div>

        {/* La cabra */}
        <div className="relative flex items-end justify-center lg:justify-end">
          <motion.div style={{ y: capaCabra }} className="relative w-[min(100vw,36rem)] lg:w-[min(46vw,44rem)]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Respiración muy sutil de todo el cuerpo */}
              <motion.div
                ref={face}
                className="relative origin-bottom"
                style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}
                animate={reduce ? undefined : { scaleY: [1, 1.008, 1] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {PIEZAS.map((p, i) => (
                  <Pieza key={i} clip={p.clip} w={p.w} rot={headRot} x={headX} y={headY} />
                ))}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    rotate: headRot,
                    x: headX,
                    y: headY,
                    transformOrigin: `${pct(PIVOTE.x, IMG_W)} ${pct(PIVOTE.y, IMG_H)}`,
                  }}
                >
                  <img
                    src="/img/cabra-base.webp"
                    alt="La cabra de Cavra, que voltea a mirarte"
                    width={IMG_W}
                    height={IMG_H}
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full"
                    style={{ clipPath: CLIP_CABEZA }}
                    draggable={false}
                  />
                  {EYES.map((e) => (
                    <Ojo key={e.key} eye={e} nx={nx} ny={ny} lid={lid} />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
