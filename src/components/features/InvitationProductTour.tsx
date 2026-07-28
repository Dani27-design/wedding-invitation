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
import { destroyAllDriverTours, destroyDriverTour, registerDriverTour } from '../../utils/driverLifecycle';

const OPENING_SELECTOR = '[data-tour="cinematic-opening"]';
const FLOATING_MENU_PANEL_SELECTOR = '[data-tour="floating-menu-panel"]';
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

function getFloatingMenuPanelElement() {
  const panel = document.querySelector<HTMLElement>(FLOATING_MENU_PANEL_SELECTOR);
  return panel ?? undefined;
}

function createFloatingMenuTourStep(showFloatingMenu: DriverHook): DriveStep {
  return {
    element: getFloatingMenuPanelElement as () => Element,
    waitForElement: FLOATING_MENU_WAIT_MS,
    disableActiveInteraction: false,
    advanceOnClick: true,
    onHighlightStarted: showFloatingMenu,
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

function createOpeningTourSteps({
  openInvitationAndQueueFloatingTour,
}: {
  openInvitationAndQueueFloatingTour: DriverHook;
}): DriveStep[] {
  return [
    {
      popover: {
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        showButtons: ['next'],
        nextBtnText: 'Buka Undangan',
        onNextClick: openInvitationAndQueueFloatingTour,
        onCloseClick: openInvitationAndQueueFloatingTour,
      },
    },
  ];
}

function createOpeningDriverConfig({
  steps,
  openInvitationAndQueueFloatingTour,
}: {
  steps: DriveStep[];
  openInvitationAndQueueFloatingTour: DriverHook;
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
        openInvitationAndQueueFloatingTour(element, step, opts);
        return;
      }
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
    onDoneClick: openInvitationAndQueueFloatingTour,
    onCloseClick: (element, step, opts) => {
      if (opts.index === 0) {
        openInvitationAndQueueFloatingTour(element, step, opts);
        return;
      }
    },
  };
}

function createFloatingDriverConfig({
  steps,
  endTour,
}: {
  steps: DriveStep[];
  endTour: DriverHook;
}): Config {
  return {
    animate: !prefersReducedMotion(),
    overlayColor: '#1A1A1A',
    overlayOpacity: 0.72,
    smoothScroll: false,
    allowClose: true,
    allowScroll: true,
    overlayClickBehavior: endTour,
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
    onCloseClick: endTour,
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
  const floatingDriverRef = useRef<Driver | null>(null);
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
    if (destroyedToursRef.current.has(tour)) return;
    destroyedToursRef.current.add(tour);
    destroyDriverTour(tour);
  }, []);

  const endTour = useCallback<DriverHook>((_element, _step, { driver: activeDriver }) => {
    if (driverRef.current === activeDriver) {
      driverRef.current = null;
    }
    if (floatingDriverRef.current === activeDriver) {
      floatingDriverRef.current = null;
    }
    destroyTour(activeDriver);
    setIsTourRunning(
      driverRef.current !== null ||
      floatingDriverRef.current !== null ||
      floatingStepTimerRef.current !== null,
    );
  }, [destroyTour]);

  const stopTour = useCallback(() => {
    const activeTour = driverRef.current;
    const activeFloatingTour = floatingDriverRef.current;
    driverRef.current = null;
    floatingDriverRef.current = null;
    clearFloatingStepTimer();
    if (activeTour) {
      destroyTour(activeTour);
    }
    if (activeFloatingTour) {
      destroyTour(activeFloatingTour);
    }
    setIsTourRunning(false);
  }, [clearFloatingStepTimer, destroyTour]);

  const startTour = useCallback(() => {
    const activeTour = driverRef.current;
    if (activeTour && !activeTour.isActive()) {
      activeTour.drive();
      setIsTourRunning(true);
      return;
    }

    const activeFloatingTour = floatingDriverRef.current;
    if (!activeFloatingTour || activeFloatingTour.isActive()) return;
    activeFloatingTour.drive();
    setIsTourRunning(true);
  }, []);

  const showFloatingMenu = useCallback<DriverHook>(() => {
    setIsToolsOpen?.(true);
  }, [setIsToolsOpen]);

  const scheduleFloatingTour = useCallback(() => {
    setIsToolsOpen?.(true);
    clearFloatingStepTimer();
    setIsTourRunning(true);
    floatingStepTimerRef.current = setTimeout(() => {
      floatingStepTimerRef.current = null;
      if (!continuedTourRef.current || floatingDriverRef.current) {
        setIsTourRunning(driverRef.current !== null || floatingDriverRef.current !== null);
        return;
      }

      const floatingTour = driver(createFloatingDriverConfig({
        steps: [createFloatingMenuTourStep(showFloatingMenu)],
        endTour,
      }));

      registerDriverTour(floatingTour);
      floatingDriverRef.current = floatingTour;
      floatingTour.drive();
      setIsTourRunning(true);
    }, FLOATING_MENU_EXPAND_BEFORE_TOUR_MS);
  }, [clearFloatingStepTimer, endTour, setIsToolsOpen, showFloatingMenu]);

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

    const openInvitationAndQueueFloatingTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (continuedTourRef.current) return;
      continuedTourRef.current = true;
      openInvitationFromTour({ closeTools: false });
      if (driverRef.current === activeDriver) {
        driverRef.current = null;
      }
      destroyTour(activeDriver);
      scheduleFloatingTour();
    };

    const steps = createOpeningTourSteps({
      openInvitationAndQueueFloatingTour,
    });

    const tour = driver(createOpeningDriverConfig({
      steps,
      openInvitationAndQueueFloatingTour,
    }));
    const unregisterTour = registerDriverTour(tour);

    driverRef.current = tour;
    tour.drive();
    setIsTourRunning(true);

    const removeFloatingNavigationListener = addFloatingNavigationStartListener(() => {
      if (driverRef.current === tour) {
        driverRef.current = null;
      }
      if (floatingDriverRef.current) {
        floatingDriverRef.current = null;
      }
      destroyedToursRef.current.add(tour);
      clearFloatingStepTimer();
      destroyAllDriverTours();
      setIsTourRunning(false);
    });

    return () => {
      removeFloatingNavigationListener();
      unregisterTour();
      clearFloatingStepTimer();
      const activeTour = driverRef.current;
      const activeFloatingTour = floatingDriverRef.current;
      driverRef.current = null;
      floatingDriverRef.current = null;
      if (activeTour && activeTour !== tour) destroyTour(activeTour);
      if (activeFloatingTour) destroyTour(activeFloatingTour);
      destroyTour(tour);
      setIsTourRunning(false);
    };
  }, [clearFloatingStepTimer, destroyTour, onOpenInvitation, scheduleFloatingTour, setIsToolsOpen, slug]);

  useEffect(() => {
    if (!isOpen) return;
    const tour = driverRef.current;

    if (tour && !requestedOpenRef.current && tour.getActiveIndex() === 0) {
      requestedOpenRef.current = true;
      continuedTourRef.current = true;
      driverRef.current = null;
      destroyTour(tour);
      scheduleFloatingTour();
      return;
    }
  }, [destroyTour, isOpen, scheduleFloatingTour]);

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
