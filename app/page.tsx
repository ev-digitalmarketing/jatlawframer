import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Btn, Slider, Tilt } from "@/components/ui";
import Journey from "@/components/Journey";
import Testimonials from "@/components/Testimonials";
import CourtroomStage, { Stage } from "@/components/CourtroomStage";
import { services } from "@/lib/data";

const steps = [
  ["Free consultation", "Tell us your situation. We listen first and explain your options in plain language."],
  ["Clear plan & quote", "A straightforward roadmap and accurate pricing, with no surprises."],
  ["We handle the details", "Documents, deadlines and filings managed with precision and regular updates."],
  ["Closed, and still here", "Even after your file closes, we stay reachable for follow-up questions."],
];

export default function Home() {
  return (
    <CourtroomStage>
      <Stage id="welcome" label="Welcome" hero>
        <p className="eyebrow">Barrister & Solicitor · Mississauga</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] md:text-6xl lg:text-7xl">
          Clear counsel.<br /><span className="text-gold">Confident outcomes.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-lg">
          Real estate, litigation, corporate, estates and family matters, handled with care, precision and plain-language advice.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn href="/consultation">Free Consultation</Btn>
          <Btn href="#services" variant="line">Explore Services</Btn>
        </div>
        <p className="mt-12 flex items-center justify-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">
          Scroll to walk in <ChevronDown size={14} className="animate-bounce" />
        </p>
      </Stage>

      <Stage id="services" label="Services">
        <p className="eyebrow">Step 1 · Choose your service</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">How can we help?</h2>
        <div className="mt-8">
          <Slider label="Our services">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="block h-full">
                <Tilt className="h-full">
                  <div className="h-full rounded-xl border border-white/20 bg-white p-5 text-center text-navy shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(40px)" }} className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-navy text-gold shadow-3d"><s.icon size={24} /></div>
                    <h3 style={{ transform: "translateZ(20px)" }} className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold">{s.tag}</p>
                    <p className="mt-2 text-sm text-navy/80">{s.intro}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold">Learn more <ArrowRight size={14} /></span>
                  </div>
                </Tilt>
              </Link>
            ))}
          </Slider>
        </div>
      </Stage>

      <Stage id="your-journey" label="Your journey">
        <div className="rounded-3xl border border-white/10 bg-ink/65 p-6 shadow-3d backdrop-blur-md md:p-12">
          <Journey center eyebrow="Step 2 · Your journey" title="What working with us looks like" steps={steps} />
        </div>
      </Stage>

      <Stage id="reviews" label="Reviews">
        <p className="eyebrow">Step 3 · Hear from clients</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Trusted across the GTA</h2>
        <div className="mt-8"><Testimonials limit={5} desktopCount={2} /></div>
        <div className="mt-8 flex justify-center"><Btn href="/testimonials" variant="line">Read all reviews</Btn></div>
      </Stage>
    </CourtroomStage>
  );
}
