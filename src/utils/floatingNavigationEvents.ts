export const FLOATING_NAVIGATION_START_EVENT = 'wedding:floating-navigation-start';
export const FLOATING_NAVIGATION_END_EVENT = 'wedding:floating-navigation-end';

const FLOATING_NAVIGATION_RETRY_DELAY_MS = 120;
const FLOATING_NAVIGATION_MAX_WAIT_MS = 7000;
const FLOATING_NAVIGATION_SCROLL_OFFSET_PX = 8;

export interface FloatingNavigationStartDetail {
  sectionId: string;
}

export interface FloatingNavigationEndDetail extends FloatingNavigationStartDetail {
  reason: 'target-reached' | 'timeout' | 'superseded' | 'reset';
}

interface FloatingNavigationGuard {
  sectionId: string;
  startedAt: number;
  timer: ReturnType<typeof setTimeout> | null;
}

let activeNavigationGuard: FloatingNavigationGuard | null = null;

function getNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function isTargetReached(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  if (rect.height <= 0 || viewportHeight <= 0) return false;

  const scrollAnchor = FLOATING_NAVIGATION_SCROLL_OFFSET_PX + 48;
  const reachedTop = Math.abs(rect.top - FLOATING_NAVIGATION_SCROLL_OFFSET_PX) <= 48;
  const containsScrollAnchor = rect.top <= scrollAnchor && rect.bottom >= scrollAnchor;
  const visiblyEnteredViewport = rect.top >= 0 && rect.top <= viewportHeight * 0.25;

  return reachedTop || containsScrollAnchor || visiblyEnteredViewport;
}

function finishFloatingNavigationGuard(
  guard: FloatingNavigationGuard,
  reason: FloatingNavigationEndDetail['reason'],
) {
  if (activeNavigationGuard !== guard) return;
  if (guard.timer !== null) {
    clearTimeout(guard.timer);
  }

  activeNavigationGuard = null;

  window.dispatchEvent(
    new CustomEvent<FloatingNavigationEndDetail>(FLOATING_NAVIGATION_END_EVENT, {
      detail: { sectionId: guard.sectionId, reason },
    }),
  );
}

function scheduleFloatingNavigationGuardCheck(guard: FloatingNavigationGuard) {
  guard.timer = setTimeout(() => {
    guard.timer = null;
    if (activeNavigationGuard !== guard) return;

    if (isTargetReached(guard.sectionId)) {
      finishFloatingNavigationGuard(guard, 'target-reached');
      return;
    }

    if (getNow() - guard.startedAt >= FLOATING_NAVIGATION_MAX_WAIT_MS) {
      finishFloatingNavigationGuard(guard, 'timeout');
      return;
    }

    scheduleFloatingNavigationGuardCheck(guard);
  }, FLOATING_NAVIGATION_RETRY_DELAY_MS);
}

function startFloatingNavigationGuard(sectionId: string) {
  const previousGuard = activeNavigationGuard;
  if (previousGuard) {
    finishFloatingNavigationGuard(previousGuard, 'superseded');
  }

  const guard: FloatingNavigationGuard = {
    sectionId,
    startedAt: getNow(),
    timer: null,
  };

  activeNavigationGuard = guard;
  scheduleFloatingNavigationGuardCheck(guard);
}

export function dispatchFloatingNavigationStart(sectionId: string) {
  startFloatingNavigationGuard(sectionId);

  window.dispatchEvent(
    new CustomEvent<FloatingNavigationStartDetail>(FLOATING_NAVIGATION_START_EVENT, {
      detail: { sectionId },
    }),
  );
}

export function addFloatingNavigationStartListener(
  listener: (event: CustomEvent<FloatingNavigationStartDetail>) => void,
) {
  const eventListener = listener as EventListener;
  window.addEventListener(FLOATING_NAVIGATION_START_EVENT, eventListener);

  return () => {
    window.removeEventListener(FLOATING_NAVIGATION_START_EVENT, eventListener);
  };
}

export function addFloatingNavigationEndListener(
  listener: (event: CustomEvent<FloatingNavigationEndDetail>) => void,
) {
  const eventListener = listener as EventListener;
  window.addEventListener(FLOATING_NAVIGATION_END_EVENT, eventListener);

  return () => {
    window.removeEventListener(FLOATING_NAVIGATION_END_EVENT, eventListener);
  };
}

export function isFloatingNavigationInProgress() {
  return activeNavigationGuard !== null;
}

export function resetFloatingNavigationStateForTests() {
  if (!activeNavigationGuard) return;
  finishFloatingNavigationGuard(activeNavigationGuard, 'reset');
}
