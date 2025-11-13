import { useEffect, useState } from "react";

const ClientsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Placeholder client logos - these would be replaced with actual logos
  const clients = [
    { name: "Sisko", logo: "SISKO" },
    { name: "Aramco", logo: "ARAMCO" },
    { name: "Ladin", logo: "LADIN" },
    { name: "Sadia", logo: "SADIA" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % clients.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [clients.length]);

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 brand-serif">
          Trusted by Industry Leaders
        </h2>
        
        <div className="relative overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out gap-8 justify-center items-center">
            {clients.map((client, index) => (
              <div
                key={client.name}
                className={`flex-shrink-0 transition-all duration-500 ${
                  index === currentIndex ? "scale-110 opacity-100" : "scale-90 opacity-50"
                }`}
              >
                <div className="w-48 h-32 bg-card rounded-lg shadow-md flex items-center justify-center border border-border">
                  <span className="text-2xl font-bold text-foreground/70 brand-serif">
                    {client.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-8 gap-2">
          {clients.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
