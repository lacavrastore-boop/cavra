/**
 * Lectura del catálogo desde Supabase (solo productos activos, por RLS).
 * Devuelve la misma forma `Product` que usa el front.
 */
import { supabasePublic } from './supabase';
import { CURRENT_DROP, type Category, type Product, type ProductStatus } from '../data/products';

const BUCKET = 'products';

/** Rutas que empiezan con "/" son archivos del sitio; el resto son fotos del bucket de Supabase. */
function foto(path: string): string;
function foto(path: string | null | undefined): string | undefined;
function foto(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

const SELECT =
  'slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path,' +
  'product_colors(key, name, hex, stage, stage_dark, front_path, back_path, position),' +
  'product_variants(size, color, stock, position)';

type Row = {
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  price_cop: number;
  status: ProductStatus;
  sort_order: number;
  category: Category;
  drop_number: number;
  details: string[];
  life_path: string | null;
  product_colors: { key: string; name: string; hex: string; stage: string; stage_dark: boolean; front_path: string; back_path: string | null; position: number }[];
  product_variants: { size: string; color: string; stock: number; position: number }[];
};

function toProduct(r: Row): Product {
  const variants = [...r.product_variants].sort((a, b) => a.position - b.position);
  return {
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description ?? '',
    price_cop: r.price_cop,
    status: r.status,
    drop: r.drop_number,
    sort_order: r.sort_order,
    category: r.category,
    colors: [...r.product_colors]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        key: c.key,
        name: c.name,
        hex: c.hex,
        stage: c.stage,
        stageDark: c.stage_dark,
        front: foto(c.front_path),
        back: foto(c.back_path),
      })),
    sizes: [...new Set(variants.map((v) => v.size))],
    variants: variants.map(({ size, color, stock }) => ({ size, color, stock })),
    life: foto(r.life_path),
    details: r.details,
  };
}

/** Productos activos (con al menos un color) en orden de aparición. */
export async function activeProducts(): Promise<Product[]> {
  const { data, error } = await supabasePublic()
    .from('products')
    .select(SELECT)
    .eq('status', 'active')
    .order('sort_order')
    .overrideTypes<Row[], { merge: false }>();
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return data.map(toProduct).filter((p) => p.colors.length > 0);
}

export async function dropProducts(n: number = CURRENT_DROP.number) {
  return (await activeProducts()).filter((p) => p.drop === n);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabasePublic()
    .from('products')
    .select(SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle<Row>();
  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  const p = data ? toProduct(data) : undefined;
  return p && p.colors.length > 0 ? p : undefined;
}
