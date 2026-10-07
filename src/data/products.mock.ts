/**
 * DATOS DE MENTIRA (mock) del drop 01. Nombres, precios y stock NO son reales.
 * Se usan solo para generar supabase/seed-drop-1.sql (node --experimental-strip-types scripts/generar-seed.mjs).
 */
import type { ColorOption, Product, ProductVariant } from './products.ts';

const P = '/img/p';

const C = {
  negro: { name: 'Negro', hex: '#1A1A1A', stage: '#EFE6D0', stageDark: false },
  crema: { name: 'Crema', hex: '#EFE6D0', stage: '#573724', stageDark: true },
  oliva: { name: 'Oliva', hex: '#55684F', stage: '#B7AFB3', stageDark: false },
  cafe: { name: 'Café', hex: '#573724', stage: '#D7C9A8', stageDark: false },
  bosque: { name: 'Verde bosque', hex: '#2E5D46', stage: '#8E8B80', stageDark: false },
  arena: { name: 'Arena', hex: '#D7C9A8', stage: '#2A2A2A', stageDark: true },
} as const;

type CKey = keyof typeof C;
const color = (key: CKey, front: string, back?: string): ColorOption => ({ key, ...C[key], front, back });

/** Genera variantes talla x color con stock de mentira */
function stockGrid(sizes: string[], colors: CKey[], agotados: string[] = []): ProductVariant[] {
  const out: ProductVariant[] = [];
  colors.forEach((c, ci) =>
    sizes.forEach((s, si) => {
      const id = `${c}:${s}`;
      out.push({ size: s, color: c, stock: agotados.includes(id) ? 0 : ((ci * 3 + si * 5) % 9) + 1 });
    }),
  );
  return out;
}

export const products: Product[] = [
  {
    slug: 'buzo-la-cabra',
    name: 'Buzo La Cabra',
    tagline: 'La cabra en la espalda.',
    description:
      'Buzo pesado de capucha, corte amplio y hombro caído. Pezuña bordada en el pecho y la cabra estampada grande en la espalda.',
    price_cop: 189900,
    status: 'active',
    drop: 1,
    sort_order: 1,
    category: 'buzos',
    colors: [
      color('negro', `${P}/hoodie_front_negro.webp`, `${P}/hoodie_back_negro.webp`),
      color('cafe', `${P}/hoodie_front_cafe.webp`, `${P}/hoodie_back_cafe.webp`),
      color('crema', `${P}/hoodie_front_crema.webp`, `${P}/hoodie_back_crema.webp`),
      color('bosque', `${P}/hoodie_front_bosque.webp`, `${P}/hoodie_back_bosque.webp`),
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: stockGrid(['S', 'M', 'L', 'XL'], ['negro', 'cafe', 'crema', 'bosque'], ['negro:XL', 'bosque:S']),
    life: '/img/life/hoodie.webp',
    details: ['Algodón perchado de alto gramaje', 'Capucha doble con cordón', 'Bolsillo canguro', 'Estampado en espalda'],
  },
  {
    slug: 'camiseta-cabra',
    name: 'Camiseta Cabra',
    tagline: 'Logo al frente, cabra atrás.',
    description:
      'Camiseta de algodón pesado, corte cuadrado y cuello grueso. CAVRA al frente y la cabra con el logo en la espalda.',
    price_cop: 89900,
    status: 'active',
    drop: 1,
    sort_order: 2,
    category: 'camisetas',
    colors: [
      color('negro', `${P}/tee_front_negro.webp`, `${P}/tee_back_negro.webp`),
      color('crema', `${P}/tee_front_crema.webp`, `${P}/tee_back_crema.webp`),
      color('oliva', `${P}/tee_front_oliva.webp`, `${P}/tee_back_oliva.webp`),
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: stockGrid(['S', 'M', 'L', 'XL'], ['negro', 'crema', 'oliva'], ['crema:S']),
    life: '/img/life/tee.webp',
    details: ['Algodón peinado de alto gramaje', 'Corte cuadrado (boxy)', 'Cuello acanalado grueso', 'Estampado frente y espalda'],
  },
  {
    slug: 'cargo-calle',
    name: 'Cargo Calle',
    tagline: 'Bolsillos para todo.',
    description: 'Pantalón cargo de bota ancha y caída pesada. Bolsillos laterales con tapa y pezuña bordada en la cadera.',
    price_cop: 159900,
    status: 'active',
    drop: 1,
    sort_order: 3,
    category: 'pantalones',
    colors: [
      color('negro', `${P}/pants_front_negro.webp`),
      color('oliva', `${P}/pants_front_oliva.webp`),
      color('arena', `${P}/pants_front_arena.webp`),
    ],
    sizes: ['28', '30', '32', '34'],
    variants: stockGrid(['28', '30', '32', '34'], ['negro', 'oliva', 'arena'], ['arena:34']),
    life: '/img/life/pants.webp',
    details: ['Dril de algodón', 'Bota ancha', 'Seis bolsillos', 'Pezuña bordada'],
  },
  {
    slug: 'gorra-pezuna',
    name: 'Gorra Pezuña',
    tagline: 'La pezuña al frente.',
    description: 'Gorra de seis paneles, visera curva y correa ajustable. Pezuña bordada al frente.',
    price_cop: 69900,
    status: 'active',
    drop: 1,
    sort_order: 4,
    category: 'accesorios',
    colors: [
      color('cafe', `${P}/cap_cafe.webp`),
      color('negro', `${P}/cap_negro.webp`),
      color('crema', `${P}/cap_crema.webp`),
    ],
    sizes: ['Única'],
    variants: [
      { size: 'Única', color: 'cafe', stock: 8 },
      { size: 'Única', color: 'negro', stock: 5 },
      { size: 'Única', color: 'crema', stock: 0 },
    ],
    life: '/img/life/cap.webp',
    details: ['Seis paneles', 'Visera curva', 'Correa ajustable', 'Bordado frontal'],
  },
  {
    slug: 'camiseta-pezuna',
    name: 'Camiseta Pezuña',
    tagline: 'La pezuña al pecho, la cabra atrás.',
    description:
      'Camiseta de algodón pesado, corte cuadrado y cuello grueso. Pezuña en relieve mate al pecho y la cabra con el logo en la espalda.',
    price_cop: 89900,
    status: 'active',
    drop: 1,
    sort_order: 5,
    category: 'camisetas',
    colors: [color('negro', `${P}/tee_front_negro_pezuna.webp`, `${P}/tee_back_negro_pezuna.webp`)],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: stockGrid(['S', 'M', 'L', 'XL'], ['negro']),
    life: '/img/life/tee.webp',
    details: ['Algodón peinado de alto gramaje', 'Corte cuadrado (boxy)', 'Cuello acanalado grueso', 'Pezuña en el pecho y estampado en espalda'],
  },
];
