# Cavra — reglas del proyecto

Tienda online de ropa. Trabajamos en español, respuestas claras y cortas. Avisar antes de decisiones grandes (stack, pagos, base de datos).

## Marca
- Nombre interno: "Cavra Store". Todo lo que ve el cliente (textos, títulos, correos, metadatos, políticas) dice solo **"Cavra"**.
- No inventar identidad de marca (colores, tipografía, tono, mascota). Se define en `docs/02-diseno-skills-y-marca.md`. Si falta algo, preguntar.

## Mercado y alcance
- Colombia: español con trato de "tú", moneda COP sin decimales con formato es-CO ($89.900), envíos nacionales.
- Alcance inicial: máximo 15 productos, un solo administrador, pagos con Wompi.

## Stack (no cambiar sin preguntar)
Astro + @astrojs/react (islas) + Tailwind v4 + shadcn/ui + framer-motion + Supabase (base de datos, login e imágenes) + Wompi Web Checkout. Detalle y orden de trabajo en `docs/01-stack-y-arquitectura.md`.

## Diseño
- Mobile-first, rápido y accesible. React solo donde haya interactividad (carrito, galería, panel admin); el resto en Astro sin JavaScript.
- Impeccable es la base de diseño. Emil Kowalski manda en animaciones. UI UX Pro Max solo para explorar. Taste Skill solo si se pide. Nunca dos flujos de "init" de diseño.
- Componentes de 21st.dev: solo piezas puntuales, adaptadas a colores y tipografía de la marca.
- Animar solo `transform` y `opacity`; respetar `prefers-reduced-motion`.

## Seguridad y pagos (críticas)
- Nunca pedir ni escribir llaves o secretos en el chat. Van en `.env`, fuera de git. Variables con `PUBLIC_` llegan al navegador: jamás secretos ahí.
- El monto de un pago SIEMPRE se calcula en el servidor desde la base de datos, nunca desde lo que envía el navegador.
- La firma de integridad de Wompi se genera solo en el servidor.
- El webhook de Wompi verifica el checksum y es idempotente. El pedido pasa a "pagado" solo por el webhook.
- Supabase con RLS activo en todas las tablas. El público solo lee productos activos. `/admin` es solo para el administrador. Detalle en docs 03, 04 y 05.

## Forma de trabajar
- Por fases (orden en el doc 01), sin saltar fases. Al terminar cada una: qué quedó hecho y cómo probarlo.
- Si algo de Wompi, Astro o Supabase pudo cambiar, verificar en la documentación oficial antes de escribir código.
- Cambios pequeños y revisables, con 1 o 2 líneas explicando qué cambió.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — compilar
- `npm run check` — revisar tipos (astro check)
- Agregar componentes shadcn: `npx shadcn@latest add <componente>`

## Estado
- Fase 0 (base) lista. Hosting: Cloudflare (Workers, desplegado desde GitHub, dominio cavra.store con DNS en Cloudflare). Adaptador `@astrojs/cloudflare` instalado.
- Fase 1 (marca) lista: PRODUCT.md, docs/02 y assets en public/brand/.
- Front v2 (decisión del dueño: front antes que base de datos). Fondo claro (crema claro #FBF5EE), hero con la cabra que sigue el cursor (ojos y cabeza), bento "Lo nuevo", cards con segunda foto al hover, producto tipo escenario (prenda al frente, colores desenfocados atrás, giro frente/espalda), carrito en cajón (localStorage, sin pago).
- Fase 2 (BD) lista: Supabase proyecto `cavra` (São Paulo). SQL en `supabase/` (002 amplía el esquema del doc 03; seed-drop-1.sql = datos de mentira). El catálogo se lee con `src/lib/catalog.ts`; las páginas de inicio, tienda y producto se renderizan bajo demanda (`prerender = false`). Variables PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY: en `.env` local y como variables de BUILD en Cloudflare.
- Tipos y constantes del catálogo en `src/data/products.ts`; datos de mentira solo en `src/data/products.mock.ts` (para regenerar el seed). Fotos en `public/img/` generadas con IA (ComfyUI, Z-Image Turbo) como referencia: reemplazar por fotos reales antes de lanzar. Workflows e imágenes originales en `.comfy/` (fuera de git).
- El color de acento de botones sigue pendiente (hoy negro).

- Hero v4 (actual): cabra en vivo sin cortes. La cara gira completa sobre el cuello y la zona del cuello se dobla en 30 franjas diagonales (clip-path) paralelas a la mandíbula; el cuerpo queda quieto. Pupilas y parpadeo encima. Imagen: `public/img/cabra-base.webp`.
