/**
 * Tipos y constantes del catálogo. Los productos reales se leen de Supabase (ver src/lib/catalog.ts).
 * Los datos de mentira del drop 01 viven en products.mock.ts (solo para generar supabase/seed-drop-1.sql).
 */
export type ProductStatus = 'draft' | 'active' | 'archived';
export type Category = 'camisetas' | 'buzos' | 'pantalones' | 'accesorios';

export interface ColorOption {
  key: string;
  name: string;
  hex: string;
  /** Color del "escenario" en la página de producto cuando se elige este color */
  stage: string;
  /** true si el texto sobre el escenario debe ser claro */
  stageDark: boolean;
  front: string;
  back?: string;
}

export interface ProductVariant {
  size: string;
  color: string; // key de ColorOption
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_cop: number;
  status: ProductStatus;
  /** Número del drop al que pertenece */
  drop: number;
  sort_order: number;
  category: Category;
  colors: ColorOption[];
  sizes: string[];
  variants: ProductVariant[];
  /** Foto en contexto (calle), usada en el hover de la tarjeta */
  life?: string;
  details: string[];
}

/** Drop vigente: el menú siempre apunta a este */
export const CURRENT_DROP = { number: 1, label: 'Drop 01' };

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'camisetas', label: 'Camisetas' },
  { key: 'buzos', label: 'Buzos' },
  { key: 'pantalones', label: 'Pantalones' },
  { key: 'accesorios', label: 'Accesorios' },
];

export const totalStock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);

export const colorStock = (p: Product, colorKey: string) =>
  p.variants.filter((v) => v.color === colorKey).reduce((n, v) => n + v.stock, 0);
