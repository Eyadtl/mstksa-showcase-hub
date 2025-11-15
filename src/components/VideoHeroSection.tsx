import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VideoBackground from '@/components/VideoBackground';
import { cn } from '@/lib/utils';

interface VideoHeroSectionProps {
  videoSrc: string;
  fallbackImage?: string;
  headline?: string;
  tagline?: string;
  ctaPrimary?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  overlayOpacity?: number;
  videoOpacity?: number;
  enableVideoOnMobile?: boolean;
  className?: string;
}

const VideoHeroSection: React.FC<VideoHeroSectionProps> = ({
  videoSrc,
  fallbackImage,
  headline,
  tagline,
  ctaPrimary,
  overlayOpacity = 0.5,
  videoOpacity = 0.4,
  enableVideoOnMobile = false,
  className,
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  // Use provided props or fall back to translations
  const displayHeadline = headline || t('common:hero.headline' as any);
  const displayTagline = tagline || t('common:hero.tagline' as any);
  const displayCTA = ctaPrimary || {
    label: t('common:hero.cta.primary' as any),
    href: '/catalogs',
  };

  return (
    <section
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        className
      )}
      aria-label={displayHeadline}
    >
      {/* Video Background Layer */}
      <VideoBackground
        src={videoSrc}
        opacity={videoOpacity}
        fallback={fallbackImage}
        preload={enableVideoOnMobile ? 'metadata' : undefined}
      />

      {/* Overlay Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-steel-gray-900/80 via-steel-gray-900/60 to-steel-gray-900/80"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Headline with animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white',
              'font-display tracking-tight leading-tight',
              isRTL && 'font-body'
            )}
          >
            {displayHeadline}
          </motion.h1>

          {/* Tagline with staggered animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed"
          >
            {displayTagline}
          </motion.p>

          {/* CTA Button with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="pt-4"
          >
            {displayCTA.onClick ? (
              <Button
                size="lg"
                onClick={displayCTA.onClick}
                className="bg-mst-red-500 hover:bg-mst-red-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
                aria-label={displayCTA.label}
              >
                {displayCTA.label}
                <ArrowRight
                  className={cn(
                    'h-5 w-5 transition-transform duration-300',
                    'group-hover:translate-x-1',
                    isRTL
                      ? 'mr-2 group-hover:-translate-x-1 group-hover:translate-x-0 rotate-180'
                      : 'ml-2'
                  )}
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Link to={displayCTA.href} aria-label={displayCTA.label}>
                <Button
                  size="lg"
                  className="bg-mst-red-500 hover:bg-mst-red-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {displayCTA.label}
                  <ArrowRight
                    className={cn(
                      'h-5 w-5 transition-transform duration-300',
                      'group-hover:translate-x-1',
                      isRTL
                        ? 'mr-2 group-hover:-translate-x-1 group-hover:translate-x-0 rotate-180'
                        : 'ml-2'
                    )}
                    aria-hidden="true"
                  />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade for smooth transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};

export default VideoHeroSection;
