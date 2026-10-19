import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Btn, Reveal, Section, Tilt } from "@/components/ui";
import Testimonials from "@/components/Testimonials";
import { services } from "@/lib/data";

const steps = [
  ["Free consultation", "Tell us your situation. We listen first and explain your options in plain language."],
  ["Clear plan & quote", "A straightforward roadmap and accurate pricing, with no surprises."],
  ["We handle the details", "Documents, deadlines and filings managed with precision and regular updates."],
  ["Closed, and still here", "Even after your file closes, we stay reachable for follow-up questions."],
];

export default function Home() {
  return (
    <>
      <Section tone="navy" label="Welcome" className="overflow-hidden">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Barrister & Solicitor · Mississauga</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">Clear counsel.<br /><span className="text-gold">Confident outcomes.</span></h1>
            <p className="mt-4 max-w-md text-white/80">Real estate, litigation, corporate, estates and family matters, handled with care, precision and plain-language advice.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn href="/consultation">Free Consultation</Btn>
              <Btn href="#services" variant="line">Explore Services</Btn>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="ivory" id="services" label="Services">
        <Reveal><p className="eyebrow !text-navy/60">Step 1 · Choose your service</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">How can we help?</h2></Reveal>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.06} className="h-full">
              <Link href={`/services/${s.slug}`} className="block h-full">
                <Tilt className="h-full">
                  <div className="h-full rounded-xl border border-navy/15 bg-white p-5 shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(40px)" }} className="grid h-12 w-12 place-items-center rounded-lg bg-navy text-gold shadow-3d"><s.icon size={24} /></div>
                    <h3 style={{ transform: "translateZ(20px)" }} className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold">{s.tag}</p>
                    <p className="mt-2 text-sm text-navy/80">{s.intro}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold">Learn more <ArrowRight size={14} /></span>
                  </div>
                </Tilt>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="gold" label="Your journey">
        <Reveal><p className="eyebrow !text-navy">Step 2 · Your journey</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">What working with us looks like</h2></Reveal>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="h-full">
              <Tilt className="h-full">
                <div className="h-full rounded-xl bg-navy p-5 text-white shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                  <span style={{ transform: "translateZ(50px)" }} className="block font-heading text-5xl font-extrabold text-gold">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-white/80">{d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="navy" label="Reviews">
        <Reveal><p className="eyebrow">Step 3 · Hear from clients</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Trusted across the GTA</h2></Reveal>
        <div className="mt-5"><Testimonials limit={3} /></div>
        <div className="mt-5"><Btn href="/testimonials" variant="line">Read all reviews</Btn></div>
      </Section>
    </>
  );
}
