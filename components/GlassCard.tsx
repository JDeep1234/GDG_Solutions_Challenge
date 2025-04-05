
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard = ({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        'glass-morphism rounded-2xl p-6 transition-all duration-300',
        hoverEffect && 'hover:shadow-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
