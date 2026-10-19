import { Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { Reveal, Tilt } from "./ui";

export default function Testimonials({ limit }: { limit?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
      {reviews.slice(0, limit).map((r, i) => (
        <Reveal key={r.name} delay={i * 0.08} className="h-full">
          <Tilt className="h-full" max={6}>
            <figure className="flex h-full flex-col rounded-xl border-t-4 border-gold bg-ivory p-5 text-navy shadow-3d">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-4 border-t border-navy/15 pt-3 font-heading text-sm font-bold">
                {r.name}
                <span className="block text-xs font-normal text-navy/60">Google Review</span>
              </figcaption>
            </figure>
          </Tilt>
        </Reveal>
      ))}
    </div>
  );
}
