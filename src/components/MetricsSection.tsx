import { useEffect, useState } from "react";

interface Metric {
  label: string;
  value: number;
  suffix: string;
}

const MetricsSection = () => {
  const metrics: Metric[] = [
    { label: "Years in Business", value: 25, suffix: "+" },
    { label: "Projects Completed", value: 500, suffix: "+" },
    { label: "Satisfied Clients", value: 150, suffix: "+" },
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
    <section className="py-20 gradient-steel">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary-foreground brand-serif">
          Our Track Record
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-8 bg-background/5 backdrop-blur-sm rounded-xl border border-primary-foreground/10"
            >
              <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-2 brand-serif">
                {counts[index]}
                {metric.suffix}
              </div>
              <div className="text-lg text-primary-foreground/80 font-medium">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
