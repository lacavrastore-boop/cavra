// Genera supabase/seed-drop-1.sql desde los datos de mentira de src/data/products.mock.ts.
// Uso: node --experimental-strip-types scripts/generar-seed.mjs > supabase/seed-drop-1.sql
import { products } from '../src/data/products.mock.ts';

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const out = ['-- Datos de MENTIRA del drop 01 (nombres, precios y stock no son reales). Se reemplazan desde /admin.', 'begin;', ''];

for (const p of products) {
  out.push(
    `insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)`,
    `values (${q(p.slug)}, ${q(p.name)}, ${q(p.tagline)}, ${q(p.description)}, ${p.price_cop}, ${q(p.status)}, ${p.sort_order}, ${q(p.category)}, ${p.drop}, array[${p.details.map(q).join(', ')}], ${p.life ? q(p.life) : 'null'})`,
    `on conflict (slug) do nothing;`,
  );
  out.push(
    `insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)`,
    `select p.id, v.* from public.products p, (values`,
    p.colors.map((c, i) => `  (${q(c.key)}, ${q(c.name)}, ${q(c.hex)}, ${q(c.stage)}, ${c.stageDark}, ${q(c.front)}, ${c.back ? q(c.back) : 'null::text'}, ${i})`).join(',\n'),
    `) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = ${q(p.slug)}`,
    `on conflict (product_id, key) do nothing;`,
  );
  out.push(
    `insert into public.product_variants (product_id, size, color, stock, position)`,
    `select p.id, v.* from public.products p, (values`,
    p.variants.map((v) => `  (${q(v.size)}, ${q(v.color)}, ${v.stock}, ${p.sizes.indexOf(v.size)})`).join(',\n'),
    `) as v(size, color, stock, position) where p.slug = ${q(p.slug)}`,
    `on conflict (product_id, size, color) do nothing;`,
  );
  out.push('');
}
out.push('commit;');
console.log(out.join('\n'));
