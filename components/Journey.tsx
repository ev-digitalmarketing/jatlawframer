"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Reveal } from "./ui";

const lineX: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.6, ease: "easeInOut", delay: 0.15 } } };
const lineY: Variants = { hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.6, ease: "easeInOut", delay: 0.15 } } };
const dot: Variants = { hidden: { scale: 0 }, show: (i: number) => ({ scale: 1, transition: { type: "spring", stiffness: 380, damping: 16, delay: 0.35 + i * 0.4 } }) };
const item: Variants = { hidden: { opacity: 0, y: 26 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.45 + i * 0.4 } }) };

/** Animated step timeline: line draws in, dots pop, steps rise one after another. */
export default function Journey({ eyebrow, title, steps, center = false }: { eyebrow: string; title: string; steps: string[][]; center?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <>
      <Reveal className={center ? "text-center" : ""}>
        <p className="font-script text-2xl text-gold md:text-3xl">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-extrabold md:text-4xl">{title}</h2>
      </Reveal>
      <motion.ol initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, amount: 0.3 }}
        className="relative mt-10 grid gap-9 lg:grid-cols-4 lg:gap-6">
        <motion.span aria-hidden variants={lineX} className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-gradient-to-r from-gold via-gold/60 to-gold/10 lg:block" />
        {!center && <motion.span aria-hidden variants={lineY} className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-gold via-gold/60 to-gold/10 lg:hidden" />}
        {steps.map(([t, d], i) => (
          <li key={t} className={`group relative ${center ? "pt-9 text-center" : "pl-9 lg:pl-0 lg:pt-10"}`}>
            <span aria-hidden className={`absolute ${center ? "left-1/2 top-0 -translate-x-1/2" : "left-0 top-1 lg:top-0"} h-[15px] w-[15px]`}>
              <motion.span custom={i} variants={dot} className="grid h-full w-full place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/50 [animation-duration:2.6s] motion-reduce:animate-none" />
                <span className={`relative h-[15px] w-[15px] rounded-full bg-gold ring-4 ${center ? "ring-ink" : "ring-navy"} transition duration-300 group-hover:scale-125`} />
              </motion.span>
            </span>
            <motion.div custom={i} variants={item}>
              <span className="font-heading text-sm font-bold tracking-widest text-gold">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold text-white transition duration-300 group-hover:text-gold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{d}</p>
            </motion.div>
          </li>
        ))}
      </motion.ol>
    </>
  );
}
