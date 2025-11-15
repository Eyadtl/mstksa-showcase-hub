import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  delay?: number;
  className?: string;
}

const FloatingServiceCard = ({
  icon: Icon,
  title,
  description,
  href,
  delay = 0,
  className,
}: FloatingServiceCardProps) => {
  const cardContent = (
    <>
      <div className="w-16 h-16 rounded-full bg-mst-red-500 flex items-center justify-center mb-4 text-white transition-all duration-300 group-hover:bg-mst-red-600">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-left rtl:text-right text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-left rtl:text-right mb-4">
        {description}
      </p>
      {href && (
        <div className="flex items-center gap-2 text-mst-red-500 font-medium group-hover:text-mst-red-600 transition-colors duration-300">
          <span>Learn More</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </div>
      )}
    </>
  );

  const cardClasses = cn(
    "group relative bg-mst-beige-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl",
    "transition-all duration-300 ease-out",
    "border border-mst-beige-200",
    className
  );

  const cardStyles = {
    backdropFilter: "blur(10px)",
    background: "rgba(250, 248, 245, 0.9)",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -8 }}
      className={cardClasses}
      style={cardStyles}
      role="article"
    >
      {href ? (
        <Link to={href} className="block">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.article>
  );
};

export default FloatingServiceCard;
