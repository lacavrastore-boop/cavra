/**
 * Movimiento del sitio sin React:
 * - [data-speed]: parallax al hacer scroll (solo transform).
 * - [data-reveal]: aparece al entrar en pantalla.
 * - Cabecera que se esconde al bajar y vuelve al subir.
 * - Botones [data-open-cart] abren el carrito.
 */
import { openCart } from '../lib/cart';

document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Carrito
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('[data-open-cart]');
  if (t) openCart();
});

// Aparecer al entrar
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    }),
  { rootMargin: '0px 0px -8% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

// Cabecera
const header = document.querySelector<HTMLElement>('[data-header]');
let lastY = window.scrollY;

// Parallax
const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-speed]'));
let ticking = false;

function frame() {
  ticking = false;
  const y = window.scrollY;
  if (header) {
    const down = y > lastY && y > 120;
    header.dataset.hidden = String(down);
    header.dataset.scrolled = String(y > 8);
    lastY = y;
  }
  if (reduce) return;
  const vh = window.innerHeight;
  for (const el of layers) {
    const ref = el.parentElement ?? el;
    const r = ref.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) continue;
    const speed = Number(el.dataset.speed) || 0;
    const center = r.top + r.height / 2 - vh / 2;
    el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
  }
}
const req = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
};
window.addEventListener('scroll', req, { passive: true });
window.addEventListener('resize', req);
frame();
