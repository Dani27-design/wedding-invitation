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

function addDriverArtifacts() {
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

  return { highlightedParent, highlightedElement };
}

function expectDriverArtifactsRemoved(highlightedParent: HTMLElement, highlightedElement: HTMLElement) {
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

  it('initializes only the cinematic opening Driver.js tour when the opening target exists', () => {
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
      }),
    );
    expect(driverMock.latestOptions?.steps).toHaveLength(1);
    expect(driverMock.latestOptions?.steps[0]).not.toHaveProperty('element');
    expect(driverMock.latestOptions?.steps[0].popover).toEqual(
      expect.objectContaining({
        title: 'Selamat Datang',
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        nextBtnText: 'Buka Undangan',
        showButtons: ['next'],
      }),
    );
  });

  it('does not create a floating button tour after the opening tour is completed', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation, setIsToolsOpen });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(driverMock.driver).toHaveBeenCalledOnce();
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

  it('does not open or destroy twice if the opening action repeats', () => {
    vi.useFakeTimers();
    const onOpenInvitation = vi.fn();
    addOpeningTarget();
    renderTour({ onOpenInvitation });

    const openingStep = driverMock.latestOptions?.steps[0];
    const openingDriver = driverMock.latestInstance;
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    openingStep.popover.onNextClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('opens the invitation and fully removes Driver.js artifacts when the opening popover is closed', () => {
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
    const { highlightedParent, highlightedElement } = addDriverArtifacts();

    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');
    act(() => {
      openingStep.popover.onCloseClick(undefined, openingStep, hookOptions(openingDriver, driverMock.latestOptions, 0));
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();
    expectDriverArtifactsRemoved(highlightedParent, highlightedElement);
  });

  it('opens the invitation and destroys the opening tour when the opening overlay is clicked', () => {
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

    act(() => {
      driverMock.latestOptions?.overlayClickBehavior(
        undefined,
        openingStep,
        hookOptions(openingDriver, driverMock.latestOptions, 0),
      );
    });

    expect(onOpenInvitation).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('destroys the opening tour without starting a floating tour when the invitation is opened manually', () => {
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
      />,
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onOpenInvitation).not.toHaveBeenCalled();
    expect(setIsToolsOpen).not.toHaveBeenCalled();
    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();
    expect(driverMock.driver).toHaveBeenCalledOnce();
  });

  it('destroys the active Driver.js instance before floating navigation starts', () => {
    addOpeningTarget();
    renderTour({ children: <TourStateProbe /> });
    const openingDriver = driverMock.latestInstance;
    const { highlightedParent, highlightedElement } = addDriverArtifacts();

    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      dispatchFloatingNavigationStart('twibbon-section');
    });

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
    expectDriverArtifactsRemoved(highlightedParent, highlightedElement);
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
