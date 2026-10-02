import { useMemo, useState } from 'react';

export interface EditorColor {
  /** id estable solo del editor (para el stock y las listas); no se envía */
  cid?: string;
  key?: string;
  name: string;
  hex: string;
  stage: string;
  stage_dark: boolean;
  front_path: string;
  back_path: string;
}
export interface EditorProduct {
  id: string | null;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_cop: number;
  status: 'draft' | 'active' | 'archived';
  sort_order: number;
  category: 'camisetas' | 'buzos' | 'pantalones' | 'accesorios';
  drop_number: number;
  details: string[];
  life_path: string;
  colors: EditorColor[];
  variants: { size: string; color: string; stock: number; position: number }[];
}

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const aSlug = (s: string) =>
  quitarTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const input = 'mt-2 block min-h-12 w-full rounded-md border-2 border-negro bg-blanco px-4';
const lbl = 'etiqueta block';

export default function ProductEditor({ initial, supabaseUrl }: { initial: EditorProduct; supabaseUrl: string }) {
  const [p, setP] = useState(initial);
  const [slugManual, setSlugManual] = useState(Boolean(initial.id));
  const [colores, setColores] = useState<EditorColor[]>(() =>
    initial.colors.map((c) => ({ ...c, cid: c.key ?? crypto.randomUUID() })),
  );
  const [tallas, setTallas] = useState(
    [...new Set([...initial.variants].sort((a, b) => a.position - b.position).map((v) => v.size))].join(', '),
  );
  const [stock, setStock] = useState<Record<string, number>>(
    Object.fromEntries(initial.variants.map((v) => [`${v.color}|${v.size}`, v.stock])),
  );
  const [detalles, setDetalles] = useState(initial.details.join('\n'));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  const listaTallas = useMemo(
    () => [...new Set(tallas.split(',').map((t) => t.trim()).filter(Boolean))],
    [tallas],
  );

  const url = (path: string) =>
    !path ? '' : path.startsWith('/') || path.startsWith('http') ? path : `${supabaseUrl}/storage/v1/object/public/products/${path}`;

  const set = <K extends keyof EditorProduct>(k: K, v: EditorProduct[K]) => setP((x) => ({ ...x, [k]: v }));

  const setColor = (i: number, cambio: Partial<EditorColor>) =>
    setColores((cs) => cs.map((c, j) => (j === i ? { ...c, ...cambio } : c)));

  async function subir(i: number, lado: 'front_path' | 'back_path' | 'life', file: File) {
    setError('');
    setSubiendo(`${i}-${lado}`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'No se pudo subir');
      if (lado === 'life') set('life_path', d.path);
      else setColor(i, { [lado]: d.path });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto');
    } finally {
      setSubiendo(null);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Claves únicas para colores nuevos
    const usadas = new Set(colores.map((c) => c.key).filter(Boolean) as string[]);
    const conClave = colores.map((c) => {
      if (c.key) return { ...c, key: c.key };
      const base = aSlug(c.name) || 'color';
      let k = base;
      let n = 2;
      while (usadas.has(k)) k = `${base}-${n++}`;
      usadas.add(k);
      return { ...c, key: k };
    });

    const variants = conClave.flatMap((c) =>
      listaTallas.map((s, pos) => ({ size: s, color: c.key!, stock: Math.max(0, Math.floor(stock[`${c.cid}|${s}`] ?? 0)), position: pos })),
    );

    const cuerpo = {
      ...p,
      details: detalles.split('\n').map((l) => l.trim()).filter(Boolean),
      life_path: p.life_path || null,
      colors: conClave.map(({ cid: _cid, ...c }) => ({ ...c, back_path: c.back_path || null })),
      variants,
    };

    setGuardando(true);
    try {
      const r = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'No se pudo guardar');
      window.location.href = '/admin/productos';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  }

  const claveStock = (c: EditorColor, s: string) => `${c.cid}|${s}`;

  return (
    <form onSubmit={guardar} className="space-y-12">
      {error && (
        <p role="alert" className="rounded-md border-2 border-oxido px-4 py-3 text-oxido">
          {error}
        </p>
      )}

      <section className="space-y-5">
        <h2 className="text-4xl">Datos</h2>
        <label className="block">
          <span className={lbl}>Nombre</span>
          <input
            className={input}
            required
            maxLength={80}
            value={p.name}
            onChange={(e) => {
              set('name', e.target.value);
              if (!slugManual) set('slug', aSlug(e.target.value));
            }}
          />
        </label>
        <label className="block">
          <span className={lbl}>Enlace (slug)</span>
          <input
            className={input}
            required
            value={p.slug}
            onChange={(e) => {
              setSlugManual(true);
              set('slug', aSlug(e.target.value));
            }}
          />
          <span className="mt-1 block text-sm text-texto-suave">cavra.store/producto/{p.slug || '…'}</span>
        </label>
        <label className="block">
          <span className={lbl}>Frase corta</span>
          <input className={input} maxLength={120} value={p.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </label>
        <label className="block">
          <span className={lbl}>Descripción</span>
          <textarea className={`${input} min-h-32 py-3`} maxLength={2000} value={p.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={lbl}>Precio (COP)</span>
            <input
              className={input}
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              required
              value={p.price_cop}
              onChange={(e) => set('price_cop', Math.max(0, Math.round(Number(e.target.value))))}
            />
          </label>
          <label className="block">
            <span className={lbl}>Categoría</span>
            <select className={input} value={p.category} onChange={(e) => set('category', e.target.value as EditorProduct['category'])}>
              <option value="camisetas">Camisetas</option>
              <option value="buzos">Buzos</option>
              <option value="pantalones">Pantalones</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </label>
          <label className="block">
            <span className={lbl}>Drop</span>
            <input className={input} type="number" min={1} max={99} required value={p.drop_number} onChange={(e) => set('drop_number', Math.max(1, Math.round(Number(e.target.value))))} />
          </label>
          <label className="block">
            <span className={lbl}>Orden de aparición</span>
            <input className={input} type="number" min={0} value={p.sort_order} onChange={(e) => set('sort_order', Math.max(0, Math.round(Number(e.target.value))))} />
          </label>
        </div>
        <label className="block">
          <span className={lbl}>Detalles (uno por línea)</span>
          <textarea className={`${input} min-h-28 py-3`} value={detalles} onChange={(e) => setDetalles(e.target.value)} placeholder={'Algodón perchado\nBolsillo canguro'} />
        </label>
      </section>

      <section className="space-y-5">
        <h2 className="text-4xl">Colores y fotos</h2>
        <p className="text-texto-suave">
          Cada color lleva foto de frente y, si hay, de espalda. Recomendado: WebP de máximo ~1600 px y menos de 3 MB.
        </p>
        <ul className="space-y-6">
          {colores.map((c, i) => (
            <li key={c.cid} className="space-y-4 rounded-md border-2 border-negro bg-blanco p-4">
              <div className="flex flex-wrap items-end gap-4">
                <label className="block min-w-40 flex-1">
                  <span className={lbl}>Nombre del color</span>
                  <input className={input} required maxLength={40} value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} />
                </label>
                <label className="block">
                  <span className={lbl}>Prenda</span>
                  <input type="color" className="mt-2 block h-12 w-16 cursor-pointer rounded-md border-2 border-negro bg-blanco p-1" value={c.hex} onChange={(e) => setColor(i, { hex: e.target.value })} />
                </label>
                <label className="block">
                  <span className={lbl}>Fondo</span>
                  <input type="color" className="mt-2 block h-12 w-16 cursor-pointer rounded-md border-2 border-negro bg-blanco p-1" value={c.stage} onChange={(e) => setColor(i, { stage: e.target.value })} />
                </label>
                <label className="flex min-h-12 items-center gap-2">
                  <input type="checkbox" className="size-5" checked={c.stage_dark} onChange={(e) => setColor(i, { stage_dark: e.target.checked })} />
                  <span className="text-sm">Fondo oscuro (texto claro)</span>
                </label>
                <button type="button" className="etiqueta min-h-12 rounded-full px-4 text-oxido hover:bg-tile" onClick={() => setColores((cs) => cs.filter((_, j) => j !== i))}>
                  Quitar color
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['front_path', 'back_path'] as const).map((lado) => (
                  <div key={lado}>
                    <span className={lbl}>{lado === 'front_path' ? 'Foto de frente' : 'Foto de espalda (opcional)'}</span>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="size-24 shrink-0 overflow-hidden rounded-md" style={{ background: c.stage }}>
                        {c[lado] && <img src={url(c[lado])} alt="" className="size-full object-contain" />}
                      </div>
                      <div className="space-y-2">
                        <label className="btn btn-ghost min-h-11 cursor-pointer px-4 text-xs">
                          {subiendo === `${i}-${lado}` ? 'Subiendo…' : c[lado] ? 'Cambiar' : 'Subir foto'}
                          <input
                            type="file"
                            accept="image/webp,image/jpeg,image/png,image/avif"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) subir(i, lado, f);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {lado === 'back_path' && c.back_path && (
                          <button type="button" className="etiqueta block px-2 text-texto-suave hover:text-negro" onClick={() => setColor(i, { back_path: '' })}>
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setColores((cs) => [...cs, { cid: crypto.randomUUID(), name: '', hex: '#1A1A1A', stage: '#EFE6D0', stage_dark: false, front_path: '', back_path: '' }])}
        >
          Agregar color
        </button>

        <div className="pt-4">
          <span className={lbl}>Foto en contexto (calle, opcional)</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="size-24 shrink-0 overflow-hidden rounded-md bg-tile">{p.life_path && <img src={url(p.life_path)} alt="" className="size-full object-cover" />}</div>
            <div className="space-y-2">
              <label className="btn btn-ghost min-h-11 cursor-pointer px-4 text-xs">
                {subiendo === '0-life' ? 'Subiendo…' : p.life_path ? 'Cambiar' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/webp,image/jpeg,image/png,image/avif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subir(0, 'life', f);
                    e.target.value = '';
                  }}
                />
              </label>
              {p.life_path && (
                <button type="button" className="etiqueta block px-2 text-texto-suave hover:text-negro" onClick={() => set('life_path', '')}>
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-4xl">Tallas y stock</h2>
        <label className="block">
          <span className={lbl}>Tallas (separadas por coma, en orden)</span>
          <input className={input} value={tallas} onChange={(e) => setTallas(e.target.value)} placeholder="S, M, L, XL" />
        </label>
        {colores.length > 0 && listaTallas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-80 text-left">
              <thead>
                <tr className="border-b-2 border-negro">
                  <th className="etiqueta py-2 pr-4">Color</th>
                  {listaTallas.map((s) => (
                    <th key={s} className="etiqueta px-1 py-2 text-center">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colores.map((c, i) => (
                  <tr key={c.cid} className="border-b border-linea">
                    <td className="py-2 pr-4 font-bold">{c.name || 'Sin nombre'}</td>
                    {listaTallas.map((s) => (
                      <td key={s} className="px-1 py-2">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          aria-label={`Stock ${c.name} talla ${s}`}
                          className="block min-h-11 w-16 rounded-md border-2 border-negro bg-blanco px-2 text-center"
                          value={stock[claveStock(c, s)] ?? 0}
                          onChange={(e) => setStock((st) => ({ ...st, [claveStock(c, s)]: Math.max(0, Math.round(Number(e.target.value))) }))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-texto-suave">Agrega al menos un color y una talla para poner el stock.</p>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-4xl">Estado</h2>
        <label className="block max-w-xs">
          <span className={lbl}>Visibilidad en la tienda</span>
          <select className={input} value={p.status} onChange={(e) => set('status', e.target.value as EditorProduct['status'])}>
            <option value="draft">Borrador (no se ve)</option>
            <option value="active">Activo (se ve en la tienda)</option>
            <option value="archived">Archivado (no se ve)</option>
          </select>
        </label>
        <p className="text-sm text-texto-suave">Los productos no se borran: si ya no los vendes, archívalos.</p>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t-2 border-negro bg-papel px-4 py-4 md:-mx-8 md:px-8">
        <button type="submit" className="btn" disabled={guardando || subiendo !== null}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <a href="/admin/productos" className="btn btn-ghost">Cancelar</a>
      </div>
    </form>
  );
}
