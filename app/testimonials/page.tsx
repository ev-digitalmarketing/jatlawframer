import { PageHero, Section } from "@/components/ui";
import { ReviewList } from "@/components/Testimonials";

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Testimonials" title="Client reviews." text="Real Google reviews from clients we have had the privilege of serving." />
      <Section tone="ivory" label="Reviews"><ReviewList /></Section>
    </>
  );
}
