import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

const OFFLINE_SESSION_KEY = 'marinikah-offline-detected';

function setNavigatorOnline(value: boolean | undefined) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('hooks/useNetworkStatus', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('returns the current navigator online state', () => {
    setNavigatorOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(true);
  });

  it('defaults to online when navigator.onLine is unavailable', () => {
    setNavigatorOnline(undefined);

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toBe(true);
  });

  it('updates when the browser goes offline', () => {
    setNavigatorOnline(true);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('updates when the browser comes back online', () => {
    setNavigatorOnline(false);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('clears stale offline state on remount when the browser is online', () => {
    setNavigatorOnline(true);
    const first = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(first.result.current).toBe(false);
    first.unmount();

    setNavigatorOnline(true);
    const second = renderHook(() => useNetworkStatus());

    expect(second.result.current).toBe(true);
    expect(sessionStorage.getItem(OFFLINE_SESSION_KEY)).toBeNull();
  });
});
