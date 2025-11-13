import { Wrench, Shield, TrendingUp } from "lucide-react";

const ServicesSection = () => {
  const features = [
    {
      icon: Wrench,
      title: "Expert Manufacturing",
      description: "State-of-the-art facilities producing all types of essential steel products with precision and quality.",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Rigorous quality control processes ensuring every product meets international standards.",
    },
    {
      icon: TrendingUp,
      title: "Industry Innovation",
      description: "Continuously advancing our techniques to deliver superior steel solutions for modern applications.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 brand-serif">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manufacturing all types of necessary products made with steel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-card rounded-xl border border-border hover:border-primary transition-smooth hover:shadow-red"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-smooth">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-fast" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
