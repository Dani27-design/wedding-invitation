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

interface InvitationProductTourProps {
  slug: string;
  isOpen: boolean;
  onStartMusic: () => void;
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

function createOpeningTourSteps({
  dismissTourAndStartMusic,
  openInvitationAndEndTour,
}: {
  dismissTourAndStartMusic: DriverHook;
  openInvitationAndEndTour: DriverHook;
}): DriveStep[] {
  return [
    {
      popover: {
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        showButtons: ['next'],
        nextBtnText: 'Buka Undangan',
        onNextClick: openInvitationAndEndTour,
        onCloseClick: dismissTourAndStartMusic,
      },
    },
  ];
}

function createOpeningDriverConfig({
  dismissTourAndStartMusic,
  steps,
  openInvitationAndEndTour,
}: {
  dismissTourAndStartMusic: DriverHook;
  steps: DriveStep[];
  openInvitationAndEndTour: DriverHook;
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
        dismissTourAndStartMusic(element, step, opts);
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
    onDoneClick: openInvitationAndEndTour,
    onCloseClick: (element, step, opts) => {
      if (opts.index === 0) {
        dismissTourAndStartMusic(element, step, opts);
        return;
      }
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
  onStartMusic,
  onOpenInvitation,
  setIsToolsOpen,
  children,
}: InvitationProductTourProps) {
  const driverRef = useRef<Driver | null>(null);
  const isOpenRef = useRef(isOpen);
  const dismissedTourRef = useRef(false);
  const requestedOpenRef = useRef(false);
  const destroyedToursRef = useRef<WeakSet<Driver>>(new WeakSet());
  const [isTourRunning, setIsTourRunning] = useState(false);

  const destroyProductTours = useCallback((tour?: Driver | null) => {
    if (tour) {
      if (!destroyedToursRef.current.has(tour)) {
        destroyedToursRef.current.add(tour);
        destroyDriverTour(tour);
      }
    }
    driverRef.current = null;
    destroyAllDriverTours();
  }, []);

  const stopTour = useCallback(() => {
    destroyProductTours(driverRef.current);
    setIsTourRunning(false);
  }, [destroyProductTours]);

  const startTour = useCallback(() => {
    const activeTour = driverRef.current;
    if (activeTour && !activeTour.isActive()) {
      activeTour.drive();
      setIsTourRunning(true);
      return;
    }
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!slug || isOpenRef.current) return undefined;
    if (!document.querySelector(OPENING_SELECTOR)) return undefined;

    dismissedTourRef.current = false;
    requestedOpenRef.current = false;
    destroyedToursRef.current = new WeakSet();

    const openInvitationFromTour = ({ closeTools = true }: { closeTools?: boolean } = {}) => {
      if (requestedOpenRef.current || dismissedTourRef.current) return;
      requestedOpenRef.current = true;
      if (closeTools) setIsToolsOpen?.(false);
      onOpenInvitation();
    };

    const openInvitationAndEndTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      openInvitationFromTour();
      destroyProductTours(activeDriver);
      setIsTourRunning(false);
    };

    const dismissTourAndStartMusic: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (dismissedTourRef.current || requestedOpenRef.current) return;
      dismissedTourRef.current = true;
      onStartMusic();
      destroyProductTours(activeDriver);
      setIsTourRunning(false);
    };

    const steps = createOpeningTourSteps({
      dismissTourAndStartMusic,
      openInvitationAndEndTour,
    });

    const tour = driver(createOpeningDriverConfig({
      dismissTourAndStartMusic,
      steps,
      openInvitationAndEndTour,
    }));
    const unregisterTour = registerDriverTour(tour);

    driverRef.current = tour;
    tour.drive();
    setIsTourRunning(true);

    const removeFloatingNavigationListener = addFloatingNavigationStartListener(() => {
      destroyProductTours(driverRef.current ?? tour);
      setIsTourRunning(false);
    });

    return () => {
      removeFloatingNavigationListener();
      unregisterTour();
      destroyProductTours(driverRef.current ?? tour);
      setIsTourRunning(false);
    };
  }, [destroyProductTours, onOpenInvitation, onStartMusic, setIsToolsOpen, slug]);

  useEffect(() => {
    if (!isOpen) return;
    const tour = driverRef.current;

    if (tour && !requestedOpenRef.current && tour.getActiveIndex() === 0) {
      requestedOpenRef.current = true;
      destroyProductTours(tour);
      return;
    }
  }, [destroyProductTours, isOpen]);

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
