"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const spring = { type: "spring", stiffness: 300, damping: 20 } as const;
const tones = { navy: "bg-navy text-white", ink: "bg-ink text-white", ivory: "bg-ivory text-navy", gold: "bg-gold text-ink" };

export function Section({ tone, id, className = "", children }: { tone: keyof typeof tones; id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${tones[tone]} px-4 py-8 md:px-10 md:py-10 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function Tilt({ children, className = "", max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring);
  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div className="h-full" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -6, scale: 1.02 }} transition={spring}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
        onMouseLeave={() => { x.set(0); y.set(0); }}>
        {children}
      </motion.div>
    </div>
  );
}

export function Btn({ href, children, variant = "gold" }: { href: string; children: ReactNode; variant?: "gold" | "navy" | "line" }) {
  const v = { gold: "bg-gold text-ink", navy: "bg-navy text-white", line: "border-2 border-current shadow-none" }[variant];
  return (
    <motion.span className="inline-block" whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring}>
      <Link href={href} className={`btn ${v}`}>{children}</Link>
    </motion.span>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: ReactNode }) {
  return (
    <Section tone="navy">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-white/80">{text}</p>
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </Reveal>
    </Section>
  );
}

export function HeroStack() {
  return (
    <Tilt max={16} className="mx-auto w-72 md:w-96">
      <div className="flex h-72 gap-2 md:h-96" style={{ transformStyle: "preserve-3d" }}>
        {["J", "A", "T"].map((l, i) => (
          <motion.div key={l} style={{ z: i * 36, clipPath: "polygon(0 14%,100% 0,100% 100%,0 100%)" }}
            animate={{ y: [0, -10, 0] }} transition={{ duration: 5, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-1 items-end justify-center bg-gold pb-6 font-serif text-6xl font-bold text-ivory md:text-7xl">
            {l}
          </motion.div>
        ))}
      </div>
    </Tilt>
  );
}
