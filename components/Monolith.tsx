"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const Statue = dynamic(() => import("./StatueScene"), { ssr: false });
const N = 12; // extrusion slices (more = smoother edges)

export default function Monolith() {
  const reduce = useReducedMotion();
  const path = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 70, damping: 20, mass: 0.6 });
  const appear = useMotionValue(0);
  const intro = useMotionValue(720);
  const side = useMotionValue(1);   // +1 = statue on the right, -1 = left
  const turns = useMotionValue(0);  // +360 each time we move to the next section
  const sideS = useSpring(side, { stiffness: 60, damping: 18 });
  const turnsS = useSpring(turns, { stiffness: 40, damping: 14 });
  const [model, setModel] = useState(false); // true once public/statue.glb exists
  useEffect(() => {
    fetch("/statue.glb", { method: "HEAD" }).then((r) => setModel(r.ok && !(r.headers.get("content-type") || "").includes("html"))).catch(() => {});
  }, []);

  useEffect(() => {
    const a = animate(appear, 1, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
    const b = animate(intro, 0, { duration: 2.8, ease: [0.22, 1, 0.36, 1] });
    return () => { a.stop(); b.stop(); };
  }, [appear, intro]);

  // Swap sides on every section so the content always has the free lane
  useEffect(() => {
    let last = -1;
    let io: IntersectionObserver | undefined;
    side.set(1);
    const t = setTimeout(() => {
      const els = Array.from(document.querySelectorAll("main > section"));
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = els.indexOf(e.target);
        if (i === last) return;
        if (last !== -1) turns.set(turns.get() + (i > last ? 360 : -360));
        last = i;
        side.set(i % 2 === 0 ? 1 : -1);
      }), { rootMargin: "-45% 0px -50% 0px" });
      els.forEach((e) => io!.observe(e));
    }, 150);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [path, side, turns]);

  const x = useTransform(sideS, (s) => `calc(var(--off) * ${s})`);
  const y = useTransform([appear, smooth], (v: number[]) => (1 - v[0]) * -320 + Math.sin(v[1] / 260) * 10);
  const rotateY = useTransform([intro, turnsS, sideS, smooth], (v: number[]) => v[0] + v[1] - v[2] * 18 + Math.sin(v[3] / 500) * 14);
  const rotateX = useTransform(smooth, (v) => Math.sin(v / 700) * 4);
  const fade = useTransform(scrollYProgress, (p) => (p > 0.93 ? Math.max(0, (1 - p) / 0.07) : 1));
  const opacity = useTransform([appear, fade], (v: number[]) => v[0] * v[1]);
  const scale = useTransform([appear, fade], (v: number[]) => (0.1 + 0.9 * v[0]) * (0.6 + 0.4 * v[1]));

  if (reduce) return null;
  const VB = "-14 0 228 400";
  return (
    <motion.div aria-hidden style={{ x, y }}
      className="pointer-events-none fixed bottom-3 right-3 z-30 h-[var(--h)] w-[calc(var(--h)*0.57)] xl:bottom-auto xl:left-1/2 xl:right-auto xl:top-1/2 xl:ml-[calc(var(--h)*-0.285)] xl:mt-[calc(var(--h)*-0.5)]">
      {/* One lady, drawn once, reused for every slice */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <g id="lady" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="100" cy="30" r="10" stroke="none" />
            <circle cx="100" cy="52" r="17" stroke="none" />
            <rect x="94" y="66" width="12" height="18" stroke="none" />
            <path stroke="none" d="M72 84 Q100 74 128 84 C132 130 138 230 152 368 H48 C62 230 68 130 72 84Z" />
            <path fill="none" strokeWidth="11" d="M76 96 L50 134 L34 98" />
            <path fill="none" strokeWidth="11" d="M124 96 L160 150 L172 170" />
            <path fill="none" strokeWidth="5" d="M34 98 V40 M4 52 H64 M4 52 L-4 84 M4 52 L14 84 M64 52 L54 84 M64 52 L74 84" />
            <path stroke="none" d="M-6 84 Q5 104 16 84Z M52 84 Q63 104 76 84Z" />
            <path fill="none" strokeWidth="7" d="M172 172 V350 M160 174 H184" />
            <path stroke="none" d="M168 350 L172 368 L176 350Z M26 368 H174 V384 H26Z M14 384 H186 V398 H14Z" />
          </g>
        </defs>
      </svg>
      <motion.div style={{ scale, opacity, perspective: 1100 }} className="relative h-full w-full">
        <div className="absolute left-1/2 top-full -mt-2 h-4 w-3/4 -translate-x-1/2 rounded-full bg-black/40 blur-md" />
        {model ? (
          <div className="absolute left-1/2 top-0 h-full w-[calc(var(--h)*0.68)] -translate-x-1/2"><Statue rotY={rotateY} /></div>
        ) : (
        <motion.div style={{ rotateY, rotateX, transformStyle: "preserve-3d" }} className="relative h-full w-full">
          {Array.from({ length: N }).map((_, i) => (
            <svg key={i} viewBox={VB} className="absolute inset-0 h-full w-full"
              style={{ color: `hsl(48 88% ${28 + i * 2.6}%)`, transform: `translateZ(calc(var(--h) * ${((i - (N - 1) / 2) * 0.008).toFixed(4)}))` }}>
              <use href="#lady" />
            </svg>
          ))}
          <svg viewBox={VB} className="absolute inset-0 h-full w-full" style={{ transform: `translateZ(calc(var(--h) * ${((N / 2) * 0.008 + 0.002).toFixed(4)}))` }}>
            <rect x="82" y="47" width="36" height="8" rx="3" fill="#0A2240" />
            <g fill="none" stroke="#8E7506" strokeWidth="2" strokeLinecap="round" opacity=".6">
              <path d="M88 120 C86 200 82 280 78 362" /><path d="M112 120 C114 200 118 280 122 362" /><path d="M100 104 V362" />
              <path d="M74 132 L126 116" />
            </g>
          </svg>
        </motion.div>)}
      </motion.div>
    </motion.div>
  );
}
