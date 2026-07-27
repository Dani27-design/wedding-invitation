import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';

const driverMock = vi.hoisted(() => {
  const mock = {
    activeIndex: 0,
    driver: vi.fn((options) => {
      const instance = {
        destroy: vi.fn(),
        drive: vi.fn(),
        getActiveIndex: vi.fn(() => mock.activeIndex),
        moveNext: vi.fn(),
      };

      mock.instances.push(instance);
      mock.latestInstance = instance;
      mock.latestOptions = options;
      return instance;
    }),
    instances: [],
    latestInstance: undefined,
    latestOptions: undefined,
  };

  return mock;
});

vi.mock('driver.js', () => ({
  driver: driverMock.driver,
}));

import { InvitationProductTour } from './InvitationProductTour';

const originalMatchMedia = window.matchMedia;

function renderTour(overrides: Partial<Parameters<typeof InvitationProductTour>[0]> = {}) {
  return render(
    <InvitationProductTour
      slug="dani-marini"
      isOpen={false}
      onOpenInvitation={vi.fn()}
      {...overrides}
    />
  );
}

function addOpeningTarget() {
  const opening = document.createElement('div');
  opening.setAttribute('data-tour', 'cinematic-opening');
  document.body.appendChild(opening);
}

function addFloatingMenuButton() {
  const button = document.createElement('button');
  button.setAttribute('data-tour', 'floating-menu-button');
  document.body.appendChild(button);
  return button;
}

function hookOptions(
  instance = driverMock.latestInstance,
  options = driverMock.latestOptions,
) {
  return {
    config: options,
    driver: instance,
    index: driverMock.activeIndex,
    state: {},
  };
}

function startFloatingTourFromOpening() {
  const openingOptions = driverMock.latestOptions;
  const openingDriver = driverMock.latestInstance;

  openingOptions?.onDoneClick(undefined, {}, hookOptions(openingDriver, openingOptions));

  act(() => {
    vi.advanceTimersByTime(650);
  });
}

describe('InvitationProductTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.localStorage.clear();
    document.body.innerHTML = '';
    driverMock.activeIndex = 0;
    driverMock.instances = [];
    driverMock.latestInstance = undefined;
    driverMock.latestOptions = undefined;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('initializes the centered opening Driver.js tour when the opening target exists', () => {
    addOpeningTarget();

    renderTour();

    expect(driverMock.driver).toHaveBeenCalledOnce();
    expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
    expect(driverMock.latestOptions).toEqual(
      expect.objectContaining({
        disableActiveInteraction: true,
        doneBtnText: 'Buka Undangan',
        overlayClickBehavior: expect.any(Function),
        showProgress: false,
        steps: [
          expect.objectContaining({
            popover: expect.objectContaining({
              title: 'Selamat Datang',
              description: 'Silakan ketuk layar, gulir perlahan, atau pilih tombol Buka Undangan untuk masuk ke halaman acara.',
              showButtons: ['close', 'next'],
            }),
          }),
        ],
      })
    );
    expect(driverMock.latestOptions?.steps[0]).not.toHaveProperty('element');
  });

  it('initializes Driver.js even when previous localStorage tour data exists', () => {
    window.localStorage.setItem('invitation-tour:dani-marini', 'completed');
    addOpeningTarget();

    renderTour();

    expect(driverMock.driver).toHaveBeenCalledOnce();
    expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
  });

  it('does not initialize Driver.js without the cinematic opening target', () => {
    renderTour();

    expect(driverMock.driver).not.toHaveBeenCalled();
  });

  it('opens the invitation immediately and starts the floating menu tour after the opening delay', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.onDoneClick(undefined, {}, hookOptions(openingDriver, openingOptions));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(driverMock.driver).toHaveBeenCalledOnce();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(driverMock.driver).toHaveBeenCalledTimes(2);
    expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
    expect(driverMock.latestOptions?.doneBtnText).toBe('Selesai');
    expect(driverMock.latestOptions?.steps).toEqual([
      expect.objectContaining({
        element: '[data-tour="floating-menu-button"]',
        waitForElement: 5000,
        disableActiveInteraction: false,
        advanceOnClick: true,
        popover: expect.objectContaining({
          title: 'Akses Cepat',
          description: 'Gunakan tombol ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman dilihat.',
          side: 'top',
          align: 'end',
        }),
      }),
    ]);
  });

  it('supports the opening Next handler because Driver.js treats a one-step tour as done', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.onNextClick(undefined, {}, hookOptions(openingDriver, openingOptions));
    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('does not open or start the floating tour twice if the opening action repeats', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.onDoneClick(undefined, {}, hookOptions(openingDriver, openingOptions));
    openingOptions?.onDoneClick(undefined, {}, hookOptions(openingDriver, openingOptions));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('opens and destroys the opening tour without continuing when Skip is clicked', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.onCloseClick(undefined, {}, hookOptions(openingDriver, openingOptions));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(window.localStorage.getItem('invitation-tour:dani-marini')).toBeNull();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('opens and continues the tour when the Driver.js overlay is clicked on the opening step', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.overlayClickBehavior(undefined, {}, hookOptions(openingDriver, openingOptions));
    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('starts the floating menu tour when the invitation is opened manually', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    const { rerender } = renderTour({ isOpen: false, onOpenInvitation, setIsToolsOpen });
    const openingDriver = driverMock.latestInstance;

    rerender(
      <InvitationProductTour
        slug="dani-marini"
        isOpen
        onOpenInvitation={onOpenInvitation}
        setIsToolsOpen={setIsToolsOpen}
      />
    );

    expect(onOpenInvitation).not.toHaveBeenCalled();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(driverMock.driver).toHaveBeenCalledOnce();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
    expect(driverMock.latestOptions?.steps[0]).toEqual(
      expect.objectContaining({ element: '[data-tour="floating-menu-button"]' })
    );
  });

  it('closes the floating tools menu when the floating menu step is highlighted', () => {
    vi.useFakeTimers();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    startFloatingTourFromOpening();
    const floatingMenuStep = driverMock.latestOptions?.steps[0];
    floatingMenuStep.onHighlightStarted(undefined, floatingMenuStep, hookOptions());

    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
  });

  it('destroys the floating tour when the highlighted floating button is clicked', () => {
    vi.useFakeTimers();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    const floatingButton = addFloatingMenuButton();
    renderTour({ setIsToolsOpen });

    startFloatingTourFromOpening();
    const floatingMenuStep = driverMock.latestOptions?.steps[0];
    const floatingDriver = driverMock.latestInstance;
    floatingMenuStep.onHighlighted(floatingButton, floatingMenuStep, hookOptions(floatingDriver));
    setIsToolsOpen.mockClear();

    floatingButton.click();

    expect(setIsToolsOpen).not.toHaveBeenCalled();
    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('destroys the floating tour without forcing the tools menu closed when Done or the active button is clicked', () => {
    vi.useFakeTimers();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    startFloatingTourFromOpening();
    const floatingOptions = driverMock.latestOptions;
    const floatingDriver = driverMock.latestInstance;
    setIsToolsOpen.mockClear();

    floatingOptions?.onDoneClick(undefined, {}, hookOptions(floatingDriver, floatingOptions));

    expect(setIsToolsOpen).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('invitation-tour:dani-marini')).toBeNull();
    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('destroys the floating tour when Close is clicked', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    renderTour();

    startFloatingTourFromOpening();
    const floatingOptions = driverMock.latestOptions;
    const floatingDriver = driverMock.latestInstance;

    floatingOptions?.onCloseClick(undefined, {}, hookOptions(floatingDriver, floatingOptions));

    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('clears a delayed floating menu transition on unmount', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    const { unmount } = renderTour();

    const openingOptions = driverMock.latestOptions;
    const openingDriver = driverMock.latestInstance;

    openingOptions?.onDoneClick(undefined, {}, hookOptions(openingDriver, openingOptions));
    unmount();
    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(driverMock.driver).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('destroys the active Driver.js instance on component unmount', () => {
    addOpeningTarget();
    const { unmount } = renderTour();
    const openingDriver = driverMock.latestInstance;

    unmount();

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('disables Driver.js animation for reduced-motion users', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    addOpeningTarget();

    renderTour();

    expect(driverMock.latestOptions?.animate).toBe(false);
  });
});
