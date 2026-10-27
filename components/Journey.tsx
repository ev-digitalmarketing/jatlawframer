"use client";
import { useRef, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * A process timeline. On desktop the steps sit side by side on one rail that draws itself left to right,
 * each dot popping as the line reaches it. On phones it becomes a vertical rail where every step
 * animates as it scrolls into view. Pure CSS transitions, switched on once by an in-view check.
 */

const COL = 0.45; // seconds between columns on desktop (also how long the line takes to cross one column)

function Step({ i, title, text }: { i: number; title: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.55 });
  const on = seen || !!reduce;

  // --d: delay on desktop (all four enter together, so we stagger by column). --m: a shorter stagger on phones,
  // where several steps can also be on screen at once.
  const at = (desktop: number, mobile: number) => ({ "--d": `${i * COL + desktop}s`, "--m": `${i * 0.16 + mobile}s` }) as CSSProperties;
  const delay = "[transition-delay:var(--m)] md:[transition-delay:var(--d)]";
  const rise = `transition duration-700 ease-out motion-reduce:transition-none ${delay} ${on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`;

  return (
    <li ref={ref} className="relative pb-10 pl-10 last:pb-0 md:pb-0 md:pl-0 md:pt-9">
      {/* the rail: a faint track with a gold line drawn over it, ending in the next dot */}
      <span aria-hidden className="absolute bottom-[-10px] left-[6.5px] top-[10px] w-px bg-white/15 max-md:last:hidden md:bottom-auto md:left-[7px] md:right-[calc(-1.5rem_-_7px)] md:top-[7px] md:h-px md:w-auto md:last:right-0">
        <span style={at(0, 0.1)}
          className={`absolute inset-0 origin-top bg-gold transition-transform duration-[600ms] ease-linear motion-reduce:transition-none md:origin-left md:duration-[450ms] ${delay} ${on ? "scale-y-100 md:scale-x-100" : "scale-y-0 md:scale-x-0 md:scale-y-100"}`} />
      </span>

      {/* the dot, with a single ping when it lands */}
      <span aria-hidden style={at(0, 0)}
        className={`absolute left-0 top-[3px] h-3.5 w-3.5 rounded-full bg-gold shadow-[0_0_0_4px_rgba(200,169,8,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none md:top-0 ${delay} ${on ? "scale-100" : "scale-0"}`}>
        {on && !reduce && <span className="absolute inset-0 rounded-full bg-gold/70 [animation:dot-ping_1.1s_cubic-bezier(0,0,0.2,1)_var(--m)_1_both] md:[animation:dot-ping_1.1s_cubic-bezier(0,0,0.2,1)_var(--d)_1_both]" />}
      </span>

      <p style={at(0.12, 0.08)} className={`font-heading text-sm font-bold tracking-widest text-gold ${rise}`}>0{i + 1}</p>
      <h3 style={at(0.22, 0.16)} className={`mt-2 text-lg font-bold leading-snug text-white md:mt-3 ${rise}`}>{title}</h3>
      <p style={at(0.34, 0.24)} className={`mt-2 text-sm leading-relaxed text-white/70 ${rise}`}>{text}</p>
    </li>
  );
}

export default function Journey({ steps }: { steps: readonly (readonly [string, string])[] }) {
  return (
    <ol className="mt-10 grid md:grid-cols-4 md:gap-x-6">
      {steps.map(([t, d], i) => <Step key={t} i={i} title={t} text={d} />)}
    </ol>
  );
}
