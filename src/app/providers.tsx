'use client';

import { MotionConfig } from 'motion/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </MotionConfig>
  );
}
