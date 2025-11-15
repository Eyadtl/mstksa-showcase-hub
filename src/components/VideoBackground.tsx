import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VideoBackgroundProps {
  src: string;
  opacity?: number;
  fallback?: string;
  className?: string;
  preload?: 'auto' | 'metadata' | 'none';
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  opacity = 0.4,
  fallback,
  className,
  preload,
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(0);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine preload strategy
  const preloadStrategy = preload || (isMobile ? 'none' : 'metadata');

  // Performance monitoring
  useEffect(() => {
    if (isMobile || !videoRef.current) return;

    startTimeRef.current = performance.now();

    const handleCanPlay = () => {
      const loadTime = performance.now() - startTimeRef.current;
      console.log(`Video loaded in ${loadTime.toFixed(2)}ms`);

      if (loadTime > 3000) {
        console.warn('Video load time exceeded 3s threshold');
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('canplay', handleCanPlay);

    return () => {
      videoElement?.removeEventListener('canplay', handleCanPlay);
    };
  }, [isMobile]);

  // Intersection Observer to pause video when out of viewport
  useEffect(() => {
    if (isMobile || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.error('Video play failed:', error);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  // Error handler
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video failed to load:', e);
    setVideoError(true);
    setIsLoading(false);
  };

  // Loading handler
  const handleLoadedData = () => {
    setIsLoading(false);
  };

  // Don't render video on mobile devices
  if (isMobile) {
    if (fallback) {
      return (
        <img
          src={fallback}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            className
          )}
          style={{ opacity }}
          loading="eager"
        />
      );
    }
    return null;
  }

  // Render fallback image if video fails
  if (videoError && fallback) {
    return (
      <img
        src={fallback}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover',
          className
        )}
        style={{ opacity }}
        loading="eager"
      />
    );
  }

  return (
    <>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-steel-gray-900 animate-pulse" />
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={cn(
          'absolute inset-0 w-full h-full object-cover',
          className
        )}
        style={{
          opacity,
          willChange: 'transform',
        }}
        autoPlay
        loop
        muted
        playsInline
        preload={preloadStrategy}
        onError={handleVideoError}
        onLoadedData={handleLoadedData}
        poster={fallback}
        aria-hidden="true"
      >
        {/* WebM format for better compression (if available) */}
        {src.includes('.mp4') && (
          <source
            src={src.replace('.mp4', '.webm')}
            type="video/webm"
          />
        )}
        {/* MP4 format for broad compatibility */}
        <source src={src} type="video/mp4" />
        {/* Fallback text for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
    </>
  );
};

export default VideoBackground;
