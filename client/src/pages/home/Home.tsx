import HeroSection from "@/components/home/HeroSection";
import ServiceSection from "@/components/home/ServiceSection";

export default function Home() {
  return (
    <div className="m-16 max-sm:my-10 max-sm:mx-8">
      <HeroSection />
      <ServiceSection />
    </div>
  );
}
