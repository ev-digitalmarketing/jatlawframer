"use client";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { biz, services } from "@/lib/data";
import { Reveal } from "./ui";

export default function Footer() {
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const body = `Name: ${d.name}\nPhone: ${d.phone}\nService: ${d.service}\n\n${d.message}`;
    window.location.href = `mailto:${biz.email}?subject=${encodeURIComponent("Website enquiry – " + d.name)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  return (
    <footer id="contact" data-label="Contact" className="slab scroll-mt-14 bg-ink px-4 pb-10 text-white md:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <p className="eyebrow">Contact Jat Law</p>
          <h2 className="mt-2 text-3xl font-extrabold">Let’s talk about your matter.</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/85">
            <li className="flex gap-3"><Phone size={18} className="shrink-0 text-gold" /><a href={biz.tel}>{biz.phone}</a></li>
            <li className="flex gap-3"><Mail size={18} className="shrink-0 text-gold" /><a href={`mailto:${biz.email}`}>{biz.email}</a></li>
            <li className="flex gap-3"><MapPin size={18} className="shrink-0 text-gold" /><a href={biz.map} target="_blank" rel="noreferrer">{biz.address}</a></li>
            <li className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-gold" />
              <table className="w-full max-w-xs"><tbody>
                {biz.hours.map(([d, t]) => (<tr key={d} className="border-b border-white/10"><td className="py-1 pr-4 font-semibold">{d}</td><td className="py-1 text-right">{t}</td></tr>))}
              </tbody></table>
            </li>
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-3">
          <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-3d sm:grid-cols-2">
            <input name="name" required placeholder="Full name" className="field" />
            <input name="phone" type="tel" placeholder="Phone" className="field" />
            <input name="email" type="email" required placeholder="Email" className="field sm:col-span-2" />
            <select name="service" className="field sm:col-span-2 [&>option]:text-ink" defaultValue="Free consultation">
              <option>Free consultation</option>
              {services.map((s) => <option key={s.slug}>{s.title}</option>)}
            </select>
            <textarea name="message" required rows={4} placeholder="How can we help?" className="field sm:col-span-2" />
            <button type="submit" className="btn justify-center bg-gold text-ink transition hover:-translate-y-0.5 sm:col-span-2">Send message</button>
            {sent && <p className="text-sm text-gold sm:col-span-2">Your email app should open with your message ready to send. Thank you!</p>}
          </form>
        </Reveal>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-4 text-xs text-white/50">
        © {new Date().getFullYear()} Jat Law Professional Corporation. Information on this site is general and is not legal advice.
      </p>
    </footer>
  );
}
