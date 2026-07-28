export const FLOATING_NAVIGATION_START_EVENT = 'wedding:floating-navigation-start';

export interface FloatingNavigationStartDetail {
  sectionId: string;
}

export function dispatchFloatingNavigationStart(sectionId: string) {
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
