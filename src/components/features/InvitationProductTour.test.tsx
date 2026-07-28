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
import { dispatchFloatingNavigationStart } from '../../utils/floatingNavigationEvents';

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

function addDriverDomState() {
  document.body.classList.add('driver-active');
  const overlay = document.createElement('svg');
  overlay.className = 'driver-overlay';
  document.body.appendChild(overlay);
  const popover = document.createElement('div');
  popover.className = 'driver-popover';
  document.body.appendChild(popover);

  return { overlay, popover };
}

function mockAnimationFrames() {
  let frame = 0;
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    writable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      frame += 1;
      callback(frame);
      return frame;
    }),
  });
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
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.classList.remove('driver-active');
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
        description: 'Silakan ketuk layar, gulir perlahan, atau pilih Buka Undangan untuk membuka undangan.',
        nextBtnText: 'Buka Undangan',
        showButtons: ['next'],
      })
    );
    expect(driverMock.latestOptions?.steps[1]).toEqual(
      expect.objectContaining({
        disableActiveInteraction: true,
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

  it('opens the invitation, keeps the real floating menu closed, then advances from the opening Next button', () => {
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
    expect(setIsToolsOpen).not.toHaveBeenCalledWith(true);
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
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');
    expect(window.localStorage.getItem('invitation-tour:dani-marini')).toBeNull();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).not.toHaveBeenCalledWith(true);
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
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).not.toHaveBeenCalledWith(true);
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
    expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(setIsToolsOpen).not.toHaveBeenCalledWith(true);
    expect(driverMock.driver).toHaveBeenCalledOnce();
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
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
    expect(openingDriver?.moveNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(openingDriver?.moveNext).toHaveBeenCalledOnce();
    expect(openingDriver?.destroy).not.toHaveBeenCalled();
  });

  it('targets the stable floating button while the real menu remains closed during Driver.js', () => {
    addOpeningTarget();
    const { button } = addFloatingControllerTarget();
    renderTour();

    const floatingStep = driverMock.latestOptions?.steps[1];

    expect(floatingStep.element()).toBe(button);
    expect(floatingStep).toEqual(expect.objectContaining({
      disableActiveInteraction: true,
    }));
  });

  it('waits for the floating button instead of depending on expanded menu items', () => {
    addOpeningTarget();
    const panel = document.createElement('div');
    panel.setAttribute('data-tour', 'floating-menu-panel');
    document.body.appendChild(panel);
    renderTour();

    const floatingStep = driverMock.latestOptions?.steps[1];

    expect(floatingStep.element()).toBeUndefined();
    expect(floatingStep).toEqual(expect.objectContaining({ waitForElement: 5000 }));
  });

  it('destroys the tour from the floating step before opening the real tools menu', () => {
    mockAnimationFrames();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    const floatingStep = driverMock.latestOptions?.steps[1];
    const openingDriver = driverMock.latestInstance;
    setIsToolsOpen.mockClear();

    driverMock.latestOptions?.onDoneClick(undefined, floatingStep, hookOptions(openingDriver, driverMock.latestOptions, 1));

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
    expect(openingDriver?.destroy.mock.invocationCallOrder[0]).toBeLessThan(setIsToolsOpen.mock.invocationCallOrder[0]);
  });

  it('waits for Driver.js DOM cleanup before opening the real floating menu', () => {
    vi.useFakeTimers();
    mockAnimationFrames();
    const setIsToolsOpen = vi.fn();
    const { overlay, popover } = addDriverDomState();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    const floatingStep = driverMock.latestOptions?.steps[1];
    const openingDriver = driverMock.latestInstance;
    setIsToolsOpen.mockClear();

    driverMock.latestOptions?.onDoneClick(undefined, floatingStep, hookOptions(openingDriver, driverMock.latestOptions, 1));

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(49);
    });
    expect(setIsToolsOpen).not.toHaveBeenCalled();

    document.body.classList.remove('driver-active');
    overlay.remove();
    popover.remove();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
  });

  it('destroys the tour and opens the real tools menu when the overlay is clicked after the opening step', () => {
    mockAnimationFrames();
    const setIsToolsOpen = vi.fn();
    addOpeningTarget();
    renderTour({ setIsToolsOpen });

    const floatingStep = driverMock.latestOptions?.steps[1];
    const openingDriver = driverMock.latestInstance;
    setIsToolsOpen.mockClear();
    driverMock.latestOptions?.overlayClickBehavior(
      undefined,
      floatingStep,
      hookOptions(openingDriver, driverMock.latestOptions, 1),
    );

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(setIsToolsOpen).toHaveBeenCalledWith(true);
  });

  it('destroys the active Driver.js instance before floating navigation starts', () => {
    addOpeningTarget();
    renderTour({ children: <TourStateProbe /> });
    const openingDriver = driverMock.latestInstance;

    expect(screen.getByTestId('tour-running')).toHaveTextContent('running');

    act(() => {
      dispatchFloatingNavigationStart('twibbon-section');
    });

    expect(openingDriver?.destroy).toHaveBeenCalledOnce();
    expect(screen.getByTestId('tour-running')).toHaveTextContent('idle');
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
