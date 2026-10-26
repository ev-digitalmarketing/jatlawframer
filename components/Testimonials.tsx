import { Quote, Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { Slider, Tilt } from "./ui";

/** limit = how many reviews exist in the slider (phones). desktopCount = how many show on desktop (default: all of them). */
export default function Testimonials({ limit, desktopCount }: { limit?: number; desktopCount?: number }) {
  return (
    <Slider label="Client reviews" desktop="md:grid-cols-2" desktopCount={desktopCount} lastSpan={desktopCount === undefined}>
      {reviews.slice(0, limit).map((r) => (
        <Tilt key={r.name} className="h-full" max={5}>
          <figure className="relative flex h-full flex-col rounded-xl border-t-4 border-gold bg-white p-5 text-navy shadow-3d md:p-7">
            <Quote aria-hidden size={46} className="absolute right-5 top-5 text-gold/20" />
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed md:text-[15px]">“{r.text}”</blockquote>
            <figcaption className="mt-4 border-t border-navy/15 pt-3 font-heading text-sm font-bold">
              {r.name}
              <span className="block text-xs font-normal text-navy/60">Google Review</span>
            </figcaption>
          </figure>
        </Tilt>
      ))}
    </Slider>
  );
}
