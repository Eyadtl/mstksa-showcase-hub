import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ui/ProductCard';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const ProductsSection: React.FC = () => {
  const { t } = useTranslation('products' as any);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const products = [
    {
      id: 'mep-solution',
      title: t('mep.title' as any),
      description: t('mep.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      href: '#mep-solution',
      themeColor: '0 72% 51%', // MST Red
    },
    {
      id: 'architectural',
      title: t('architectural.title' as any),
      description: t('architectural.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      href: '#architectural',
      themeColor: '0 72% 51%', // MST Red
    },
    {
      id: 'finishing-solution',
      title: t('finishing.title' as any),
      description: t('finishing.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80',
      href: '#finishing-solution',
      themeColor: '0 72% 51%', // MST Red
    },
    {
      id: 'construction-chemical',
      title: t('chemical.title' as any),
      description: t('chemical.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
      href: '#construction-chemical',
      themeColor: '0 72% 51%', // MST Red
    },
    {
      id: 'civil-solution',
      title: t('civil.title' as any),
      description: t('civil.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1590496793907-4d0b8e5d0e8e?w=800&auto=format&fit=crop&q=80',
      href: '#civil-solution',
      themeColor: '0 72% 51%', // MST Red
    },
    {
      id: 'sustainable-solution',
      title: t('sustainable.title' as any),
      description: t('sustainable.description' as any),
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
      href: '#sustainable-solution',
      themeColor: '0 72% 51%', // MST Red
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className={cn(
              'text-4xl md:text-5xl font-bold text-foreground mb-4',
              isRTL && 'font-body'
            )}
          >
            {t('sectionTitle' as any)}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('sectionSubtitle' as any)}
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-[450px]"
            >
              <ProductCard
                imageUrl={product.imageUrl}
                title={product.title}
                description={product.description}
                href={product.href}
                themeColor={product.themeColor}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
