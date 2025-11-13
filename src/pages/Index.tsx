import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ClientsCarousel from "@/components/ClientsCarousel";
import ServicesSection from "@/components/ServicesSection";
import MetricsSection from "@/components/MetricsSection";
import ContactModal from "@/components/ContactModal";

const Index = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation onContactClick={() => setContactOpen(true)} />
      <HeroSection />
      <ClientsCarousel />
      <ServicesSection />
      <MetricsSection />
      <Footer />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Index;
