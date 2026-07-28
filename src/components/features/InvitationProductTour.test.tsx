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

import { InvitationProductTour, useOptionalTour } from './InvitationProductTour';
import {
  dispatchFloatingNavigationStart,
  resetFloatingNavigationStateForTests,
} from '../../utils/floatingNavigationEvents';

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
  const panel = document.createElement('div');
  panel.setAttribute('data-tour', 'floating-menu-panel');
  const button = document.createElement('button');
  button.setAttribute('data-tour', 'floating-menu-button');
  panel.appendChild(document.createElement('button'));
  panel.appendChild(document.createElement('button'));
  panel.appendChild(document.createElement('button'));
  panel.appendChild(document.createElement('button'));
  root.appendChild(panel);
  root.appendChild(button);
  document.body.appendChild(root);

  return { root, panel, button };
}

function TourStateProbe() {
  const tour = useOptionalTour();
  return <span data-testid="tour-running">{tour?.isTourRunning ? 'running' : 'idle'}</span>;
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

function queueFloatingTourFromOpening() {
  const openingOptions = driverMock.latestOptions;
  const openingDriver = driverMock.latestInstance;
  const openingStep = openingOptions?.steps[0];

  openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, openingOptions, 0));

  act(() => {
    vi.advanceTimersByTime(850);
  });

  return {
    openingDriver,
    floatingDriver: driverMock.latestInstance,
    floatingOptions: driverMock.latestOptions,
    floatingStep: driverMock.latestOptions?.steps[0],
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
    resetFloatingNavigationStateForTests();
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
    expect(driverMock.latestOptions?.steps).toHaveLength(1);
    expect(driverMock.latestOptions?.steps[0]).not.toHaveProperty('element');
    expect(driverMock.latestOptions?.steps[0].popover).toEqual(
      expect.objectContaining({
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        nextBtnText: 'Buka Undangan',
        showButtons: ['next'],
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

  it('opens the invitation, destroys the opening tour, then starts a separate floating menu tour', () => {
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
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(849);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
    expect(driverMock.latestInstance).not.toBe(openingDriver);
    expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
    expect(driverMock.latestOptions?.steps).toHaveLength(1);
    expect(driverMock.latestOptions?.steps[0]).toEqual(
      expect.objectContaining({
        advanceOnClick: true,
        disableActiveInteraction: false,
        element: expect.any(Function),
        waitForElement: 5000,
        popover: expect.objectContaining({
          title: 'Akses Cepat',
          description: 'Gunakan tombol mengambang ini untuk membuka navigasi acara, ucapan, twibbon, tanda kasih, dan kontrol musik. Tombol dapat digeser agar tetap nyaman di layar.',
          side: 'left',
          align: 'center',
          popoverClass: 'wedding-driver-popover wedding-driver-popover--floating-menu',
          showButtons: ['next'],
          doneBtnText: 'Mengerti',
        }),
      })
    );
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
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('opens the invitation and continues the tour when the opening popover is closed', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({
      onOpenInvitation,
      setIsToolsOpen,
      children: <TourStateProbe />,
    });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      openingStep.popover.onCloseClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');
    expect(window.localStorage.getItem('invitation-tour:dani-marini')).toBeNull();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('opens the invitation and continues the tour when the opening overlay is clicked', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({
      onOpenInvitation,
      setIsToolsOpen,
      children: <TourStateProbe />,
    });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      driverMock.latestOptions?.overlayClickBehavior(
        undefined,
        openingStep,
        hookOptions(openingDriver, driverMock.latestOptions, 0),
      );
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('starts the separate floating menu tour when the invitation is opened manually', () => {
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
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
    expect(driverMock.latestInstance).not.toBe(openingDriver);
  });

  it('does not duplicate the opening action when the opening popover closes during the expansion delay', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    driverMock.latestOptions?.onCloseClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
  });

  it('opens the floating tools menu when the floating step starts highlighting', () => {
    vi.useFakeTimers();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    addFloatingControllerTarget();
    renderTour({ setIsToolsOpen });

    const { floatingStep, floatingDriver, floatingOptions } = queueFloatingTourFromOpening();
    setIsToolsOpen.mockClear();
    floatingStep.onHighlightStarted(undefined, floatingStep, hookOptions(floatingDriver, floatingOptions, 0));

    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
  });

  it('targets the rendered floating menu panel so expanded menu items stay interactive', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    const { panel } = addFloatingControllerTarget();
    renderTour();

    const { floatingStep } = queueFloatingTourFromOpening();

    expect(floatingStep.element()).toBe(panel);
  });

  it('waits for the floating menu panel instead of falling back to the always-mounted button', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    const button = document.createElement('button');
    button.setAttribute('data-tour', 'floating-menu-button');
    document.body.appendChild(button);
    renderTour();

    const { floatingStep } = queueFloatingTourFromOpening();

    expect(floatingStep.element()).toBeUndefined();
    expect(floatingStep).toEqual(expect.objectContaining({ waitForElement: 5000 }));
  });

  it('destroys the tour from the floating step without closing the tools menu', () => {
    vi.useFakeTimers();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    addFloatingControllerTarget();
    renderTour({ setIsToolsOpen });

    const { floatingStep, floatingDriver, floatingOptions } = queueFloatingTourFromOpening();
    setIsToolsOpen.mockClear();

    floatingOptions?.onDoneClick(undefined, floatingStep, hookOptions(floatingDriver, floatingOptions, 0));

    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).not.toHaveBeenCalled();
  });

  it('destroys the tour when the overlay is clicked after the opening step', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    addFloatingControllerTarget();
    renderTour();

    const { floatingStep, floatingDriver, floatingOptions } = queueFloatingTourFromOpening();
    floatingOptions?.overlayClickBehavior(
      undefined,
      floatingStep,
      hookOptions(floatingDriver, floatingOptions, 0),
    );

    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
  });

  it('does not start the floating tour if floating navigation begins during the menu expansion delay', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    renderTour({ children: <TourStateProbe /> });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      dispatchFloatingNavigationStart('twibbon-section');
      vi.advanceTimersByTime(850);
    });

    expect(driverMock.driver).toHaveBeenCalledOnce();
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
  });

  it('destroys the separate floating tour before floating navigation starts', () => {
    vi.useFakeTimers();
    addOpeningTarget();
    addFloatingControllerTarget();
    renderTour({ children: <TourStateProbe /> });

    const { floatingDriver } = queueFloatingTourFromOpening();
    expect(driverMock.driver).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      dispatchFloatingNavigationStart('event-section');
    });

    expect(floatingDriver?.destroy).toHaveBeenCalledOnce();
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
  });

  it('destroys the active Driver.js instance before floating navigation starts', () => {
    addOpeningTarget();
    renderTour({ children: <TourStateProbe /> });
    const openingDriver = driverMock.latestInstance;
    const highlightedParent = document.createElement('div');
    const highlightedElement = document.createElement('button');
    const overlay = document.createElement('svg');
    const popover = document.createElement('div');
    const dummyElement = document.createElement('div');

    document.body.classList.add('driver-active', 'driver-fade', 'driver-simple', 'driver-no-scroll');
    document.body.style.setProperty('--driver-animation-duration', '400ms');
    highlightedParent.className = 'driver-active-element-parent driver-active-element-parent-no-scroll';
    highlightedElement.className = 'driver-active-element driver-no-interaction';
    highlightedElement.setAttribute('aria-haspopup', 'dialog');
    highlightedElement.setAttribute('aria-expanded', 'true');
    highlightedElement.setAttribute('aria-controls', 'driver-popover-content');
    overlay.classList.add('driver-overlay');
    popover.classList.add('driver-popover');
    dummyElement.id = 'driver-dummy-element';
    highlightedParent.appendChild(highlightedElement);
    document.body.append(highlightedParent, overlay, popover, dummyElement);

    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      dispatchFloatingNavigationStart('twibbon-section');
    });

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
    expect(document.body.classList.contains('driver-active')).toBe(false);
    expect(document.body.classList.contains('driver-no-scroll')).toBe(false);
    expect(document.body.style.getPropertyValue('--driver-animation-duration')).toBe('');
    expect(document.querySelector('.driver-overlay')).toBeNull();
    expect(document.querySelector('.driver-popover')).toBeNull();
    expect(document.querySelector('#driver-dummy-element')).toBeNull();
    expect(highlightedParent.className).toBe('');
    expect(highlightedElement.className).toBe('');
    expect(highlightedElement).not.toHaveAttribute('aria-haspopup');
    expect(highlightedElement).not.toHaveAttribute('aria-expanded');
    expect(highlightedElement).not.toHaveAttribute('aria-controls');
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
