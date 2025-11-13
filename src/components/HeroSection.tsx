import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      {/* Geometric patterns for industrial feel */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary-foreground rotate-45" />
        <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-primary-foreground rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-primary-foreground -rotate-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground brand-serif animate-fade-in">
            MST-KSA
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-light max-w-2xl mx-auto leading-relaxed">
            Precision Steel Manufacturing for the Modern World
          </p>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Delivering exceptional quality in steel products, trusted by industry leaders across Saudi Arabia
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/catalogs">
              <Button 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-semibold transition-smooth shadow-lg group"
              >
                View Our Catalogs
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-fast" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
