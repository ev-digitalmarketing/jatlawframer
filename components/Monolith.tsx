"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const Statue = dynamic(() => import("./StatueScene"), { ssr: false });

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
  const [model, setModel] = useState(false); // true once a sculpted public/statue.glb exists, it then replaces the built-in statue
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
  const fade = useTransform(scrollYProgress, (p) => (p > 0.93 ? Math.max(0, (1 - p) / 0.07) : 1));
  const opacity = useTransform([appear, fade], (v: number[]) => v[0] * v[1]);
  const scale = useTransform([appear, fade], (v: number[]) => (0.1 + 0.9 * v[0]) * (0.6 + 0.4 * v[1]));

  if (reduce) return null;
  return (
    <motion.div aria-hidden style={{ x, y }}
      className="pointer-events-none fixed bottom-3 right-3 z-30 h-[var(--h)] w-[calc(var(--h)*0.68)] xl:bottom-auto xl:left-1/2 xl:right-auto xl:top-1/2 xl:ml-[calc(var(--h)*-0.34)] xl:mt-[calc(var(--h)*-0.5)]">
      <motion.div style={{ scale, opacity }} className="relative h-full w-full">
        <Statue rotY={rotateY} glb={model} />
      </motion.div>
    </motion.div>
  );
}
