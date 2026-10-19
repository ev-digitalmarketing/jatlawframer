"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { services } from "@/lib/data";
import { Btn } from "./ui";

const links = [["About", "/about"], ["Testimonials", "/testimonials"], ["Contact", "/contact"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <header className="sticky top-0 z-50 border-b-2 border-gold bg-ivory/95 shadow-3d backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-10">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Jat Law Barrister & Solicitor" width={130} height={54} priority />
        </Link>
        <nav className="hidden items-center gap-7 font-heading text-sm font-semibold lg:flex">
          <Link href="/" className="nav">Home</Link>
          <div className="group relative">
            <span className="nav flex cursor-pointer items-center gap-1">Services <ChevronDown size={14} /></span>
            <div className="invisible absolute left-0 top-full w-72 translate-y-2 border border-gold bg-ivory p-2 opacity-0 shadow-3d transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {services.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="block rounded px-3 py-2 transition hover:bg-navy hover:text-gold">{s.title}</Link>
              ))}
            </div>
          </div>
          {links.map(([t, h]) => <Link key={h} href={h} className="nav">{t}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          <Btn href="/consultation">Free Consultation</Btn>
          <button aria-label="Menu" className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav onClick={() => setOpen(false)} className="grid gap-1 border-t border-navy/10 px-4 py-3 font-heading text-sm font-semibold lg:hidden">
          <Link href="/">Home</Link>
          {services.map((s) => <Link key={s.slug} href={`/services/${s.slug}`} className="pl-4 font-normal">{s.title}</Link>)}
          {links.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}
        </nav>
      )}
      <motion.div style={{ scaleX: width }} className="absolute inset-x-0 -bottom-0.5 h-[3px] origin-left bg-navy" />
    </header>
  );
}
