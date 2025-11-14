import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
}

/**
 * SEO component for managing meta tags dynamically per page
 * Handles title, description, Open Graph, Twitter Cards, and canonical URLs
 */
export const SEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOProps) => {
  const location = useLocation();
  const baseUrl = window.location.origin;
  
  // Default values
  const defaultTitle = 'MST-KSA - Premier Steel Manufacturing Solutions';
  const defaultDescription = 'MST-KSA: Leading steel manufacturing company specializing in essential steel products for diverse industries across Saudi Arabia. Quality craftsmanship, trusted by Aramco, Sisko, and more.';
  
  const fullTitle = title ? `${title} | MST-KSA` : defaultTitle;
  const metaDescription = description || defaultDescription;
  const canonicalUrl = canonical || `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', metaDescription);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    // Robots meta tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', metaDescription, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'MST-KSA', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', metaDescription);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute('href', canonicalUrl);

    // Update html lang attribute based on current language
    const htmlElement = document.documentElement;
    const currentLang = htmlElement.getAttribute('dir') === 'rtl' ? 'ar' : 'en';
    htmlElement.setAttribute('lang', currentLang);

  }, [fullTitle, metaDescription, keywords, ogImage, ogType, canonicalUrl, noindex]);

  return null; // This component doesn't render anything
};
