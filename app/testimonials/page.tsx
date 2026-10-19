import { PageHero, Section } from "@/components/ui";
import Testimonials from "@/components/Testimonials";

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Testimonials" title="Client reviews." text="Real Google reviews from clients we have had the privilege of serving." />
      <Section tone="gold" label="Reviews"><Testimonials /></Section>
    </>
  );
}
