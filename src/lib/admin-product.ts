/** Validación (en el servidor) de lo que envía el editor de productos. */
import { z } from 'zod';

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido');
const clave = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Clave inválida').max(40);
// Foto: archivo del sitio (/img/...) o ruta dentro del bucket "products" (p/<uuid>.webp). Sin "..".
const ruta = z
  .string()
  .max(300)
  .regex(/^(\/img\/[\w./-]+|[\w-]+\/[\w.-]+)$/, 'Ruta de foto inválida')
  .refine((s) => !s.includes('..'), 'Ruta de foto inválida');

export const ProductoSchema = z
  .object({
    id: z.uuid().nullish(),
    slug: z.string().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El enlace solo lleva minúsculas, números y guiones'),
    name: z.string().trim().min(1, 'Falta el nombre').max(80),
    tagline: z.string().trim().max(120).default(''),
    description: z.string().trim().max(2000).default(''),
    price_cop: z.number().int().min(0).max(100_000_000),
    status: z.enum(['draft', 'active', 'archived']),
    sort_order: z.number().int().min(0).max(9999).default(0),
    category: z.enum(['camisetas', 'buzos', 'pantalones', 'accesorios']),
    drop_number: z.number().int().min(1).max(99).default(1),
    details: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
    life_path: ruta.nullish(),
    colors: z
      .array(
        z.object({
          key: clave,
          name: z.string().trim().min(1, 'Falta el nombre de un color').max(40),
          hex,
          stage: hex,
          stage_dark: z.boolean(),
          front_path: ruta,
          back_path: ruta.nullish().or(z.literal('')),
        }),
      )
      .max(12),
    variants: z
      .array(
        z.object({
          size: z.string().trim().min(1).max(10),
          color: clave,
          stock: z.number().int().min(0).max(9999),
          position: z.number().int().min(0).max(99),
        }),
      )
      .max(200),
  })
  .superRefine((p, ctx) => {
    const keys = p.colors.map((c) => c.key);
    if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', message: 'Hay colores repetidos' });
    for (const v of p.variants) {
      if (!keys.includes(v.color)) ctx.addIssue({ code: 'custom', message: 'Una variante usa un color que no existe' });
    }
    const pares = p.variants.map((v) => `${v.size}|${v.color}`);
    if (new Set(pares).size !== pares.length) ctx.addIssue({ code: 'custom', message: 'Hay tallas repetidas' });
    if (p.status === 'active' && (p.colors.length === 0 || p.variants.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'Para publicarlo (activo) necesita al menos un color con foto y una talla' });
    }
  });

export type ProductoInput = z.infer<typeof ProductoSchema>;
