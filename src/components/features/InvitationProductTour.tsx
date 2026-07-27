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

const OPENING_SELECTOR = '[data-tour="cinematic-opening"]';
const FLOATING_MENU_BUTTON_SELECTOR = '[data-tour="floating-menu-button"]';
const FLOATING_MENU_WAIT_MS = 5000;

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

function createInvitationTourSteps({
  openInvitationAndContinueTour,
  openInvitationAndEndTour,
  showFloatingMenu,
}: {
  openInvitationAndContinueTour: DriverHook;
  openInvitationAndEndTour: DriverHook;
  showFloatingMenu: DriverHook;
}): DriveStep[] {
  return [
    {
      popover: {
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk masuk ke halaman acara.',
        showButtons: ['close', 'next'],
        nextBtnText: 'Buka Undangan',
        onNextClick: openInvitationAndContinueTour,
        onCloseClick: openInvitationAndEndTour,
      },
    },
    {
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
    },
  ];
}

function createDriverConfig({
  steps,
  openInvitationAndContinueTour,
  openInvitationAndEndTour,
  endTour,
}: {
  steps: DriveStep[];
  openInvitationAndContinueTour: DriverHook;
  openInvitationAndEndTour: DriverHook;
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
    onCloseClick: openInvitationAndEndTour,
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
  const [isTourRunning, setIsTourRunning] = useState(false);

  const destroyTour = useCallback((tour: Driver) => {
    if (destroyedToursRef.current.has(tour)) return;
    destroyedToursRef.current.add(tour);
    tour.destroy();
    setIsTourRunning(false);
  }, []);

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

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!slug || isOpenRef.current) return undefined;
    if (!document.querySelector(OPENING_SELECTOR)) return undefined;

    requestedOpenRef.current = false;
    continuedTourRef.current = false;
    destroyedToursRef.current = new WeakSet();

    const openInvitationFromTour = () => {
      if (requestedOpenRef.current) return;
      requestedOpenRef.current = true;
      setIsToolsOpen?.(false);
      onOpenInvitation();
    };

    const endTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (driverRef.current === activeDriver) {
        driverRef.current = null;
      }
      destroyTour(activeDriver);
    };

    const openInvitationAndContinueTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (continuedTourRef.current) return;
      continuedTourRef.current = true;
      openInvitationFromTour();
      activeDriver.moveNext();
    };

    const openInvitationAndEndTour: DriverHook = (element, step, opts) => {
      openInvitationFromTour();
      endTour(element, step, opts);
    };

    const showFloatingMenu: DriverHook = () => {
      setIsToolsOpen?.(true);
    };

    const steps = createInvitationTourSteps({
      openInvitationAndContinueTour,
      openInvitationAndEndTour,
      showFloatingMenu,
    });

    const tour = driver(createDriverConfig({
      steps,
      openInvitationAndContinueTour,
      openInvitationAndEndTour,
      endTour,
    }));

    driverRef.current = tour;
    tour.drive();
    setIsTourRunning(true);

    return () => {
      const activeTour = driverRef.current;
      driverRef.current = null;
      if (activeTour && activeTour !== tour) destroyTour(activeTour);
      destroyTour(tour);
    };
  }, [destroyTour, onOpenInvitation, setIsToolsOpen, slug]);

  useEffect(() => {
    const tour = driverRef.current;
    if (!isOpen || !tour || requestedOpenRef.current || tour.getActiveIndex() !== 0) return;

    requestedOpenRef.current = true;
    continuedTourRef.current = true;
    setIsToolsOpen?.(false);
    tour.moveNext();
  }, [isOpen, setIsToolsOpen]);

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
