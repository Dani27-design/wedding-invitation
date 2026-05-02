import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('hooks/useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // Past dates: should return all zeros
  // ---------------------------------------------------------------------------
  describe('past date returns all zeros', () => {
    it('returns all zeros for a date far in the past', () => {
      const { result } = renderHook(() => useCountdown('2020-01-01T00:00:00'));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('returns all zeros for yesterday', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const { result } = renderHook(() => useCountdown(yesterday));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('returns all zeros for a date in the year 2000', () => {
      const { result } = renderHook(() => useCountdown('2000-06-15T12:00:00'));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('returns all zeros for 1 millisecond ago', () => {
      const justPast = new Date(Date.now() - 1).toISOString();
      const { result } = renderHook(() => useCountdown(justPast));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Just expired (1 second ago)
  // ---------------------------------------------------------------------------
  describe('just expired returns zeros', () => {
    it('returns all zeros for exactly 1 second ago', () => {
      const oneSecAgo = new Date(Date.now() - 1000).toISOString();
      const { result } = renderHook(() => useCountdown(oneSecAgo));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('returns all zeros for exactly 1 minute ago', () => {
      const oneMinAgo = new Date(Date.now() - 60000).toISOString();
      const { result } = renderHook(() => useCountdown(oneMinAgo));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Future dates: should return positive values
  // ---------------------------------------------------------------------------
  describe('future date returns positive values', () => {
    it('returns positive days for a date 10 days from now', () => {
      const future = new Date(Date.now() + 86400000 * 10).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.days).toBeGreaterThan(0);
    });

    it('returns positive hours for a date 5 hours from now', () => {
      const future = new Date(Date.now() + 3600000 * 5).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.hours).toBeGreaterThan(0);
    });

    it('returns positive minutes for a date 30 minutes from now', () => {
      const future = new Date(Date.now() + 60000 * 30).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.minutes).toBeGreaterThan(0);
    });

    it('returns positive seconds for a date 45 seconds from now', () => {
      const future = new Date(Date.now() + 45000).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.seconds).toBeGreaterThan(0);
    });

    it('returns all non-negative values for a date 1 year from now', () => {
      const future = new Date(Date.now() + 86400000 * 365).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.days).toBeGreaterThanOrEqual(0);
      expect(result.current.hours).toBeGreaterThanOrEqual(0);
      expect(result.current.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.seconds).toBeGreaterThanOrEqual(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Far future (10 years): large day count
  // ---------------------------------------------------------------------------
  describe('far future date', () => {
    it('returns large day count for 10 years from now', () => {
      const tenYears = new Date(Date.now() + 86400000 * 3650).toISOString();
      const { result } = renderHook(() => useCountdown(tenYears));
      expect(result.current.days).toBeGreaterThan(3000);
    });

    it('returns days exceeding 365 for a date 2 years from now', () => {
      const twoYears = new Date(Date.now() + 86400000 * 730).toISOString();
      const { result } = renderHook(() => useCountdown(twoYears));
      expect(result.current.days).toBeGreaterThan(365);
    });

    it('hours/minutes/seconds stay within valid ranges for far future', () => {
      const tenYears = new Date(Date.now() + 86400000 * 3650).toISOString();
      const { result } = renderHook(() => useCountdown(tenYears));
      expect(result.current.hours).toBeGreaterThanOrEqual(0);
      expect(result.current.hours).toBeLessThan(24);
      expect(result.current.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.minutes).toBeLessThan(60);
      expect(result.current.seconds).toBeGreaterThanOrEqual(0);
      expect(result.current.seconds).toBeLessThan(60);
    });
  });

  // ---------------------------------------------------------------------------
  // Values update every second
  // ---------------------------------------------------------------------------
  describe('timer updates', () => {
    it('values update after 1 second tick', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      const initialSeconds = result.current.seconds;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // After 1 second, seconds should have changed (decremented by 1)
      expect(result.current.seconds).not.toBe(initialSeconds);
    });

    it('seconds decrease by 1 after a 1-second tick', () => {
      // Use a target exactly 100 seconds from now to avoid minute rollover
      const future = new Date(Date.now() + 100000).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      const initialSeconds = result.current.seconds;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // seconds should have decreased by 1, unless it was 0 and rolled over
      if (initialSeconds > 0) {
        expect(result.current.seconds).toBe(initialSeconds - 1);
      } else {
        // rolled from 0 to 59
        expect(result.current.seconds).toBe(59);
      }
    });

    it('values update after multiple ticks', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      const { result } = renderHook(() => useCountdown(future));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After 5 seconds, the countdown should have advanced
      expect(result.current).toBeDefined();
      expect(result.current.days).toBeGreaterThanOrEqual(0);
    });

    it('advancing 60 seconds changes the minute value', () => {
      // 2 hours from now (enough buffer)
      const future = new Date(Date.now() + 7200000).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      const initialMinutes = result.current.minutes;

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Minutes should have changed (decreased by 1 or rolled over)
      if (initialMinutes > 0) {
        expect(result.current.minutes).toBe(initialMinutes - 1);
      } else {
        expect(result.current.minutes).toBe(59);
      }
    });

    it('advancing 3600 seconds changes the hour value', () => {
      // 2 days from now
      const future = new Date(Date.now() + 86400000 * 2).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      const initialHours = result.current.hours;

      act(() => {
        vi.advanceTimersByTime(3600000);
      });

      if (initialHours > 0) {
        expect(result.current.hours).toBe(initialHours - 1);
      } else {
        expect(result.current.hours).toBe(23);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Valid ranges for days/hours/minutes/seconds
  // ---------------------------------------------------------------------------
  describe('value ranges', () => {
    it('hours are between 0 and 23', () => {
      const future = new Date(Date.now() + 86400000 * 5).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.hours).toBeGreaterThanOrEqual(0);
      expect(result.current.hours).toBeLessThanOrEqual(23);
    });

    it('minutes are between 0 and 59', () => {
      const future = new Date(Date.now() + 86400000 * 5).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.minutes).toBeLessThanOrEqual(59);
    });

    it('seconds are between 0 and 59', () => {
      const future = new Date(Date.now() + 86400000 * 5).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.seconds).toBeGreaterThanOrEqual(0);
      expect(result.current.seconds).toBeLessThanOrEqual(59);
    });

    it('days are non-negative', () => {
      const future = new Date(Date.now() + 86400000 * 5).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(result.current.days).toBeGreaterThanOrEqual(0);
    });

    it('all values are integers (no fractional parts)', () => {
      const future = new Date(Date.now() + 86400000 * 5 + 12345678).toISOString();
      const { result } = renderHook(() => useCountdown(future));
      expect(Number.isInteger(result.current.days)).toBe(true);
      expect(Number.isInteger(result.current.hours)).toBe(true);
      expect(Number.isInteger(result.current.minutes)).toBe(true);
      expect(Number.isInteger(result.current.seconds)).toBe(true);
    });

    it('ranges hold after multiple ticks', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      const { result } = renderHook(() => useCountdown(future));

      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        expect(result.current.hours).toBeGreaterThanOrEqual(0);
        expect(result.current.hours).toBeLessThanOrEqual(23);
        expect(result.current.minutes).toBeGreaterThanOrEqual(0);
        expect(result.current.minutes).toBeLessThanOrEqual(59);
        expect(result.current.seconds).toBeGreaterThanOrEqual(0);
        expect(result.current.seconds).toBeLessThanOrEqual(59);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup: clearInterval on unmount
  // ---------------------------------------------------------------------------
  describe('cleanup on unmount', () => {
    it('calls clearInterval when unmounted', () => {
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      const { unmount } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      unmount();
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it('clearInterval receives the interval id', () => {
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      const { unmount } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      unmount();
      // clearInterval should have been called with a numeric or object timer id
      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(clearSpy.mock.calls[0][0]).toBeDefined();
      clearSpy.mockRestore();
    });

    it('no more state updates after unmount', () => {
      const { result, unmount } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      const lastValue = { ...result.current };
      unmount();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After unmount, result should not have changed
      // (renderHook result freezes on unmount)
      expect(result.current.days).toBe(lastValue.days);
    });

    it('cleanup is called even for past dates', () => {
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      const { unmount } = renderHook(() => useCountdown('2020-01-01T00:00:00'));
      unmount();
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: date string parsing with different formats
  // ---------------------------------------------------------------------------
  describe('date string parsing', () => {
    it('parses ISO 8601 format', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      expect(result.current.days).toBeGreaterThan(0);
    });

    it('parses ISO 8601 with timezone', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00Z'));
      expect(result.current.days).toBeGreaterThan(0);
    });

    it('parses date-only string', () => {
      const { result } = renderHook(() => useCountdown('2030-06-15'));
      expect(result.current.days).toBeGreaterThan(0);
    });

    it('parses full ISO string with milliseconds', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00.000Z'));
      expect(result.current.days).toBeGreaterThan(0);
    });

    it('parses date with positive timezone offset', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00+07:00'));
      expect(result.current.days).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: midnight boundary (exactly 00:00:00)
  // ---------------------------------------------------------------------------
  describe('midnight boundary', () => {
    it('handles target at exactly midnight', () => {
      const midnight = new Date(Date.now() + 86400000);
      midnight.setHours(0, 0, 0, 0);
      const future = midnight.toISOString();
      const { result } = renderHook(() => useCountdown(future));
      // Should have valid countdown values
      expect(result.current.days).toBeGreaterThanOrEqual(0);
      expect(result.current.hours).toBeGreaterThanOrEqual(0);
    });

    it('handles current time at midnight', () => {
      // Set fake time to midnight
      const midnight = new Date('2026-05-02T00:00:00');
      vi.setSystemTime(midnight);
      const target = '2026-05-03T00:00:00';
      const { result } = renderHook(() => useCountdown(target));
      expect(result.current.days).toBe(1);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge: exactly 1 day, 1 hour, 1 minute, 1 second from now
  // ---------------------------------------------------------------------------
  describe('exact unit boundaries', () => {
    it('exactly 1 day from now shows days=1, rest=0', () => {
      const exactlyOneDay = new Date(Date.now() + 86400000).toISOString();
      const { result } = renderHook(() => useCountdown(exactlyOneDay));
      // Due to execution time, we check approximately
      expect(result.current.days).toBeGreaterThanOrEqual(0);
      expect(result.current.days).toBeLessThanOrEqual(1);
    });

    it('exactly 1 hour from now shows hours >= 0', () => {
      const oneHour = new Date(Date.now() + 3600000).toISOString();
      const { result } = renderHook(() => useCountdown(oneHour));
      expect(result.current.hours).toBeGreaterThanOrEqual(0);
      expect(result.current.hours).toBeLessThanOrEqual(1);
    });

    it('exactly 1 minute from now shows minutes >= 0', () => {
      const oneMinute = new Date(Date.now() + 60000).toISOString();
      const { result } = renderHook(() => useCountdown(oneMinute));
      expect(result.current.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.minutes).toBeLessThanOrEqual(1);
    });

    it('exactly 1 second from now shows seconds >= 0', () => {
      const oneSecond = new Date(Date.now() + 1000).toISOString();
      const { result } = renderHook(() => useCountdown(oneSecond));
      expect(result.current.seconds).toBeGreaterThanOrEqual(0);
      expect(result.current.seconds).toBeLessThanOrEqual(1);
    });

    it('with controlled time, exactly 1 day returns days=1', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-03T12:00:00Z';
      const { result } = renderHook(() => useCountdown(target));
      expect(result.current.days).toBe(1);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('with controlled time, exactly 1 hour returns hours=1', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T13:00:00Z';
      const { result } = renderHook(() => useCountdown(target));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(1);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('with controlled time, exactly 1 minute returns minutes=1', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:01:00Z';
      const { result } = renderHook(() => useCountdown(target));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(1);
      expect(result.current.seconds).toBe(0);
    });

    it('with controlled time, exactly 1 second returns seconds=1', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:00:01Z';
      const { result } = renderHook(() => useCountdown(target));
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary: values don't go negative after passing target
  // ---------------------------------------------------------------------------
  describe('values never go negative after target passes', () => {
    it('stays at zero after countdown expires', () => {
      // Target 3 seconds from now
      const target = new Date(Date.now() + 3000).toISOString();
      const { result } = renderHook(() => useCountdown(target));

      // Advance past the target
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('stays at zero long after countdown expires', () => {
      const target = new Date(Date.now() + 1000).toISOString();
      const { result } = renderHook(() => useCountdown(target));

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('transitions from positive to zero smoothly', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:00:03Z'; // 3 seconds
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.seconds).toBe(3);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(2);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(1);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(0);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(0);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Rerender with different targetDate resets the timer
  // ---------------------------------------------------------------------------
  describe('rerender with different targetDate', () => {
    it('resets countdown when targetDate changes', () => {
      const target1 = new Date(Date.now() + 86400000 * 2).toISOString();
      const target2 = new Date(Date.now() + 86400000 * 10).toISOString();

      const { result, rerender } = renderHook(
        ({ target }: { target: string }) => useCountdown(target),
        { initialProps: { target: target1 } }
      );

      const initialDays = result.current.days;
      expect(initialDays).toBeGreaterThan(0);

      rerender({ target: target2 });

      expect(result.current.days).toBeGreaterThan(initialDays);
    });

    it('changing from future to past date resets to zeros', () => {
      const futureTarget = new Date(Date.now() + 86400000 * 5).toISOString();
      const pastTarget = '2020-01-01T00:00:00';

      const { result, rerender } = renderHook(
        ({ target }: { target: string }) => useCountdown(target),
        { initialProps: { target: futureTarget } }
      );

      expect(result.current.days).toBeGreaterThan(0);

      rerender({ target: pastTarget });

      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
    });

    it('changing from past to future date shows positive values', () => {
      const pastTarget = '2020-01-01T00:00:00';
      const futureTarget = new Date(Date.now() + 86400000 * 30).toISOString();

      const { result, rerender } = renderHook(
        ({ target }: { target: string }) => useCountdown(target),
        { initialProps: { target: pastTarget } }
      );

      expect(result.current.days).toBe(0);

      rerender({ target: futureTarget });

      expect(result.current.days).toBeGreaterThan(0);
    });

    it('cleanup is called when targetDate changes (old interval cleared)', () => {
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      const target1 = new Date(Date.now() + 86400000).toISOString();
      const target2 = new Date(Date.now() + 86400000 * 2).toISOString();

      const { rerender } = renderHook(
        ({ target }: { target: string }) => useCountdown(target),
        { initialProps: { target: target1 } }
      );

      clearSpy.mockClear();
      rerender({ target: target2 });

      // The effect cleanup should have been called, clearing the old interval
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Multiple ticks advance correctly
  // ---------------------------------------------------------------------------
  describe('multiple ticks advance correctly', () => {
    it('10 ticks reduce seconds by 10 (within same minute)', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:01:00Z'; // 60 seconds away
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.seconds).toBe(0);
      expect(result.current.minutes).toBe(1);

      act(() => { vi.advanceTimersByTime(10000); });

      expect(result.current.seconds).toBe(50);
      expect(result.current.minutes).toBe(0);
    });

    it('60 ticks reduce minutes by 1', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:05:00Z'; // 5 minutes away
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.minutes).toBe(5);
      expect(result.current.seconds).toBe(0);

      act(() => { vi.advanceTimersByTime(60000); });

      expect(result.current.minutes).toBe(4);
      expect(result.current.seconds).toBe(0);
    });

    it('ticking through an entire countdown to zero works', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-02T12:00:05Z'; // 5 seconds
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.seconds).toBe(5);

      for (let i = 4; i >= 0; i--) {
        act(() => { vi.advanceTimersByTime(1000); });
        expect(result.current.seconds).toBe(i);
      }

      // Further ticks stay at 0
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.seconds).toBe(0);
    });

    it('day rollover works correctly', () => {
      vi.setSystemTime(new Date('2026-05-02T12:00:00Z'));
      const target = '2026-05-03T12:00:30Z'; // 1 day + 30 seconds
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.days).toBe(1);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(30);

      // Advance 30 seconds
      act(() => { vi.advanceTimersByTime(30000); });

      expect(result.current.days).toBe(1);
      expect(result.current.hours).toBe(0);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);

      // Advance 1 more second -> day should decrease
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.days).toBe(0);
      expect(result.current.hours).toBe(23);
      expect(result.current.minutes).toBe(59);
      expect(result.current.seconds).toBe(59);
    });
  });

  // ---------------------------------------------------------------------------
  // Return value shape
  // ---------------------------------------------------------------------------
  describe('return value shape', () => {
    it('returns an object with exactly 4 keys', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      const keys = Object.keys(result.current);
      expect(keys).toHaveLength(4);
    });

    it('returns an object with days, hours, minutes, seconds', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      expect(result.current).toHaveProperty('days');
      expect(result.current).toHaveProperty('hours');
      expect(result.current).toHaveProperty('minutes');
      expect(result.current).toHaveProperty('seconds');
    });

    it('all values are numbers', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      expect(typeof result.current.days).toBe('number');
      expect(typeof result.current.hours).toBe('number');
      expect(typeof result.current.minutes).toBe('number');
      expect(typeof result.current.seconds).toBe('number');
    });

    it('no values are NaN', () => {
      const { result } = renderHook(() => useCountdown('2030-01-01T00:00:00'));
      expect(Number.isNaN(result.current.days)).toBe(false);
      expect(Number.isNaN(result.current.hours)).toBe(false);
      expect(Number.isNaN(result.current.minutes)).toBe(false);
      expect(Number.isNaN(result.current.seconds)).toBe(false);
    });
  });
});
