import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const MissionVisionStrategy: React.FC = () => {
  const { t } = useTranslation('mvs' as any);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const sections = [
    {
      id: 'mission',
      title: t('mission.title' as any),
      content: t('mission.content' as any),
      philosophy: t('mission.philosophy' as any),
      icon: Target,
    },
    {
      id: 'vision',
      title: t('vision.title' as any),
      content: t('vision.content' as any),
      philosophy: undefined,
      icon: Eye,
    },
    {
      id: 'strategy',
      title: t('strategy.title' as any),
      content: t('strategy.content' as any),
      philosophy: undefined,
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group"
              >
                <div className="h-full bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-border/50 hover:border-mst-red-500/30">
                  {/* Icon Header */}
                  <div className="p-6 bg-gradient-to-br from-mst-red-500 to-mst-red-600">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center bg-white/90 dark:bg-mst-red-900/20 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    >
                      <Icon className="w-8 h-8 text-mst-red-600 dark:text-mst-red-400" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3
                      className={cn(
                        'text-2xl font-bold text-foreground',
                        isRTL && 'font-body'
                      )}
                    >
                      {section.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>

                    {section.philosophy && (
                      <div className="pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          {section.philosophy}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Accent */}
                  <div className="h-1 bg-gradient-to-r from-mst-red-500 to-mst-red-600" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionStrategy;
