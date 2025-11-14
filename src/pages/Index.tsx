import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ClientsCarousel from "@/components/ClientsCarousel";
import ServicesSection from "@/components/ServicesSection";
import MetricsSection from "@/components/MetricsSection";
import ContactModal from "@/components/ContactModal";
import SkipNavigation from "@/components/SkipNavigation";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";

const Index = () => {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SEO
        title={t('seo.home.title', { defaultValue: 'Home' })}
        description={t('seo.home.description', { defaultValue: 'MST-KSA: Leading steel manufacturing company specializing in essential steel products for diverse industries across Saudi Arabia. Quality craftsmanship, trusted by Aramco, Sisko, and more.' })}
        keywords={t('seo.home.keywords', { defaultValue: 'steel manufacturing, Saudi Arabia, MST-KSA, steel products, industrial steel, Aramco supplier, steel fabrication' })}
      />
      <StructuredData />
      <SkipNavigation />
      <Navigation onContactClick={() => setContactOpen(true)} />
      <main id="main-content">
        <HeroSection />
        <ClientsCarousel />
        <ServicesSection />
        <MetricsSection />
      </main>
      <Footer />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Index;
