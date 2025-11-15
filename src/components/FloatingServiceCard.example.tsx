/**
 * FloatingServiceCard Usage Example
 * 
 * This file demonstrates how to use the FloatingServiceCard component
 * in your application.
 */

import { Hammer, Ruler, CheckCircle, ClipboardList } from "lucide-react";
import FloatingServiceCard from "./FloatingServiceCard";
import { useLanguage } from "@/contexts/LanguageContext";

const FloatingServiceCardExample = () => {
  const { t } = useLanguage();

  // Example services data structure
  const services = [
    {
      id: "steel-fabrication",
      icon: Hammer,
      title: "Steel Fabrication",
      description: "Custom steel fabrication for industrial and commercial projects",
      href: "/services/fabrication",
    },
    {
      id: "engineering-design",
      icon: Ruler,
      title: "Engineering Design",
      description: "Precision engineering solutions tailored to your specifications",
      href: "/services/engineering",
    },
    {
      id: "quality-control",
      icon: CheckCircle,
      title: "Quality Control",
      description: "Rigorous testing and certification for all steel products",
      href: "/services/quality",
    },
    {
      id: "project-management",
      icon: ClipboardList,
      title: "Project Management",
      description: "End-to-end project coordination and delivery",
      href: "/services/management",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive steel solutions for your business needs
          </p>
        </div>

        {/* Grid layout for service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <FloatingServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
              href={service.href}
              delay={index * 0.1} // Staggered animation
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FloatingServiceCardExample;
