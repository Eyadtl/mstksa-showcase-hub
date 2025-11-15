  # Implementation Plan

- [x] 1. Set up color scheme and design tokens





  - Update Tailwind config with mst-red, mst-beige, and steel-gray color palettes
  - Add custom font families (Playfair Display for headlines, Inter for body)
  - Add custom font sizes for hero typography (hero-xl, hero-lg, hero-md)
  - Create CSS custom properties for gradient overlays and backdrop filters
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. Implement VideoBackground component






  - [x] 2.1 Create VideoBackground component with video element






    - Implement video element with autoplay, loop, muted, and playsinline attributes
    - Add opacity control prop with default value of 0.4
    - Implement preload strategy (metadata for desktop, none for mobile)
    - Add className prop for custom styling
    - _Requirements: 2.1, 2.2, 2.3, 5.3_

  - [x] 2.2 Add error handling and fallback image support

    - Implement onError handler to detect video load failures
    - Add fallback image rendering when video fails
    - Create loading state with skeleton animation
    - Add console error logging for debugging
    - _Requirements: 2.4, 8.2_

  - [x] 2.3 Optimize video performance

    - Implement intersection observer to pause video when out of viewport
    - Add performance monitoring to track video load time
    - Implement conditional rendering to hide video on mobile devices
    - Add will-change CSS property for GPU acceleration
    - _Requirements: 2.5, 5.3, 8.1, 8.3, 8.4_

- [x] 3. Create VideoHeroSection component





  - [x] 3.1 Build hero section layout structure


    - Create section element with min-h-screen and relative positioning
    - Integrate VideoBackground component with overlay gradient
    - Add container with z-index layering for content above video
    - Implement responsive padding and spacing
    - _Requirements: 1.1, 1.2, 1.5, 5.2_

  - [x] 3.2 Implement hero content with animations

    - Add headline with Framer Motion fade-in animation (0.8s duration)
    - Add tagline with staggered animation (0.2s delay)
    - Implement primary CTA button with animation (0.4s delay)
    - Add aria-label for accessibility
    - _Requirements: 1.1, 1.2, 1.4, 7.1, 10.1_

  - [x] 3.3 Add bilingual support and RTL handling


    - Integrate i18next translation keys for headline and tagline
    - Implement RTL text direction support
    - Add language-specific font adjustments
    - Test layout in both English and Arabic
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 3.4 Implement video optimization workflow


    - Compress source video using FFmpeg to target < 5MB file size
    - Generate WebM version for better compression
    - Create poster image for fallback
    - Add multiple source elements for format fallback
    - _Requirements: 2.5, 8.3_
-
- [x] 4. Build FloatingServiceCard componen