# Design Document

## Overview

This design document outlines the technical approach for redesigning the MST KSA landing page to create a modern, video-driven hero experience inspired by the RANTY design reference. The redesign will transform the current gradient-based hero section into a cinematic video background experience with floating service cards, while maintaining the existing React + TypeScript + Tailwind CSS architecture.

The design focuses on creating a premium, industrial aesthetic for the steel industry using a red and beige color palette, smooth animations, and responsive layouts that work seamlessly across all devices.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 with custom theme extensions
- **Animation**: Framer Motion 12.23.24 for advanced animations
- **Routing**: React Router DOM 6.30.1
- **Internationalization**: i18next 25.6.2 + react-i18next 16.3.2
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: React Context API (existing LanguageContext, AuthContext)

### Design System Updates

#### Color Palette Extension

```typescript
// Tailwind theme extension for red and beige color scheme
colors: {
  // Primary red for CTAs and accents
  'mst-red': {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626',  // Primary red
    600: '#C41E3A',  // Darker red for hover states
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Beige tones for backgrounds and cards
  'mst-beige': {
    50: '#FDFCFB',
    100: '#FAF8F5',
    200: '#F5F1E8',
    300: '#EDE6D8',
    400: '#E3D5C0',
    500: '#D2B48C',  // Primary beige
    600: '#C4A678',
    700: '#B08D5F',
    800: '#8B7049',
    900: '#6B5639',
  },
  // Steel industry grays
  'steel-gray': {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
}
```

#### Typography System

```typescript
// Font configuration
fontFamily: {
  'display': ['Playfair Display', 'Georgia', 'serif'], // For hero headlines
  'body': ['Inter', 'system-ui', 'sans-serif'],        // For body text
  'mono': ['JetBrains Mono', 'monospace'],             // For technical content
}

fontSize: {
  'hero-xl': ['7rem', { lineHeight: '1', letterSpacing: '-0.02em' }],  // Desktop hero
  'hero-lg': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }], // Tablet hero
  'hero-md': ['3rem', { lineHeight: '1.2', letterSpacing: '0' }],       // Mobile hero
}
```

## Components and Interfaces

### 1. VideoHeroSection Component

**Purpose**: Replace the existing HeroSection component with a video background implementation.

**Props Interface**:
```typescript
interface VideoHeroSectionProps {
  videoSrc: string;                    // Path to video file
  fallbackImage?: string;              // Fallback image if video fails
  headline: string;                    // Main headline text
  tagline: string;                     // Subheadline text
  ctaPrimary: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  overlayOpacity?: number;             // 0-1, default 0.5
  videoOpacity?: number;               // 0-1, default 0.4
  enableVideoOnMobile?: boolean;       // Default false
}
```

**Component Structure**:
```tsx
<section className="relative min-h-screen overflow-hidden">
  {/* Video Background Layer */}
  <VideoBackground 
    src={videoSrc}
    opacity={videoOpacity}
    fallback={fallbackImage}
  />
  
  {/* Overlay Gradient */}
  <div className="absolute inset-0 bg-gradient-overlay" />
  
  {/* Content Layer */}
  <div className="relative z-10 container">
    <motion.h1 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {headline}
    </motion.h1>
    
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {tagline}
    </motion.p>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <Button variant="primary" size="lg">
        {ctaPrimary.label}
      </Button>
    </motion.div>
  </div>
</section>
```

### 2. VideoBackground Component

**Purpose**: Handle video playback, optimization, and fallback logic.

**Props Interface**:
```typescript
interface VideoBackgroundProps {
  src: string;
  opacity?: number;
  fallback?: string;
  className?: string;
  preload?: 'auto' | 'metadata' | 'none';
}
```

**Implementation Details**:
- Use `<video>` element with `autoplay`, `loop`, `muted`, `playsinline` attributes
- Implement lazy loading for mobile devices
- Add intersection observer to pause video when not in viewport
- Compress video to WebM format with H.264 fallback
- Target file size: < 5MB
- Resolution: 1920x1080 at 30fps
- Bitrate: ~1.5 Mbps

**Error Handling**:
```typescript
const [videoError, setVideoError] = useState(false);

const handleVideoError = () => {
  setVideoError(true);
  console.error('Video failed to load, using fallback image');
};

// Render fallback image if video fails
{videoError && fallbackImage && (
  <img 
    src={fallbackImage} 
    alt="" 
    className="absolute inset-0 w-full h-full object-cover"
  />
)}
```

### 3. FloatingServiceCard Component

**Purpose**: Display service offerings in elevated card format with hover effects.

**Props Interface**:
```typescript
interface FloatingServiceCardProps {
  icon: React.ReactNode;               // Lucide icon component
  title: string;
  description: string;
  href?: string;
  delay?: number;                      // Animation delay in seconds
  className?: string;
}
```

**Component Structure**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, delay }}
  whileHover={{ scale: 1.05, y: -8 }}
  className="floating-card"
>
  <div className="icon-wrapper">
    {icon}
  </div>
  <h3 className="card-title">{title}</h3>
  <p className="card-description">{description}</p>
  {href && (
    <Link to={href} className="card-link">
      Learn More <ArrowRight />
    </Link>
  )}
</motion.div>
```

**Styling**:
```css
.floating-card {
  @apply bg-mst-beige-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl;
  @apply transition-all duration-300 ease-out;
  @apply border border-mst-beige-200;
  backdrop-filter: blur(10px);
  background: rgba(250, 248, 245, 0.9);
}

.icon-wrapper {
  @apply w-16 h-16 rounded-full bg-mst-red-500 flex items-center justify-center;
  @apply mb-4 text-white;
}
```

### 4. ServicesGrid Component

**Purpose**: Layout container for FloatingServiceCard components.

**Props Interface**:
```typescript
interface ServicesGridProps {
  services: Array<{
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
  }>;
  columns?: 2 | 3 | 4;                 // Default 4
  className?: string;
}
```

**Responsive Grid**:
```tsx
<div className={cn(
  "grid gap-6 md:gap-8",
  columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  columns === 2 && "grid-cols-1 md:grid-cols-2",
  className
)}>
  {services.map((service, index) => (
    <FloatingServiceCard
      key={service.id}
      {...service}
      delay={index * 0.1}
    />
  ))}
</div>
```

### 5. SocialProofSection Component

**Purpose**: Display customer statistics and testimonials with animated counters.

**Props Interface**:
```typescript
interface SocialProofSectionProps {
  metrics: Array<{
    id: string;
    value: number;
    suffix?: string;              // e.g., "+", "K", "M"
    label: string;
    icon?: React.ReactNode;
  }>;
  testimonials?: Array<{
    id: string;
    quote: string;
    author: string;
    company: string;
    avatar?: string;
  }>;
  ctaLabel?: string;
  ctaHref?: string;
}
```

**Animated Counter Hook**:
```typescript
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));
      
      if (progress === 1) clearInterval(timer);
    }, 16); // ~60fps
    
    return () => clearInterval(timer);
  }, [end, duration, isInView]);
  
  return { count, setIsInView };
};
```

## Data Models

### Service Data Structure

```typescript
interface Service {
  id: string;
  icon: string;                    // Icon name from lucide-react
  titleKey: string;                // i18n translation key
  descriptionKey: string;          // i18n translation key
  href?: string;
  category: 'fabrication' | 'engineering' | 'quality' | 'management';
  featured: boolean;
}

// Example data
const services: Service[] = [
  {
    id: 'steel-fabrication',
    icon: 'Hammer',
    titleKey: 'services.fabrication.title',
    descriptionKey: 'services.fabrication.description',
    href: '/services/fabrication',
    category: 'fabrication',
    featured: true,
  },
  {
    id: 'engineering-design',
    icon: 'Ruler',
    titleKey: 'services.engineering.title',
    descriptionKey: 'services.engineering.description',
    href: '/services/engineering',
    category: 'engineering',
    featured: true,
  },
  {
    id: 'quality-control',
    icon: 'CheckCircle',
    titleKey: 'services.quality.title',
    descriptionKey: 'services.quality.description',
    href: '/services/quality',
    category: 'quality',
    featured: true,
  },
  {
    id: 'project-management',
    icon: 'ClipboardList',
    titleKey: 'services.management.title',
    descriptionKey: 'services.management.description',
    href: '/services/management',
    category: 'management',
    featured: true,
  },
];
```

### Translation Keys Structure

```typescript
// en/translation.json additions
{
  "hero": {
    "headline": "TRANSFORMING IDEAS INTO REALITY",
    "tagline": "Steel Industry Excellence",
    "description": "Leading steel manufacturing and engineering solutions across Saudi Arabia",
    "cta": {
      "primary": "START",
      "secondary": "LEARN MORE"
    }
  },
  "services": {
    "sectionTitle": "Our Services",
    "fabrication": {
      "title": "Steel Fabrication",
      "description": "Custom steel fabrication for industrial and commercial projects"
    },
    "engineering": {
      "title": "Engineering Design",
      "description": "Precision engineering solutions tailored to your specifications"
    },
    "quality": {
      "title": "Quality Control",
      "description": "Rigorous testing and certification for all steel products"
    },
    "management": {
      "title": "Project Management",
      "description": "End-to-end project coordination and delivery"
    }
  },
  "socialProof": {
    "metrics": {
      "projects": "Projects Completed",
      "experience": "Years Experience",
      "clients": "Satisfied Clients",
      "capacity": "Annual Capacity (Tons)"
    },
    "cta": "LEARN MORE"
  }
}

// ar/translation.json additions (RTL)
{
  "hero": {
    "headline": "تحويل الأفكار إلى واقع",
    "tagline": "التميز في صناعة الصلب",
    "description": "حلول رائدة في تصنيع وهندسة الصلب في جميع أنحاء المملكة العربية السعودية",
    "cta": {
      "primary": "ابدأ",
      "secondary": "اعرف المزيد"
    }
  }
  // ... additional Arabic translations
}
```

## Error Handling

### Video Loading Errors

```typescript
const VideoBackgroundWithFallback: React.FC<VideoBackgroundProps> = ({
  src,
  fallback,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video loading error:', e);
    setError(true);
    setIsLoading(false);
  };
  
  const handleLoadedData = () => {
    setIsLoading(false);
  };
  
  if (error && fallback) {
    return (
      <img 
        src={fallback}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
    );
  }
  
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-steel-gray-900 animate-pulse" />
      )}
      <video
        src={src}
        onError={handleError}
        onLoadedData={handleLoadedData}
        {...props}
      />
    </>
  );
};
```

### Performance Monitoring

```typescript
// Track video load performance
useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;
  
  const startTime = performance.now();
  
  const handleCanPlay = () => {
    const loadTime = performance.now() - startTime;
    console.log(`Video loaded in ${loadTime}ms`);
    
    // Report to analytics if load time > 3s
    if (loadTime > 3000) {
      console.warn('Video load time exceeded 3s threshold');
    }
  };
  
  videoElement.addEventListener('canplay', handleCanPlay);
  return () => videoElement.removeEventListener('canplay', handleCanPlay);
}, []);
```

## Testing Strategy

### Component Testing

**VideoHeroSection Tests**:
```typescript
describe('VideoHeroSection', () => {
  it('renders headline and tagline correctly', () => {
    render(<VideoHeroSection {...mockProps} />);
    expect(screen.getByText('TRANSFORMING IDEAS INTO REALITY')).toBeInTheDocument();
  });
  
  it('displays fallback image when video fails', async () => {
    const { container } = render(<VideoHeroSection {...mockProps} />);
    const video = container.querySelector('video');
    
    fireEvent.error(video!);
    
    await waitFor(() => {
      expect(container.querySelector('img')).toBeInTheDocument();
    });
  });
  
  it('pauses video on mobile devices', () => {
    mockIsMobile(true);
    const { container } = render(<VideoHeroSection {...mockProps} />);
    const video = container.querySelector('video');
    
    expect(video).not.toBeInTheDocument();
  });
});
```

**FloatingServiceCard Tests**:
```typescript
describe('FloatingServiceCard', () => {
  it('applies hover animation on mouse enter', async () => {
    const { container } = render(<FloatingServiceCard {...mockProps} />);
    const card = container.firstChild;
    
    fireEvent.mouseEnter(card!);
    
    await waitFor(() => {
      expect(card).toHaveStyle({ transform: 'scale(1.05)' });
    });
  });
  
  it('renders with correct delay prop', () => {
    const { container } = render(<FloatingServiceCard delay={0.5} {...mockProps} />);
    // Verify motion component receives delay prop
  });
});
```

### Performance Testing

**Lighthouse Targets**:
- Performance: ≥ 85
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 95

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Video Performance Tests**:
```typescript
describe('Video Performance', () => {
  it('loads video within 3 seconds', async () => {
    const startTime = performance.now();
    render(<VideoBackground src={mockVideoSrc} />);
    
    await waitFor(() => {
      const video = screen.getByRole('video');
      expect(video.readyState).toBeGreaterThanOrEqual(3); // HAVE_FUTURE_DATA
    }, { timeout: 3000 });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
  
  it('video file size is under 5MB', async () => {
    const response = await fetch('/background video.mp4');
    const blob = await response.blob();
    const sizeInMB = blob.size / (1024 * 1024);
    
    expect(sizeInMB).toBeLessThan(5);
  });
});
```

### Accessibility Testing

**WCAG 2.1 AA Compliance**:
```typescript
describe('Accessibility', () => {
  it('provides alternative text for video', () => {
    render(<VideoHeroSection {...mockProps} />);
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-label');
  });
  
  it('maintains color contrast ratios', () => {
    const { container } = render(<FloatingServiceCard {...mockProps} />);
    // Use axe-core to check contrast
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
  
  it('supports keyboard navigation', () => {
    render(<ServicesGrid services={mockServices} />);
    const firstCard = screen.getAllByRole('article')[0];
    
    firstCard.focus();
    expect(firstCard).toHaveFocus();
    
    userEvent.tab();
    expect(screen.getAllByRole('article')[1]).toHaveFocus();
  });
  
  it('respects prefers-reduced-motion', () => {
    mockPrefersReducedMotion(true);
    render(<VideoHeroSection {...mockProps} />);
    
    // Verify animations are disabled
    const motion = screen.getByTestId('animated-element');
    expect(motion).toHaveStyle({ animation: 'none' });
  });
});
```

### Responsive Testing

**Breakpoint Tests**:
```typescript
describe('Responsive Layout', () => {
  const breakpoints = [
    { name: 'mobile', width: 375 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1024 },
    { name: 'wide', width: 1920 },
  ];
  
  breakpoints.forEach(({ name, width }) => {
    it(`renders correctly on ${name} (${width}px)`, () => {
      global.innerWidth = width;
      global.dispatchEvent(new Event('resize'));
      
      render(<Index />);
      
      // Verify layout adjustments
      const grid = screen.getByTestId('services-grid');
      const columns = window.getComputedStyle(grid).gridTemplateColumns;
      
      if (width < 768) {
        expect(columns).toBe('1fr'); // Single column
      } else if (width < 1024) {
        expect(columns).toContain('1fr 1fr'); // Two columns
      } else {
        expect(columns).toContain('1fr 1fr 1fr 1fr'); // Four columns
      }
    });
  });
});
```

### Integration Testing

**Full Page Flow**:
```typescript
describe('Landing Page Integration', () => {
  it('completes full user journey', async () => {
    render(<Index />);
    
    // 1. Video loads and plays
    await waitFor(() => {
      const video = screen.getByRole('video');
      expect(video).toHaveAttribute('autoplay');
    });
    
    // 2. Service cards animate in
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(4);
    
    // 3. User clicks CTA
    const ctaButton = screen.getByText('START');
    fireEvent.click(ctaButton);
    
    // 4. Navigation occurs
    await waitFor(() => {
      expect(window.location.pathname).toBe('/contact');
    });
  });
  
  it('handles language switching', async () => {
    render(<Index />);
    
    const langToggle = screen.getByLabelText('Switch to Arabic');
    fireEvent.click(langToggle);
    
    await waitFor(() => {
      expect(screen.getByText('تحويل الأفكار إلى واقع')).toBeInTheDocument();
      expect(document.dir).toBe('rtl');
    });
  });
});
```

## Implementation Notes

### Video Optimization Workflow

1. **Source Video Preparation**:
   - Original file: `public/background video.mp4`
   - Use FFmpeg for compression:
   ```bash
   ffmpeg -i "background video.mp4" \
     -c:v libx264 \
     -preset slow \
     -crf 28 \
     -vf scale=1920:1080 \
     -r 30 \
     -an \
     -movflags +faststart \
     "background-video-optimized.mp4"
   ```

2. **Create WebM version** (better compression):
   ```bash
   ffmpeg -i "background video.mp4" \
     -c:v libvpx-vp9 \
     -crf 35 \
     -b:v 0 \
     -vf scale=1920:1080 \
     -r 30 \
     -an \
     "background-video.webm"
   ```

3. **Generate poster image** (fallback):
   ```bash
   ffmpeg -i "background video.mp4" \
     -ss 00:00:02 \
     -vframes 1 \
     -q:v 2 \
     "background-video-poster.jpg"
   ```

### Animation Performance

**Use CSS transforms for better performance**:
```css
/* Good - GPU accelerated */
.floating-card:hover {
  transform: translateY(-8px) scale(1.05);
  will-change: transform;
}

/* Avoid - causes repaints */
.floating-card:hover {
  margin-top: -8px;
  width: 105%;
}
```

**Framer Motion optimization**:
```typescript
// Use layout animations sparingly
<motion.div
  layout // Only when necessary
  layoutId="unique-id"
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>

// Prefer transform animations
<motion.div
  whileHover={{ scale: 1.05, y: -8 }}
  transition={{ duration: 0.2 }}
>
```

### RTL Support

**Directional utilities**:
```typescript
// Create RTL-aware spacing utilities
const rtlClass = (ltr: string, rtl: string) => {
  return `${ltr} rtl:${rtl}`;
};

// Usage
<div className={rtlClass('ml-4', 'mr-4')}>
  {/* Content */}
</div>

// Or use logical properties in Tailwind
<div className="ms-4"> {/* margin-inline-start */}
  {/* Content */}
</div>
```

**Icon flipping**:
```typescript
<ArrowRight className="rtl:rotate-180" />
```

### Lazy Loading Strategy

```typescript
// Lazy load below-the-fold content
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const SocialProofSection = lazy(() => import('@/components/SocialProofSection'));

// In Index.tsx
<Suspense fallback={<SectionSkeleton />}>
  <ServicesSection />
</Suspense>

<Suspense fallback={<SectionSkeleton />}>
  <SocialProofSection />
</Suspense>
```

### SEO Considerations

**Structured data for services**:
```typescript
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Steel Fabrication",
  "provider": {
    "@type": "Organization",
    "name": "MST-KSA",
    "url": "https://mst-ksa.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Saudi Arabia"
  }
};
```

**Meta tags for video**:
```html
<meta property="og:video" content="https://mst-ksa.com/background-video.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1920" />
<meta property="og:video:height" content="1080" />
```
