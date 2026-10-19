"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Rail() {
  const path = usePathname();
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    const t = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-label]"));
      setItems(els.map((e) => ({ id: e.id, label: e.dataset.label || "" })));
      io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
      els.forEach((e) => io!.observe(e));
    }, 150);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [path]);
  return (
    <nav aria-label="Page sections" className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className="group flex items-center gap-2">
          <span className={`rounded bg-ink px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white shadow-3d transition group-hover:opacity-100 ${active === i.id ? "opacity-100" : "opacity-0"}`}>{i.label}</span>
          <span className={`block rounded-full ring-2 ring-ink transition-all ${active === i.id ? "h-4 w-4 bg-gold" : "h-2.5 w-2.5 bg-ivory"}`} />
        </a>
      ))}
    </nav>
  );
}
