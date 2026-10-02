import { useEffect, useState } from 'react';
import { SqueezeCarousel, type SqueezeSlide } from '@/components/ui/carousel-squeeze';

export interface CarouselItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_cop: number;
  image: string;
  stage: string;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const toSlide = (p: CarouselItem): SqueezeSlide => ({
  id: p.slug,
  title: p.name,
  description: p.description,
  copy: false,
  image: p.image,
  imageAlt: p.name,
  background: p.stage,
  contain: true,
  href: `/producto/${p.slug}`,
  overlay: (
    <span className="block w-[min(34rem,calc(var(--sq-hero)-3rem))] shrink-0 text-left text-white">
      <span className="block whitespace-nowrap font-display text-4xl uppercase leading-[0.9] md:text-6xl">{p.name}</span>
      <span className="mt-2 block text-sm leading-snug text-white/90 md:text-base">{p.description}</span>
    </span>
  ),
});

export default function ProductCarousel({ items }: { items: CarouselItem[] }) {
  // El orden cambia en cada visita; el servidor entrega el orden base
  const [order, setOrder] = useState(items);
  useEffect(() => setOrder(shuffle(items)), [items]);

  return (
    <SqueezeCarousel
      key={order.map((p) => p.slug).join()}
      slides={order.map(toSlide)}
      label="Productos de la tienda"
      height="clamp(220px, 34cqi, 440px)"
      radius={14}
      slatWidth={72}
      slatGap={12}
      header={<h2 id="tienda-t" className="text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.85]">De la tienda</h2>}
      controlsExtra={<a href="/tienda" className="btn btn-ghost mr-2">Ver todo</a>}
      accent="var(--color-negro)"
      accentForeground="var(--color-papel)"
    />
  );
}
