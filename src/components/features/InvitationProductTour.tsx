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

function getFloatingMenuTourElement() {
  const button = document.querySelector<HTMLElement>(FLOATING_MENU_BUTTON_SELECTOR);
  return button?.closest('[class~="fixed"]') ?? button ?? undefined;
}

function createFloatingMenuTourStep(showFloatingMenu: DriverHook): DriveStep {
  return {
    element: getFloatingMenuTourElement as () => Element,
    waitForElement: FLOATING_MENU_WAIT_MS,
    disableActiveInteraction: false,
    advanceOnClick: true,
    onHighlightStarted: showFloatingMenu,
    popover: {
      title: 'Akses Cepat',
      description: 'Gunakan tombol mengambang ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman di layar.',
      side: 'top',
      align: 'end',
      showButtons: ['next'],
      doneBtnText: 'Mengerti',
    },
  };
}

function createInvitationTourSteps({
  openInvitationAndContinueTour,
  showFloatingMenu,
}: {
  openInvitationAndContinueTour: DriverHook;
  showFloatingMenu: DriverHook;
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
    createFloatingMenuTourStep(showFloatingMenu),
  ];
}

function createDriverConfig({
  steps,
  openInvitationAndContinueTour,
  endTour,
}: {
  steps: DriveStep[];
  openInvitationAndContinueTour: DriverHook;
  endTour: DriverHook;
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

      endTour(element, step, opts);
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
    onDoneClick: endTour,
    onCloseClick: (element, step, opts) => {
      if (opts.index === 0) {
        openInvitationAndContinueTour(element, step, opts);
        return;
      }

      endTour(element, step, opts);
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
  const [isTourRunning, setIsTourRunning] = useState(false);

  const clearFloatingStepTimer = useCallback(() => {
    if (floatingStepTimerRef.current === null) return;
    clearTimeout(floatingStepTimerRef.current);
    floatingStepTimerRef.current = null;
  }, []);

  const destroyTour = useCallback((tour: Driver) => {
    clearFloatingStepTimer();
    if (destroyedToursRef.current.has(tour)) return;
    destroyedToursRef.current.add(tour);
    tour.destroy();
    setIsTourRunning(false);
  }, [clearFloatingStepTimer]);

  const endTour = useCallback<DriverHook>((_element, _step, { driver: activeDriver }) => {
    if (driverRef.current === activeDriver) {
      driverRef.current = null;
    }
    destroyTour(activeDriver);
  }, [destroyTour]);

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

  const showFloatingMenu = useCallback<DriverHook>(() => {
    setIsToolsOpen?.(true);
  }, [setIsToolsOpen]);

  const scheduleFloatingTour = useCallback((activeDriver: Driver, start: () => void) => {
    setIsToolsOpen?.(true);
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
      showFloatingMenu,
    });

    const tour = driver(createDriverConfig({
      steps,
      openInvitationAndContinueTour,
      endTour,
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
  }, [destroyTour, endTour, onOpenInvitation, scheduleFloatingTour, showFloatingMenu, setIsToolsOpen, slug]);

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
