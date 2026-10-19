import { Btn, PageHero, Reveal, Section, Tilt } from "@/components/ui";
import Testimonials from "@/components/Testimonials";
import { biz } from "@/lib/data";

const steps = [
  ["Tell us your story", "Share the facts of your matter by phone, in person or through the form below."],
  ["Get clear guidance", "We explain your options, likely steps and costs in plain language."],
  ["You decide", "No pressure. Move forward only when you feel confident and informed."],
];
const bring = ["Any agreements, notices or letters", "Names of the other parties involved", "Key dates and deadlines", "Your questions, written down"];

export default function Consultation() {
  return (
    <>
      <PageHero eyebrow="Free Consultation" title="Book your free consultation." text="Speak directly with our team about your real estate, litigation, corporate, estates or divorce matter.">
        <Btn href={biz.tel}>Call {biz.phone}</Btn>
        <Btn href="#contact" variant="line">Use the form</Btn>
      </PageHero>
      <Section tone="ivory" label="What to expect">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-2">
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="h-full">
              <Tilt className="h-full">
                <div className="h-full rounded-xl bg-navy p-5 text-white shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                  <span style={{ transform: "translateZ(50px)" }} className="block font-heading text-4xl font-extrabold text-gold">0{i + 1}</span>
                  <h3 className="mt-2 font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-white/80">{d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
          <Reveal delay={0.3} className="h-full">
            <div className="h-full rounded-xl border-2 border-gold bg-white p-5 shadow-3d">
              <h3 className="font-bold">Helpful to bring</h3>
              <ul className="mt-2 list-disc pl-4 text-sm">{bring.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </Reveal>
        </div>
      </Section>
      <Section tone="gold" label="Reviews">
        <Reveal><h2 className="text-3xl font-extrabold">What clients say</h2></Reveal>
        <div className="mt-4"><Testimonials limit={3} /></div>
      </Section>
    </>
  );
}
