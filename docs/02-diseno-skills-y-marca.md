# Cavra — diseño, skills y guía de marca

## 1. Skills y herramientas: quién hace qué

| Herramienta | Rol | Instalación | Cuándo |
|---|---|---|---|
| **Impeccable** | Base de diseño: tipografía, color, espacio, auditoría y pulido. Guarda el contexto de marca. | `npx impeccable install` (desde la raíz del proyecto), luego `/impeccable init` | Siempre activo. El `init` se corre **después** de llenar la guía de marca |
| **Emil Kowalski** | Manda en animaciones e interacciones (curvas, duraciones, qué animar y qué no). También ayuda a que se sienta como app en el móvil. | `npx skills@latest add emilkowalski/skills` (repo en plural: `skills`) | Siempre activo para movimiento |
| **UI UX Pro Max** | Catálogo para explorar: estilos, paletas, pares de fuentes, patrones de landing. | Copiar el comando del README de `github.com/nextlevelbuilder/ui-ux-pro-max-skill` | Solo en la exploración de la fase 1. Luego desactivar |
| **Taste Skill** | Alternativa anti-diseño-genérico, con diales de variación, movimiento y densidad. Versión actual experimental. | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | Solo si Impeccable deja algo genérico, y probada aparte |
| **21st.dev** | Registro de componentes React + Tailwind (formato shadcn) que se copian al código. | "Copy prompt" o el comando de shadcn CLI de cada componente | Piezas puntuales (galería, navegación, footer). 2 copias gratis al día |
| **framer-motion** | Librería de animación para React. | `npm i framer-motion` | Solo dentro de islas de React |

### Reglas de precedencia

1. Si dos skills se contradicen, gana **Impeccable** en diseño general y **Emil** en movimiento.
2. Nunca correr dos flujos de "init" de diseño distintos en el mismo proyecto.
3. UI UX Pro Max y Taste Skill sugieren; no reescriben lo que ya definió Impeccable.
4. Un componente de 21st.dev nunca entra tal cual: se adapta a los colores, tipografía y espaciado de Cavra.
5. Evitar héroes con shaders o efectos muy vistosos que no encajen con la marca.

## 2. Reglas de diseño y movimiento

- **Mobile-first.** La mayoría de las compras de moda vienen del celular. Diseñar primero para 390 px.
- **Rendimiento.** Astro sin JavaScript por defecto. Islas de React solo donde haga falta, con `client:visible`
  o `client:idle` cuando sea posible. Fotos ya optimizadas antes de subir (WebP/AVIF, máx. ~1600 px de ancho,
  idealmente menos de 300 KB), con `width`, `height` y `loading="lazy"` (excepto la imagen principal).
- **Movimiento (criterio Emil).** Entradas con `ease-out`; animaciones de interfaz cortas (menos de ~300 ms);
  animar solo `transform` y `opacity`; nada de rebotes exagerados; respetar `prefers-reduced-motion`.
  No animar todo: solo lo que ayuda a entender (cajón del carrito, cambio de imagen, botones, aparición de secciones).
- **Accesibilidad.** Contraste AA, foco visible, textos alternativos en fotos de producto, botones con objetivo
  táctil de mínimo 44 px, formularios con etiquetas.
- **Icons.** SVG (lucide), nunca emojis como iconos.
- **Tokens.** Colores, tipografía y espaciado como variables de Tailwind/CSS. No hardcodear hex en componentes.

## 3. Guía de marca

> Los campos marcados **(propuesta)** los redactó el asistente a partir de lo que definió el dueño de la marca; quedan como borrador hasta que se confirmen. Mientras un campo esté vacío, el agente debe **preguntar**, no inventar.

**Nombre visible al cliente:** Cavra  
**Nombre interno:** Cavra Store  
**Lema principal:** "El goat no, la cabra"  
**Origen del nombre / concepto:** Viene de "cabra" (en inglés, *the GOAT*). Marca colombiana orgullosa de su léxico: por eso se dice "la cabra" y no "el goat". La V en lugar de la B es porque el isotipo es una pezuña de cabra en forma de V, lo que le da más personalidad.  

**Personaje o mascota:** Cabra gris de cuernos crema y gesto desafiante (`mascota-cabra.png`). **A futuro (ideas, no para el lanzamiento):** da vida a las campañas y aparece en algunas partes de la web con distintas animaciones. Ideas de interacción, tomadas de otras webs solo como inspiración de comportamiento (no copiar su estética):
1. La mascota acompaña el scroll y va interactuando con el producto por el que pasa el usuario.
2. Imagen estática animada con IA cuya mirada/cabeza reacciona al movimiento del mouse.

**3 adjetivos que describen la marca:** 1) Streetwear 2) Fresco 3) Descomplicado  
**Posicionamiento:** "Calle pero elegante".

**Estrategia de lanzamiento:** por *drops* (lanzamientos por tandas). La palabra "drop" se conserva en la comunicación de lanzamientos.

**Tono de voz (propuesta):** directo, seguro y con humor seco. Habla de "tú", frases cortas, léxico colombiano natural sin forzar la jerga. Orgulloso de lo local sin agresividad. Coherente con el lema: evitar anglicismos innecesarios ("prenda", "colección", "nuevo" en lugar de "outfit" o "must have"), con la excepción de "drop" para los lanzamientos. Sin exclamaciones en exceso ni promesas de lujo.  
**Frases que sí suenan a Cavra (elegidas por el dueño):**
- "El goat no, la cabra."
- "Calle pero elegante."
- "Hecho en Colombia."

**Frases que no (propuesta):** "Exclusive luxury experience", "Tendencia global", "Must have de temporada", "¡Corre que se acaba!", frases en inglés donde hay palabra en español (salvo "drop"), jerga forzada tipo "parce" en cada línea.

**Colores**
- Principales: Crema `#EFE6D0` (crema oficial, también en el logo) · Negro `#111111` · Café `#573724`
- Paleta ampliada (secundarios; hex leídos de la imagen de la paleta, verificar contra el archivo original antes de fijarlos): Carbón `#2A2A2A` · Gris piedra `#8E8B80` · Arena `#D7C9A8` · Oliva `#55684F` · Verde bosque `#2E5D46` · Salvia `#8FA88C` · Rojo óxido `#8B3A2E` · Azul petróleo `#0F4C5C` · Azul profundo `#1E3A5F` · Vino `#682E3A` · Crema claro `#FBF5EE` · Gris humo `#4A4A4A` · Lila grisáceo `#B7AFB3`. Las muestras que estaban tapadas en la imagen original quedan **descartadas** (ya están en los principales o no se usarán): no agregarlas.
- Acento / botones: se analizará más adelante.

**Tipografía:** titulares Bebas Neue / Impact (custom) · texto Montserrat con tracking amplio

**Estilo de fotografía (propuesta):**
- Catálogo: prenda sobre fondo liso crema o arena, luz suave y pareja, mismo encuadre en todos los productos, más un detalle de tela y de costura.
- Campaña: hombres reales de 15 a 40 años (no modelos "de revista") en calle colombiana, con luz natural, encuadre de cuerpo entero y de medio cuerpo, ropa protagonista.
- Color: tonos naturales cálidos que combinen con crema, negro y café. Evitar filtros saturados.

**Logo:** wordmark "CAVRA" con la V reemplazada por el isotipo (pezuña de cabra en V, color café `#573724`). Archivos en `public/brand/`: `logo-negro.svg` (para fondos claros), `logo-crema.svg` (para fondos oscuros), `isotipo.png`, `mascota-cabra.png`. Existe además una variante con textura (imagen "Variaciones") pendiente de exportar.

**Referencias visuales (elegidas por el dueño):**
- `milfshakes.es`: manejo de marca con *drops* de distintos tipos de producto, no solo ropa. Lo que gusta: la marca como universo que lanza cosas distintas.
- `hunterscol.com`: marca con un animal como protagonista y múltiples universos. Lo que gusta: la mascota como hilo narrativo entre campañas.
- Criterio adicional (propuesta): fondos lisos de color, mucha foto y poco texto; checkout corto en celular.

**Anti-referencias (propuesta):** lujo frío y minimalista de boutique; estética de "dropshipping" con banners de descuento y contadores; streetwear genérico de calavera/fuego; tienda saturada de pop-ups.

**Público objetivo:** hombres en Colombia de 15 a 40 años. Compran principalmente desde el celular (por confirmar). Nota legal: al incluir menores de 18 años, revisar el tratamiento de datos de menores en la política de privacidad (Habeas Data).

## 4. Páginas mínimas y qué debe tener cada una

- **Inicio:** propuesta de marca en una frase, productos destacados, acceso claro al catálogo.
- **Catálogo:** cuadrícula de máximo 15 productos, foto, nombre, precio en COP, marca de "agotado".
- **Producto:** galería, selector de talla/color (deshabilitar sin stock), guía de tallas, botón de agregar,
  información de envío y cambios.
- **Carrito (cajón):** ítems, cantidades, subtotal, envío, total, botón de pagar.
- **Gracias:** estado real del pedido (ver `04`), nunca confiar solo en la URL.
- **Marca, Contacto, Políticas:** envíos, cambios y devoluciones, privacidad/tratamiento de datos (Habeas Data).
