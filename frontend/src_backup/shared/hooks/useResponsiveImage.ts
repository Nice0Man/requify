import { useEffect, useRef, useState } from 'react';

interface UseResponsiveImageOptions {
  src: string;
  alt: string;
  sizes?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

interface ResponsiveImageResult {
  imgRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  hasError: boolean;
  currentSrc: string;
  containerStyle: React.CSSProperties;
}

export const useResponsiveImage = (
  options: UseResponsiveImageOptions
): ResponsiveImageResult => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(options.src);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
      img.classList.add('loaded');
      options.onLoad?.();
    };

    const handleError = (error: Event) => {
      setHasError(true);
      setIsLoaded(false);
      options.onError?.(error);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Intersection Observer for lazy loading
    if (options.lazy) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = options.src;
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );

      observer.observe(img);

      return () => {
        observer.disconnect();
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [options.src, options.lazy, options.onLoad, options.onError]);

  // Responsive container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return {
    imgRef,
    isLoaded,
    hasError,
    currentSrc,
    containerStyle,
  };
};

// Утилитарная функция для генерации srcSet
export const generateSrcSet = (baseSrc: string, sizes: number[]): string => {
  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');
  
  return sizes
    .map(size => `${baseName}-${size}w.${extension} ${size}w`)
    .join(', ');
};

// Утилитарная функция для определения оптимального размера изображения
export const getOptimalImageSize = (containerWidth: number): number => {
  if (containerWidth <= 600) return 600;
  if (containerWidth <= 960) return 960;
  if (containerWidth <= 1280) return 1280;
  if (containerWidth <= 1920) return 1920;
  return 2560;
}; 