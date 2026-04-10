'use client';

import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'strong' | 'subtle';
  glow?: boolean;
  glowStrong?: boolean;
  scanline?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const glassMap = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', glow = false, glowStrong = false, scanline = false, padding = 'md', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          glassMap[variant],
          'relative overflow-hidden rounded-xl',
          paddingMap[padding],
          glow && 'glass-glow',
          glowStrong && 'glass-glow-strong',
          scanline && 'scanline',
          className
        )}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassPanel.displayName = 'GlassPanel';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  selected?: boolean;
  level?: 'L0' | 'L1' | 'L2';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, selected = false, level, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-subtle rounded-lg transition-all duration-300 hover:glass-hover cursor-pointer',
          selected && 'glass-glow ring-1 ring-matrix/30',
          level && `level-${level.toLowerCase()}`,
          glow && 'glass-glow',
          'p-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
