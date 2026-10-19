import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Btn, PageHero, Reveal, Section, Tilt } from "@/components/ui";
import Testimonials from "@/components/Testimonials";
import { biz } from "@/lib/data";

export default function Contact() {
  const cards = [
    { Icon: Phone, t: "Call", v: biz.phone, h: biz.tel },
    { Icon: Mail, t: "Email", v: biz.email, h: `mailto:${biz.email}` },
    { Icon: MapPin, t: "Visit", v: biz.address, h: biz.map },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch." text="Call, email or visit our Mississauga office, or use the form below. Your first consultation is free.">
        <Btn href={biz.tel}>Call {biz.phone}</Btn>
        <Btn href="/consultation" variant="line">Free Consultation</Btn>
      </PageHero>
      <Section tone="ivory" label="Reach us">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
          {cards.map(({ Icon, t, v, h }, i) => (
            <Reveal key={t} delay={i * 0.06} className="h-full">
              <a href={h} className="block h-full">
                <Tilt className="h-full">
                  <div className="h-full rounded-xl border border-navy/15 bg-white p-5 shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(40px)" }} className="grid h-12 w-12 place-items-center rounded-lg bg-navy text-gold"><Icon size={24} /></div>
                    <h3 className="mt-3 font-bold">{t}</h3>
                    <p className="mt-1 break-words text-sm text-navy/80">{v}</p>
                  </div>
                </Tilt>
              </a>
            </Reveal>
          ))}
          <Reveal delay={0.2} className="h-full">
            <Tilt className="h-full">
              <div className="h-full rounded-xl bg-navy p-5 text-white shadow-3d">
                <Clock className="text-gold" />
                <h3 className="mt-3 font-bold">Hours</h3>
                <ul className="mt-1 text-sm">
                  {biz.hours.map(([d, t]) => <li key={d} className="flex justify-between border-b border-white/10 py-0.5"><span>{d}</span><span>{t}</span></li>)}
                </ul>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </Section>
      <Section tone="gold" label="Reviews">
        <Reveal><h2 className="text-3xl font-extrabold">Why clients recommend us</h2></Reveal>
        <div className="mt-4"><Testimonials limit={3} /></div>
      </Section>
    </>
  );
}
