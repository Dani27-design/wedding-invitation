'use client';

import { useCallback, useEffect, useRef } from 'react';
import { driver, type Driver } from 'driver.js';

const OPENING_SELECTOR = '[data-tour="cinematic-opening"]';
const FLOATING_MENU_SELECTOR = '[data-tour="floating-menu-button"]';
const FLOATING_MENU_TOUR_DELAY_MS = 650;

interface InvitationProductTourProps {
  slug: string;
  isOpen: boolean;
  onOpenInvitation: () => void;
  setIsToolsOpen?: (open: boolean) => void;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function InvitationProductTour({ slug, isOpen, onOpenInvitation, setIsToolsOpen }: InvitationProductTourProps) {
  const driverRef = useRef<Driver | null>(null);
  const isOpenRef = useRef(isOpen);
  const requestedOpenRef = useRef(false);
  const floatingTourStartedRef = useRef(false);
  const floatingStepTimerRef = useRef<number | null>(null);
  const startFloatingMenuTourRef = useRef<(() => void) | null>(null);
  const floatingButtonClickCleanupRef = useRef<(() => void) | null>(null);
  const destroyedToursRef = useRef<WeakSet<Driver>>(new WeakSet());

  const destroyTour = useCallback((tour: Driver) => {
    if (destroyedToursRef.current.has(tour)) return;
    destroyedToursRef.current.add(tour);
    tour.destroy();
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!slug || isOpenRef.current) return undefined;
    if (!document.querySelector(OPENING_SELECTOR)) return undefined;

    requestedOpenRef.current = false;
    floatingTourStartedRef.current = false;
    destroyedToursRef.current = new WeakSet();

    const clearFloatingStepTimer = () => {
      if (floatingStepTimerRef.current !== null) {
        window.clearTimeout(floatingStepTimerRef.current);
        floatingStepTimerRef.current = null;
      }
    };

    const clearFloatingButtonClickHandler = () => {
      floatingButtonClickCleanupRef.current?.();
      floatingButtonClickCleanupRef.current = null;
    };

    const openInvitationFromTour = () => {
      if (requestedOpenRef.current) return;
      requestedOpenRef.current = true;
      setIsToolsOpen?.(false);
      onOpenInvitation();
    };

    const completeTour = (tour: Driver, options: { closeToolsMenu?: boolean } = {}) => {
      const { closeToolsMenu = true } = options;
      clearFloatingStepTimer();
      clearFloatingButtonClickHandler();
      if (closeToolsMenu) {
        setIsToolsOpen?.(false);
      }
      if (driverRef.current === tour) {
        driverRef.current = null;
      }
      destroyTour(tour);
    };

    const startFloatingMenuTour = () => {
      if (floatingTourStartedRef.current) return;
      floatingTourStartedRef.current = true;
      clearFloatingStepTimer();
      setIsToolsOpen?.(false);

      const floatingTour = driver({
        animate: !prefersReducedMotion(),
        overlayColor: '#1A1A1A',
        overlayOpacity: 0.72,
        smoothScroll: true,
        allowClose: true,
        allowScroll: false,
        disableActiveInteraction: true,
        stagePadding: 10,
        stageRadius: 18,
        popoverOffset: 16,
        popoverClass: 'wedding-driver-popover',
        showButtons: ['next', 'close'],
        showProgress: false,
        doneBtnText: 'Selesai',
        steps: [
          {
            element: FLOATING_MENU_SELECTOR,
            waitForElement: 5000,
            disableActiveInteraction: false,
            advanceOnClick: true,
            onHighlightStarted: () => {
              setIsToolsOpen?.(false);
            },
            onHighlighted: (element, _step, { driver: activeDriver }) => {
              if (!element) return;

              clearFloatingButtonClickHandler();
              const handleFloatingButtonClick = () => {
                completeTour(activeDriver, { closeToolsMenu: false });
              };

              element.addEventListener('click', handleFloatingButtonClick, { once: true });
              floatingButtonClickCleanupRef.current = () => {
                element.removeEventListener('click', handleFloatingButtonClick);
              };
            },
            popover: {
              title: 'Akses Cepat',
              description: 'Gunakan tombol ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman dilihat.',
              side: 'top',
              align: 'end',
              showButtons: ['close', 'next'],
            },
          },
        ],
        onCloseClick: (_element, _step, { driver: activeDriver }) => {
          completeTour(activeDriver);
        },
        onDoneClick: (_element, _step, { driver: activeDriver }) => {
          completeTour(activeDriver, { closeToolsMenu: false });
        },
      });

      driverRef.current = floatingTour;
      floatingTour.drive();
    };

    const scheduleFloatingMenuTour = () => {
      clearFloatingStepTimer();
      setIsToolsOpen?.(false);
      floatingStepTimerRef.current = window.setTimeout(() => {
        floatingStepTimerRef.current = null;
        startFloatingMenuTour();
      }, FLOATING_MENU_TOUR_DELAY_MS);
    };

    const openInvitationAndContinueTour = (tour: Driver) => {
      openInvitationFromTour();
      completeTour(tour);
      scheduleFloatingMenuTour();
    };

    startFloatingMenuTourRef.current = startFloatingMenuTour;

    const tour = driver({
      animate: !prefersReducedMotion(),
      overlayColor: '#1A1A1A',
      overlayOpacity: 0.72,
      smoothScroll: true,
      allowClose: true,
      allowScroll: false,
      overlayClickBehavior: (_element, _step, { driver: activeDriver }) => {
        openInvitationAndContinueTour(activeDriver);
      },
      disableActiveInteraction: true,
      stagePadding: 10,
      stageRadius: 18,
      popoverOffset: 16,
      popoverClass: 'wedding-driver-popover',
      showButtons: ['next', 'close'],
      showProgress: false,
      doneBtnText: 'Buka Undangan',
      steps: [
        {
          popover: {
            title: 'Selamat Datang',
            description: 'Silakan ketuk layar, gulir perlahan, atau pilih tombol Buka Undangan untuk masuk ke halaman acara.',
            showButtons: ['close', 'next'],
          },
        },
      ],
      onNextClick: (_element, _step, { driver: activeDriver }) => {
        openInvitationAndContinueTour(activeDriver);
      },
      onCloseClick: (_element, _step, { driver: activeDriver }) => {
        openInvitationFromTour();
        completeTour(activeDriver);
      },
      onDoneClick: (_element, _step, { driver: activeDriver }) => {
        openInvitationAndContinueTour(activeDriver);
      },
    });

    driverRef.current = tour;
    tour.drive();

    return () => {
      clearFloatingStepTimer();
      clearFloatingButtonClickHandler();
      startFloatingMenuTourRef.current = null;
      const activeTour = driverRef.current;
      driverRef.current = null;
      if (activeTour && activeTour !== tour) {
        destroyTour(activeTour);
      }
      destroyTour(tour);
    };
  }, [destroyTour, onOpenInvitation, setIsToolsOpen, slug]);

  useEffect(() => {
    const tour = driverRef.current;
    if (!isOpen || !tour || requestedOpenRef.current || tour.getActiveIndex() !== 0) return;
    requestedOpenRef.current = true;
    setIsToolsOpen?.(false);
    if (floatingStepTimerRef.current !== null) {
      window.clearTimeout(floatingStepTimerRef.current);
    }
    floatingStepTimerRef.current = window.setTimeout(() => {
      floatingStepTimerRef.current = null;
      destroyTour(tour);
      if (driverRef.current === tour) {
        driverRef.current = null;
      }
      startFloatingMenuTourRef.current?.();
    }, FLOATING_MENU_TOUR_DELAY_MS);
  }, [destroyTour, isOpen, setIsToolsOpen]);

  return null;
}
