import { Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { Reveal, Slider, Tilt } from "./ui";

type Review = (typeof reviews)[number];

function Card({ r, light = false }: { r: Review; light?: boolean }) {
  return (
    <Tilt className="h-full" max={6}>
      <figure className={`flex h-full flex-col rounded-xl border-t-4 border-gold p-5 text-navy shadow-3d ${light ? "border-x border-b border-x-navy/10 border-b-navy/10 bg-white" : "bg-ivory"}`}>
        <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
        </div>
        <blockquote className="mt-3 flex-1 text-sm leading-relaxed">“{r.text}”</blockquote>
        <figcaption className="mt-4 border-t border-navy/15 pt-3 font-heading text-sm font-bold">
          {r.name}
          <span className="block text-xs font-normal text-navy/60">Google Review</span>
        </figcaption>
      </figure>
    </Tilt>
  );
}

/**
 * Featured reviews for dark sections: two side by side on desktop, so the row is always full,
 * and a swipeable slider of `mobile` reviews on phones.
 */
export default function Testimonials({ desktop = 2, mobile = 5 }: { desktop?: number; mobile?: number }) {
  return (
    <Slider label="Client reviews" tone="dark" grid="md:grid-cols-2"
      items={reviews.slice(0, mobile).map((r) => <Card key={r.name} r={r} />)} desktopMax={desktop} />
  );
}

/** Every review in a grid, for the dedicated testimonials page (on a light section). */
export function ReviewList() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
      {reviews.map((r, i) => (
        <Reveal key={r.name} delay={(i % 3) * 0.08} className="h-full"><Card r={r} light /></Reveal>
      ))}
    </div>
  );
}
