'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { driver, type Config, type DriveStep, type Driver, type DriverHook } from 'driver.js';
import { addFloatingNavigationStartListener } from '../../utils/floatingNavigationEvents';

const OPENING_SELECTOR = '[data-tour="cinematic-opening"]';
const FLOATING_MENU_BUTTON_SELECTOR = '[data-tour="floating-menu-button"]';
const FLOATING_MENU_WAIT_MS = 5000;
const FLOATING_MENU_EXPAND_BEFORE_TOUR_MS = 850;
const DRIVER_CLEANUP_RETRY_DELAY_MS = 50;
const DRIVER_CLEANUP_MAX_WAIT_MS = 800;

interface InvitationProductTourProps {
  slug: string;
  isOpen: boolean;
  onOpenInvitation: () => void;
  setIsToolsOpen?: (open: boolean) => void;
  children?: ReactNode;
}

interface TourContextValue {
  isTourRunning: boolean;
  startTour: () => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function getFloatingMenuButtonElement() {
  const button = document.querySelector<HTMLElement>(FLOATING_MENU_BUTTON_SELECTOR);
  return button ?? undefined;
}

function isDriverCleanupComplete() {
  return (
    !document.body.classList.contains('driver-active') &&
    !document.querySelector('.driver-popover') &&
    !document.querySelector('.driver-overlay')
  );
}

function scheduleAfterNextPaint(callback: () => void) {
  if (window.requestAnimationFrame && window.cancelAnimationFrame) {
    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(callback);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }

  let secondTimer: number | null = null;
  const firstTimer = window.setTimeout(() => {
    secondTimer = window.setTimeout(callback, 16);
  }, 16);

  return () => {
    window.clearTimeout(firstTimer);
    if (secondTimer !== null) {
      window.clearTimeout(secondTimer);
    }
  };
}

function createFloatingMenuTourStep(): DriveStep {
  return {
    element: getFloatingMenuButtonElement as () => Element,
    waitForElement: FLOATING_MENU_WAIT_MS,
    disableActiveInteraction: true,
    popover: {
      title: 'Akses Cepat',
      description: 'Gunakan tombol mengambang ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman di layar.',
      side: 'left',
      align: 'center',
      popoverClass: 'wedding-driver-popover wedding-driver-popover--floating-menu',
      showButtons: ['next'],
      doneBtnText: 'Mengerti',
    },
  };
}

function createInvitationTourSteps({
  openInvitationAndContinueTour,
}: {
  openInvitationAndContinueTour: DriverHook;
}): DriveStep[] {
  return [
    {
      popover: {
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        showButtons: ['next'],
        nextBtnText: 'Buka Undangan',
        onNextClick: openInvitationAndContinueTour,
        onCloseClick: openInvitationAndContinueTour,
      },
    },
    createFloatingMenuTourStep(),
  ];
}

function createDriverConfig({
  steps,
  openInvitationAndContinueTour,
  endTour,
  endTourAndOpenFloatingMenu,
}: {
  steps: DriveStep[];
  openInvitationAndContinueTour: DriverHook;
  endTour: DriverHook;
  endTourAndOpenFloatingMenu: DriverHook;
}): Config {
  return {
    animate: !prefersReducedMotion(),
    overlayColor: '#1A1A1A',
    overlayOpacity: 0.72,
    smoothScroll: false,
    allowClose: true,
    allowScroll: true,
    overlayClickBehavior: (element, step, opts) => {
      if (opts.index === 0) {
        openInvitationAndContinueTour(element, step, opts);
        return;
      }

      endTourAndOpenFloatingMenu(element, step, opts);
    },
    disableActiveInteraction: false,
    stagePadding: 10,
    stageRadius: 18,
    popoverOffset: 16,
    popoverClass: 'wedding-driver-popover',
    showButtons: ['next', 'close'],
    showProgress: false,
    doneBtnText: 'Selesai',
    steps,
    onDoneClick: endTourAndOpenFloatingMenu,
    onCloseClick: (element, step, opts) => {
      if (opts.index === 0) {
        openInvitationAndContinueTour(element, step, opts);
        return;
      }

      endTourAndOpenFloatingMenu(element, step, opts);
    },
  };
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}

export function useOptionalTour() {
  return useContext(TourContext);
}

export function TourProvider({
  slug,
  isOpen,
  onOpenInvitation,
  setIsToolsOpen,
  children,
}: InvitationProductTourProps) {
  const driverRef = useRef<Driver | null>(null);
  const isOpenRef = useRef(isOpen);
  const requestedOpenRef = useRef(false);
  const continuedTourRef = useRef(false);
  const destroyedToursRef = useRef<WeakSet<Driver>>(new WeakSet());
  const floatingStepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingMenuCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingMenuCleanupPaintRef = useRef<(() => void) | null>(null);
  const floatingMenuCleanupStartedAtRef = useRef(0);
  const [isTourRunning, setIsTourRunning] = useState(false);

  const clearFloatingStepTimer = useCallback(() => {
    if (floatingStepTimerRef.current === null) return;
    clearTimeout(floatingStepTimerRef.current);
    floatingStepTimerRef.current = null;
  }, []);

  const clearFloatingMenuCleanupTimer = useCallback(() => {
    if (floatingMenuCleanupTimerRef.current !== null) {
      clearTimeout(floatingMenuCleanupTimerRef.current);
      floatingMenuCleanupTimerRef.current = null;
    }
    floatingMenuCleanupPaintRef.current?.();
    floatingMenuCleanupPaintRef.current = null;
  }, []);

  const destroyTour = useCallback((tour: Driver) => {
    clearFloatingStepTimer();
    clearFloatingMenuCleanupTimer();
    if (destroyedToursRef.current.has(tour)) return;
    destroyedToursRef.current.add(tour);
    tour.destroy();
    setIsTourRunning(false);
  }, [clearFloatingMenuCleanupTimer, clearFloatingStepTimer]);

  const openFloatingMenuAfterDriverCleanup = useCallback(() => {
    clearFloatingMenuCleanupTimer();
    floatingMenuCleanupStartedAtRef.current = Date.now();

    const waitUntilClean = () => {
      if (
        isDriverCleanupComplete() ||
        Date.now() - floatingMenuCleanupStartedAtRef.current >= DRIVER_CLEANUP_MAX_WAIT_MS
      ) {
        floatingMenuCleanupTimerRef.current = null;
        floatingMenuCleanupPaintRef.current = scheduleAfterNextPaint(() => {
          floatingMenuCleanupPaintRef.current = null;
          setIsToolsOpen?.(true);
        });
        return;
      }

      floatingMenuCleanupTimerRef.current = setTimeout(waitUntilClean, DRIVER_CLEANUP_RETRY_DELAY_MS);
    };

    waitUntilClean();
  }, [clearFloatingMenuCleanupTimer, setIsToolsOpen]);

  const endTour = useCallback<DriverHook>((_element, _step, { driver: activeDriver }) => {
    if (driverRef.current === activeDriver) {
      driverRef.current = null;
    }
    destroyTour(activeDriver);
  }, [destroyTour]);

  const endTourAndOpenFloatingMenu = useCallback<DriverHook>((element, step, opts) => {
    endTour(element, step, opts);
    openFloatingMenuAfterDriverCleanup();
  }, [endTour, openFloatingMenuAfterDriverCleanup]);

  const stopTour = useCallback(() => {
    const activeTour = driverRef.current;
    driverRef.current = null;
    if (activeTour) {
      destroyTour(activeTour);
    }
  }, [destroyTour]);

  const startTour = useCallback(() => {
    const activeTour = driverRef.current;
    if (!activeTour || activeTour.isActive()) return;
    activeTour.drive();
    setIsTourRunning(true);
  }, []);

  const scheduleFloatingTour = useCallback((activeDriver: Driver, start: () => void) => {
    setIsToolsOpen?.(false);
    clearFloatingStepTimer();
    floatingStepTimerRef.current = setTimeout(() => {
      floatingStepTimerRef.current = null;
      if (driverRef.current !== activeDriver) return;
      start();
    }, FLOATING_MENU_EXPAND_BEFORE_TOUR_MS);
  }, [clearFloatingStepTimer, setIsToolsOpen]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!slug || isOpenRef.current) return undefined;
    if (!document.querySelector(OPENING_SELECTOR)) return undefined;

    requestedOpenRef.current = false;
    continuedTourRef.current = false;
    destroyedToursRef.current = new WeakSet();

    const openInvitationFromTour = ({ closeTools = true }: { closeTools?: boolean } = {}) => {
      if (requestedOpenRef.current) return;
      requestedOpenRef.current = true;
      if (closeTools) setIsToolsOpen?.(false);
      onOpenInvitation();
    };

    const openInvitationAndContinueTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (continuedTourRef.current) return;
      continuedTourRef.current = true;
      openInvitationFromTour({ closeTools: false });
      scheduleFloatingTour(activeDriver, () => {
        if (!continuedTourRef.current) return;
        activeDriver.moveNext();
      });
    };

    const steps = createInvitationTourSteps({
      openInvitationAndContinueTour,
    });

    const tour = driver(createDriverConfig({
      steps,
      openInvitationAndContinueTour,
      endTour,
      endTourAndOpenFloatingMenu,
    }));

    driverRef.current = tour;
    tour.drive();
    setIsTourRunning(true);

    const removeFloatingNavigationListener = addFloatingNavigationStartListener(() => {
      if (driverRef.current === tour) {
        driverRef.current = null;
      }
      destroyTour(tour);
    });

    return () => {
      removeFloatingNavigationListener();
      const activeTour = driverRef.current;
      driverRef.current = null;
      if (activeTour && activeTour !== tour) destroyTour(activeTour);
      destroyTour(tour);
    };
  }, [destroyTour, endTour, endTourAndOpenFloatingMenu, onOpenInvitation, scheduleFloatingTour, setIsToolsOpen, slug]);

  useEffect(() => {
    if (!isOpen) return;
    const tour = driverRef.current;

    if (tour && !requestedOpenRef.current && tour.getActiveIndex() === 0) {
      requestedOpenRef.current = true;
      continuedTourRef.current = true;
      scheduleFloatingTour(tour, () => {
        if (!continuedTourRef.current) return;
        tour.moveNext();
      });
      return;
    }
  }, [isOpen, scheduleFloatingTour]);

  const value = useMemo<TourContextValue>(() => ({
    isTourRunning,
    startTour,
    stopTour,
  }), [isTourRunning, startTour, stopTour]);

  return (
    <TourContext.Provider value={value}>
      {children ?? null}
    </TourContext.Provider>
  );
}

export function InvitationProductTour(props: InvitationProductTourProps) {
  return <TourProvider {...props} />;
}
