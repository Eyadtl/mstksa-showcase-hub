import { Wrench, Shield, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Wrench,
      title: t("common:services.expertManufacturing.title"),
      description: t("common:services.expertManufacturing.description"),
    },
    {
      icon: Shield,
      title: t("common:services.qualityAssurance.title"),
      description: t("common:services.qualityAssurance.description"),
    },
    {
      icon: TrendingUp,
      title: t("common:services.industryInnovation.title"),
      description: t("common:services.industryInnovation.description"),
    },
  ];

  return (
    <section className="py-20 bg-background" aria-labelledby="services-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="services-heading" className="text-4xl md:text-5xl font-bold mb-4 brand-serif">
            {t("common:services.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center">
            {t("common:services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {features.map((feature, index) => (
            <article
              key={index}
              className="group p-8 bg-card rounded-xl border border-border hover:border-primary transition-smooth hover:shadow-red"
              role="listitem"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-smooth" aria-hidden="true">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-fast" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-left rtl:text-right">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-left rtl:text-right">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
