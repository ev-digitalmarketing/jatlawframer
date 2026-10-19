import Link from "next/link";
import { MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { Btn, PageHero, Reveal, Section, Tilt } from "@/components/ui";
import { services } from "@/lib/data";

const values = [
  [MessageCircle, "Plain-language advice", "Legal processes and documents explained in terms that make sense, so you always know where you stand."],
  [PhoneCall, "Responsive & accessible", "Direct access by phone and email, with regular updates from first call to closing."],
  [ShieldCheck, "Precision & care", "Careful attention to every detail, because small mistakes become expensive problems."],
] as const;

export default function About() {
  return (
    <>
      <PageHero eyebrow="About Jat Law" title="A practice built on trust and plain language."
        text="Jat Law Professional Corporation is a Mississauga law firm led by Rizwan Jat. Clients tell us the same thing again and again: we explain every step, we pick up the phone, and we care about the outcome.">
        <Btn href="/consultation">Free Consultation</Btn>
      </PageHero>
      <Section tone="ivory" label="Our values">
        <div className="grid gap-3 md:grid-cols-3">
          {values.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="h-full">
              <Tilt className="h-full">
                <div className="h-full rounded-xl border border-navy/15 bg-white p-5 shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                  <div style={{ transform: "translateZ(40px)" }} className="grid h-12 w-12 place-items-center rounded-lg bg-navy text-gold"><Icon size={24} /></div>
                  <h3 className="mt-4 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-navy/80">{d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tone="gold" label="Services">
        <Reveal><h2 className="text-3xl font-extrabold">Where we can help</h2></Reveal>
        <div className="mt-4 flex flex-wrap gap-2">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full bg-navy px-4 py-2 font-heading text-sm font-semibold text-white shadow-3d transition hover:-translate-y-1 hover:text-gold">{s.title}</Link>
          ))}
        </div>
      </Section>
    </>
  );
}
