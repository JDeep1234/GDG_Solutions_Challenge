
import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const FadeInSection = ({
  children,
  className,
  threshold = 0.1,
  delay = 0,
  direction = 'up',
}: FadeInSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getDirectionStyles = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-10';
      case 'down':
        return '-translate-y-10';
      case 'left':
        return 'translate-x-10';
      case 'right':
        return '-translate-x-10';
      case 'none':
        return '';
    }
  };

  return (
    <div
      ref={domRef}
      className={cn(
        'transition-all duration-700 ease-out',
        !isVisible && 'opacity-0',
        !isVisible && getDirectionStyles(),
        isVisible && 'opacity-100 transform-none',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
