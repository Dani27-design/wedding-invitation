import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

const driverMock = vi.hoisted(() => {
  const mock = {
    activeIndex: 0,
    driver: vi.fn((options) => {
      const instance = {
        destroy: vi.fn(),
        drive: vi.fn(),
        getActiveIndex: vi.fn(() => mock.activeIndex),
        isActive: vi.fn(() => false),
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

function addFloatingControllerTarget() {
  const root = document.createElement('div');
  root.className = 'fixed bottom-8 right-5';
  const button = document.createElement('button');
  button.setAttribute('data-tour', 'floating-menu-button');
  root.appendChild(button);
  document.body.appendChild(root);

  return { root, button };
}

function hookOptions(
  instance = driverMock.latestInstance,
  options = driverMock.latestOptions,
  index = driverMock.activeIndex,
) {
  return {
    config: options,
    driver: instance,
    index,
    state: {},
  };
}

describe('InvitationProductTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('initializes an interaction-safe Driver.js tour when the opening target exists', () => {
    addOpeningTarget();

    renderTour();

    expect(driverMock.driver).toHaveBeenCalledOnce();
    expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
    expect(driverMock.latestOptions).toEqual(
      expect.objectContaining({
        allowScroll: true,
        disableActiveInteraction: false,
        doneBtnText: 'Selesai',
        overlayClickBehavior: expect.any(Function),
        showProgress: false,
        smoothScroll: false,
      })
    );
    expect(driverMock.latestOptions?.steps).toHaveLength(2);
    expect(driverMock.latestOptions?.steps[0]).not.toHaveProperty('element');
    expect(driverMock.latestOptions?.steps[0].popover).toEqual(
      expect.objectContaining({
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk masuk ke halaman acara.',
        nextBtnText: 'Buka Undangan',
        showButtons: ['close', 'next'],
      })
    );
    expect(driverMock.latestOptions?.steps[1]).toEqual(
      expect.objectContaining({
        advanceOnClick: true,
        disableActiveInteraction: false,
        element: expect.any(Function),
        waitForElement: 5000,
        popover: expect.objectContaining({
          title: 'Akses Cepat',
          description: 'Gunakan tombol mengambang ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman di layar.',
          side: 'top',
          align: 'end',
          showButtons: ['next'],
          doneBtnText: 'Mengerti',
        }),
      })
    );
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

  it('renders children through the tour provider without adding layout DOM', () => {
    addOpeningTarget();

    renderTour({ children: <div data-testid="invitation-content">Invitation content</div> });

    expect(screen.getByTestId('invitation-content')).toHaveTextContent('Invitation content');
  });

  it('opens the invitation, expands the floating menu, then advances from the opening Next button', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
    expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(849);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('does not open or advance twice if the opening action repeats', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
  });

  it('opens the invitation and destroys the tour when Skip is clicked on the opening step', () => {
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onCloseClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(window.localStorage.getItem('invitation-tour:dani-marini')).toBeNull();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
  });

  it('opens the invitation and advances after the floating menu expands when the opening overlay is clicked', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    driverMock.latestOptions?.overlayClickBehavior(
      undefined,
      openingStep,
      hookOptions(openingDriver, driverMock.latestOptions, 0),
    );

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
  });

  it('advances to the floating menu step when the invitation is opened manually', () => {
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
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
    expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('does not advance to the floating menu step after the tour is destroyed during the expansion delay', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    driverMock.latestOptions?.onCloseClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('opens the floating tools menu when the floating step starts highlighting', () => {
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    const floatingStep = driverMock.latestOptions?.steps[1];
    floatingStep.onHighlightStarted(undefined, floatingStep, hookOptions(driverMock.latestInstance, driverMock.latestOptions, 1));

    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
  });

  it('targets the floating controller container so menu item descendants stay interactive', () => {
    addOpeningTarget();
    const { root } = addFloatingControllerTarget();
    renderTour();

    const floatingStep = driverMock.latestOptions?.steps[1];

    expect(floatingStep.element()).toBe(root);
  });

  it('destroys the tour from the floating step without closing the tools menu', () => {
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    const floatingStep = driverMock.latestOptions?.steps[1];
    const openingDriver = driverMock.latestInstance;
    setIsToolsOpen.mockClear();

    driverMock.latestOptions?.onDoneClick(undefined, floatingStep, hookOptions(openingDriver, driverMock.latestOptions, 1));

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).not.toHaveBeenCalled();
  });

  it('destroys the tour when the overlay is clicked after the opening step', () => {
    addOpeningTarget();
    renderTour();

    const floatingStep = driverMock.latestOptions?.steps[1];
    const openingDriver = driverMock.latestInstance;
    driverMock.latestOptions?.overlayClickBehavior(
      undefined,
      floatingStep,
      hookOptions(openingDriver, driverMock.latestOptions, 1),
    );

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
