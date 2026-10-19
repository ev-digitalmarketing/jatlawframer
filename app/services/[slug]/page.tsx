import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Btn, PageHero, Reveal, Section, Tilt } from "@/components/ui";
import { services } from "@/lib/data";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export function generateMetadata({ params }: Props): Metadata {
  const s = services.find((x) => x.slug === params.slug);
  return { title: s ? `${s.title} | Jat Law` : "Service | Jat Law", description: s?.intro };
}

export default function ServicePage({ params }: Props) {
  const s = services.find((x) => x.slug === params.slug);
  if (!s) notFound();
  return (
    <>
      <PageHero eyebrow={s.tag} title={s.title} text={s.intro}>
        <Btn href="/consultation">Free Consultation</Btn>
      </PageHero>
      <Section tone="ivory" label="How we help">
        <Reveal><h2 className="text-3xl font-extrabold">How we help</h2></Reveal>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
          {s.points.map((p, i) => (
            <Reveal key={p} delay={i * 0.07} className="h-full">
              <Tilt className="h-full">
                <div className="h-full rounded-xl border border-navy/15 bg-white p-5 shadow-3d" style={{ transformStyle: "preserve-3d" }}>
                  <div style={{ transform: "translateZ(40px)" }} className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink"><Check size={20} /></div>
                  <p className="mt-3 font-heading font-bold">{p}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tone="gold" label="Other services">
        <Reveal><h2 className="text-3xl font-extrabold">Other services</h2></Reveal>
        <div className="mt-4 flex flex-wrap gap-2">
          {services.filter((x) => x.slug !== s.slug).map((x) => (
            <Link key={x.slug} href={`/services/${x.slug}`} className="rounded-full bg-navy px-4 py-2 font-heading text-sm font-semibold text-white shadow-3d transition hover:-translate-y-1 hover:text-gold">{x.title}</Link>
          ))}
        </div>
      </Section>
    </>
  );
}
