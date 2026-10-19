"use client";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

// Tweak the feel here
const SPIN = 0.45;     // degrees of spin per pixel scrolled
const PERIOD = 380;    // pixels per left/right swing (smaller = swings faster)

const faces = [
  { t: "J", bg: "linear-gradient(135deg,#E2C84A,#C8A908)", fg: "#F8F4E9", size: 0.62 },
  { t: "A", bg: "linear-gradient(135deg,#C8A908,#9C8205)", fg: "#F8F4E9", size: 0.62 },
  { t: "T", bg: "linear-gradient(135deg,#E2C84A,#C8A908)", fg: "#F8F4E9", size: 0.62 },
  { t: "LAW", bg: "linear-gradient(135deg,#1d5189,#0A2240)", fg: "#C8A908", size: 0.3 },
];
const D = "calc(var(--s) / 2)";

export default function Monolith() {
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 70, damping: 20, mass: 0.6 });
  const appear = useMotionValue(0);
  const intro = useMotionValue(720);

  useEffect(() => {
    const a = animate(appear, 1, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
    const b = animate(intro, 0, { duration: 2.8, ease: [0.22, 1, 0.36, 1] });
    return () => { a.stop(); b.stop(); };
  }, [appear, intro]);

  const x = useTransform(smooth, (v) => `calc(var(--amp) * ${Math.cos(v / PERIOD)})`);
  const y = useTransform([appear, smooth], (v: number[]) => (1 - v[0]) * -280 + Math.sin(v[1] / 260) * 14);
  const rotateY = useTransform([smooth, intro], (v: number[]) => v[0] * SPIN + v[1]);
  const rotateX = useTransform(smooth, (v) => 14 + Math.sin(v / 500) * 10);
  const fade = useTransform(scrollYProgress, (p) => (p > 0.93 ? Math.max(0, (1 - p) / 0.07) : 1));
  const opacity = useTransform([appear, fade], (v: number[]) => v[0] * v[1]);
  const scale = useTransform([appear, fade], (v: number[]) => (0.1 + 0.9 * v[0]) * (0.6 + 0.4 * v[1]));

  if (reduce) return null;
  return (
    <motion.div aria-hidden style={{ x, y }}
      className="pointer-events-none fixed left-1/2 top-[80%] z-30 ml-[calc(var(--s)/-2)] mt-[calc(var(--s)*-0.7)] h-[calc(var(--s)*1.4)] w-[var(--s)] [--amp:20vw] [--s:72px] md:top-1/2 md:[--amp:30vw] md:[--s:128px]">
      <motion.div style={{ scale, opacity, perspective: 900 }} className="relative h-full w-full">
        <div className="absolute left-1/2 top-full mt-6 h-4 w-2/3 -translate-x-1/2 rounded-full bg-black/40 blur-md" />
        <motion.div style={{ rotateY, rotateX, transformStyle: "preserve-3d" }} className="relative h-full w-full">
          {faces.map((f, k) => (
            <div key={f.t} className="absolute inset-0 flex items-end justify-center pb-[12%] font-serif font-bold [backface-visibility:hidden]"
              style={{ background: f.bg, color: f.fg, fontSize: `calc(var(--s) * ${f.size})`, transform: `rotateY(${k * 90}deg) translateZ(${D})`, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.18)" }}>
              {f.t}
            </div>
          ))}
          {[1, -1].map((d) => (
            <div key={d} className="absolute left-0 top-[calc(var(--s)*0.2)] h-[var(--s)] w-full bg-gold-light [backface-visibility:hidden]"
              style={{ transform: `rotateX(${90 * d}deg) translateZ(calc(var(--s) * 0.7))` }} />
          ))}
          <div className="absolute -inset-10" style={{ transform: "rotateX(72deg)", transformStyle: "preserve-3d" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="relative h-full w-full rounded-full border border-gold/70">
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory shadow" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
