"use client";
import { Component, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const Scene = dynamic(() => import("./CourtroomScene"), { ssr: false });

// If WebGL isn't available the page simply shows its content on the dark background.
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Fixed 3D courtroom behind the page. Scrolling the children walks the camera through the room. */
export default function CourtroomStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.5 });
  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="fixed inset-0 z-0 bg-ink">
        <Boundary>
          <div className={`h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Scene progress={progress} still={reduce} onReady={() => setReady(true)} />
          </div>
        </Boundary>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,14,28,0.15)_0%,rgba(6,14,28,0.72)_100%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** One station in the courtroom: centred content that flies in from depth and passes by as you scroll. */
export function Stage({ id, label, hero = false, children }: { id: string; label: string; hero?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(p, hero ? [0, 0.5, 0.9] : [0, 0.2, 0.82, 1], hero ? [1, 1, 0] : [0, 1, 1, 0]);
  const scale = useTransform(p, hero ? [0.5, 0.9] : [0, 0.25, 0.8, 1], hero ? [1, 1.12] : [0.86, 1, 1, 1.1]);
  const y = useTransform(p, hero ? [0.5, 0.9] : [0, 0.25], hero ? [0, -40] : [70, 0]);
  const rotateX = useTransform(p, hero ? [0, 1] : [0, 0.25, 0.8, 1], hero ? [0, 0] : [16, 0, 0, -10]);
  return (
    <section ref={ref} id={id} data-label={label} className="scroll-mt-14 flex min-h-[calc(100svh-4.5rem)] items-center justify-center px-4 py-16 text-center text-white md:px-10">
      <motion.div style={reduce ? undefined : { opacity, scale, y, rotateX, transformPerspective: 1100 }} className="w-full max-w-6xl">
        {children}
      </motion.div>
    </section>
  );
}
