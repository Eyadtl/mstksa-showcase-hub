import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    '@type': string;
    addressCountry: string;
  };
  contactPoint?: {
    '@type': string;
    contactType: string;
    email?: string;
  };
}

/**
 * Component for adding JSON-LD structured data (Schema.org) to pages
 * Helps search engines understand the organization and content
 */
export const StructuredData = () => {
  useEffect(() => {
    const baseUrl = window.location.origin;

    // Organization structured data
    const organizationSchema: OrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'MST-KSA',
      url: baseUrl,
      logo: `${baseUrl}/favicon.ico`,
      description: 'Leading steel manufacturing company specializing in essential steel products for diverse industries across Saudi Arabia.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SA',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@mst-ksa.com',
      },
    };

    // Create or update script tag
    let scriptElement = document.querySelector('script[type="application/ld+json"]');
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(organizationSchema);

    // Cleanup function
    return () => {
      // Keep the script tag on unmount for SPA navigation
    };
  }, []);

  return null;
};
