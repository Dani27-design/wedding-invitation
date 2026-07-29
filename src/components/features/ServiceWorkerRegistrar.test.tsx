import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ServiceWorkerRegistrar,
  canRegisterServiceWorker,
  isPublicInvitationPath,
} from './ServiceWorkerRegistrar';

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

function createServiceWorkerContainerMock() {
  const activeWorker = {
    postMessage: vi.fn(),
  };
  const registration = {
    active: activeWorker,
  };
  const serviceWorker = {
    register: vi.fn().mockResolvedValue(registration),
    ready: Promise.resolve(registration),
    controller: null,
  };

  return { activeWorker, serviceWorker };
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

  it('registers the service worker and requests current invitation caching in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    setWindowLocation('http://localhost/dani-marini?to=Budi');
    const { activeWorker, serviceWorker } = createServiceWorkerContainerMock();
    setServiceWorker(serviceWorker as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    await waitFor(() => {
      expect(serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(activeWorker.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_INVITATION_PAGE',
        url: 'http://localhost/dani-marini?to=Budi',
      });
    });
  });

  it('does not register outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    setWindowLocation('http://localhost/test');
    const { serviceWorker } = createServiceWorkerContainerMock();
    setServiceWorker(serviceWorker as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    expect(canRegisterServiceWorker()).toBe(false);
    expect(serviceWorker.register).not.toHaveBeenCalled();
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
    const { serviceWorker } = createServiceWorkerContainerMock();
    setServiceWorker(serviceWorker as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    expect(canRegisterServiceWorker()).toBe(false);
    expect(serviceWorker.register).not.toHaveBeenCalled();
  });

  it('does not request current page caching outside public invitation paths', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    setWindowLocation('http://localhost/admin/dani-marini');
    const { activeWorker, serviceWorker } = createServiceWorkerContainerMock();
    setServiceWorker(serviceWorker as unknown as ServiceWorkerContainer);

    render(<ServiceWorkerRegistrar />);

    await waitFor(() => {
      expect(serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });
    expect(activeWorker.postMessage).not.toHaveBeenCalled();
  });

  it('detects only single-segment public invitation paths', () => {
    expect(isPublicInvitationPath('/dani-marini')).toBe(true);
    expect(isPublicInvitationPath('/admin/dani-marini')).toBe(false);
    expect(isPublicInvitationPath('/login')).toBe(false);
    expect(isPublicInvitationPath('/dani-marini/gallery')).toBe(false);
  });
});
