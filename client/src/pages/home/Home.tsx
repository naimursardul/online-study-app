import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ServiceSection } from "@/components/home/ServiceSection";
import { FormatsSection } from "@/components/home/FormatsSection";
import { ExamSection } from "@/components/home/ExamSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <HowItWorksSection />
      <ServiceSection />
      <FormatsSection />
      <ExamSection />
      <FeaturesSection />
      <RoadmapSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
