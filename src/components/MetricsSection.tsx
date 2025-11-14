import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Metric {
  labelKey: string;
  value: number;
  suffix: string;
}

const MetricsSection = () => {
  const { t } = useLanguage();
  
  const metrics: Metric[] = [
    { labelKey: "common:metrics.yearsInBusiness", value: 25, suffix: "+" },
    { labelKey: "common:metrics.projectsCompleted", value: 500, suffix: "+" },
    { labelKey: "common:metrics.satisfiedClients", value: 150, suffix: "+" },
  ];

  const [counts, setCounts] = useState(metrics.map(() => 0));

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const timers = metrics.map((metric, index) => {
      const increment = metric.value / steps;
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= metric.value) {
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = metric.value;
            return newCounts;
          });
          clearInterval(timers[index]);
        } else {
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(current);
            return newCounts;
          });
        }
      }, interval);
    });

    return () => timers.forEach((timer) => clearInterval(timer));
  }, []);

  return (
    <section className="py-20 gradient-steel" aria-labelledby="metrics-heading">
      <div className="container mx-auto px-4">
        <h2 id="metrics-heading" className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary-foreground brand-serif">
          {t("common:metrics.title")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-8 bg-background/5 backdrop-blur-sm rounded-xl border border-primary-foreground/10"
              role="listitem"
            >
              <div 
                className="text-5xl md:text-6xl font-bold text-primary-foreground mb-2 brand-serif text-center"
                aria-live="polite"
                aria-atomic="true"
              >
                {counts[index].toLocaleString()}
                {metric.suffix}
              </div>
              <div className="text-lg text-primary-foreground/80 font-medium text-center">
                {t(metric.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
