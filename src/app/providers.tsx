'use client';

import { MotionConfig } from 'motion/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ServiceWorkerRegistrar } from '@/components/features/ServiceWorkerRegistrar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <ServiceWorkerRegistrar />
        {children}
      </ErrorBoundary>
    </MotionConfig>
  );
}
