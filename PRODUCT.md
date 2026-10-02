# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hombres colombianos de 15 a 40 años, compradores de streetwear urbano. Compran tanto desde celular como desde escritorio, sin un canal claramente dominante (confirmado por el dueño — el dato "principalmente celular" del doc de marca queda descartado). El público es exclusivamente ese: no se asume por ahora un público secundario (p. ej. mujeres comprando como regalo).

Buscan ropa con identidad colombiana explícita, no streetwear genérico ni de lujo frío. Se enteran y compran por *drops* (lanzamientos por tandas), no por un catálogo continuo.

## Product Purpose

Cavra es una tienda online de ropa streetwear colombiana que lanza por drops. Existe para ofrecer una alternativa con identidad local explícita frente al streetwear genérico o importado. Éxito = el comprador completa la compra rápido (celular o escritorio), confía en la marca, y vuelve en el siguiente drop.

## Positioning

"Calle pero elegante": streetwear urbano con acabado cuidado, ni lujo frío de boutique ni estética de dropshipping. El mecanismo diferenciador que un competidor no podría copiar con honestidad:
- Léxico colombiano real en la comunicación ("la cabra" en vez de "el goat"; se dice "prenda", "colección", "nuevo", no "outfit" ni "must have").
- Mascota (cabra gris, cuernos crema, gesto desafiante) como hilo narrativo de marca, no solo un logo.
- Lanzamiento por drops en vez de reposición continua.

## Operating Context

- Mercado: Colombia. Español, trato de "tú". Envíos nacionales únicamente.
- Moneda: COP sin decimales, formato es-CO (ej. $89.900).
- Pagos: Wompi Web Checkout (único método).
- Operación: un solo administrador maneja el panel; sin roles múltiples.
- Catálogo: máximo 15 productos activos a la vez, organizados por drops.
- Compra: celular y escritorio ambos relevantes (ver Users).

## Capabilities and Constraints

- Catálogo con tope duro de 15 productos activos.
- Selector de talla/color debe deshabilitarse sin stock; guía de tallas visible en producto.
- Carrito tipo cajón (drawer): ítems, cantidades, subtotal, envío, total.
- El monto de cualquier pago se calcula siempre en el servidor desde la base de datos, nunca desde el navegador.
- Estado del pedido en la página de "gracias" debe ser el estado real (webhook), nunca confiar solo en la URL.
- Supabase con RLS en todas las tablas; el público solo lee productos activos; `/admin` restringido al administrador.
- Páginas mínimas requeridas: Inicio, Catálogo, Producto, Carrito, Gracias, Marca, Contacto, Políticas (envíos, cambios/devoluciones, privacidad/Habeas Data).
- **Sin decidir:** adaptador de despliegue / hosting (marcado "pendiente" en CLAUDE.md → Estado). No asumir un proveedor hasta que se confirme.
- Nota de documentación: CLAUDE.md referencia `docs/01-stack-y-arquitectura.md`, `docs/03`, `04` y `05`, pero esos archivos todavía no existen en el repo (solo existe `docs/02-diseno-skills-y-marca.md`). Señalado aquí para que no se asuma contenido que no está escrito.

## Brand Commitments

- Nombre visible al cliente: **Cavra** (nombre interno: Cavra Store).
- Lema principal: "El goat no, la cabra." Origen: "cabra" = *the GOAT*; la V del isotipo es una pezuña de cabra en V.
- Mascota: cabra gris de cuernos crema y gesto desafiante (`public/brand/mascota-cabra.png`). Interacciones animadas (scroll, mirada que sigue el mouse) son ideas a futuro, fuera de alcance del lanzamiento.
- Adjetivos de marca: streetwear, fresco, descomplicado.
- Estrategia de lanzamiento: por drops; la palabra "drop" se conserva tal cual en la comunicación.
- Tono de voz (propuesta, pendiente de confirmación final del dueño): directo, seguro, humor seco; trato de "tú"; frases cortas; léxico colombiano sin forzar jerga; evita anglicismos salvo "drop"; sin exclamaciones en exceso ni promesas de lujo.
- Frases confirmadas por el dueño: "El goat no, la cabra.", "Calle pero elegante.", "Hecho en Colombia."
- Frases a evitar (propuesta): ver lista completa en `docs/02-diseno-skills-y-marca.md`.
- Las especificaciones visuales completas (paleta de color, tipografía, estilo de fotografía, referencias y anti-referencias visuales) ya están definidas por el dueño en `docs/02-diseno-skills-y-marca.md` y son vinculantes: el trabajo de diseño (new-work/DESIGN.md) debe partir de ahí, no reinventarlas.

## Evidence on Hand

- Assets de marca en `public/brand/`: `logo-negro.svg`, `logo-crema.svg`, `isotipo.png`, `mascota-cabra.png`.
- Guía de marca completa en `docs/02-diseno-skills-y-marca.md` (colores, tipografía, fotografía, referencias/anti-referencias, tono de voz).
- **Sin contenido real todavía (confirmado):** no hay fotos de producto ni de campaña reales; todo el catálogo será placeholder por ahora. El trabajo de diseño y desarrollo no debe fabricar fotos de producto, testimonios, reseñas de clientes ni precios como si fueran reales.

## Product Principles

1. Pocas prendas, mucha curaduría: máximo 15 productos activos, lanzados por drops, no catálogo interminable.
2. Identidad colombiana sin genérico: léxico local, mascota cabra, "calle pero elegante" en vez de lujo frío o streetwear de plantilla.
3. Checkout corto y confiable: Wompi, monto siempre calculado en servidor, estado real del pedido (nunca solo la URL).
4. Un solo administrador: paneles y flujos simples de operar por una persona, sin roles complejos.
5. Sin urgencia falsa: nada de banners de descuento, contadores regresivos ni pop-ups (anti-referencia explícita del dueño).

## Accessibility & Inclusion

Contraste AA, foco visible, texto alternativo en fotos de producto, objetivo táctil mínimo de 44 px, formularios con etiquetas (reglas ya fijadas en `docs/02`). El público objetivo incluye posibles menores de edad (15-17 años): la política de privacidad debe tratar explícitamente el consentimiento y manejo de datos de menores (Habeas Data).
