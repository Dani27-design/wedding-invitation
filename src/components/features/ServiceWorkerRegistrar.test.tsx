import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceWorkerRegistrar, canRegisterServiceWorker } from './ServiceWorkerRegistrar';

const originalLocation = window.location;
const originalServiceWorker = navigator.serviceWorker;

function setWindowLocation(url: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: new URL(url),
  });
}

function setServiceWorker(serviceWorker: ServiceWorkerContainer | undefined) {
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker,
  });
}

describe('components/features/ServiceWorkerRegistrar', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    setServiceWorker(originalServiceWorker);
  });

  it('registers the service worker in production on localhost', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    setWindowLocation('http://localhost/test');
    const register = vi.fn().mockResolvedValue(undefined);
    setServiceWorker({ register } as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('/sw.js');
    });
  });

  it('does not register outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    setWindowLocation('http://localhost/test');
    const register = vi.fn().mockResolvedValue(undefined);
    setServiceWorker({ register } as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    expect(canRegisterServiceWorker()).toBe(false);
    expect(register).not.toHaveBeenCalled();
  });

  it('does not register when service workers are unavailable', () => {
    vi.stubEnv('NODE_ENV', 'production');
    setWindowLocation('https://example.com/test');
    setServiceWorker(undefined);

    render(<ServiceWorkerRegistrar />);

    expect(canRegisterServiceWorker()).toBe(false);
  });

  it('does not register on insecure non-localhost origins', () => {
    vi.stubEnv('NODE_ENV', 'production');
    setWindowLocation('http://example.com/test');
    const register = vi.fn().mockResolvedValue(undefined);
    setServiceWorker({ register } as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    expect(canRegisterServiceWorker()).toBe(false);
    expect(register).not.toHaveBeenCalled();
  });
});
