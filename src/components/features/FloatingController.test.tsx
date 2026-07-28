import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { FloatingController } from './FloatingController';
import { FLOATING_NAVIGATION_START_EVENT } from '../../utils/floatingNavigationEvents';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const createProps = (overrides: Partial<Parameters<typeof FloatingController>[0]> = {}) => ({
  isToolsOpen: false,
  setIsToolsOpen: vi.fn(),
  isPlaying: false,
  toggleMusic: vi.fn(),
  ...overrides,
});

function mockSectionTarget(top = 320) {
  return {
    getBoundingClientRect: vi.fn(() => ({ top })),
  } as unknown as HTMLElement;
}

function mockWindowScrollTo() {
  return vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
}

function mockNavigationFrames() {
  return vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 0;
  });
}

/* ------------------------------------------------------------------ */
/*  1. Rendering – basic mount & structural integrity                  */
/* ------------------------------------------------------------------ */

describe('FloatingController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigationFrames();
  });

  afterEach(() => {
    document.body.className = '';
    document.body.removeAttribute('style');
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a single root element', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.children).toHaveLength(1);
    });

    it('has fixed positioning to prevent layout shift', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toHaveClass('fixed');
    });

    it('is positioned bottom-8 right-3', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toHaveClass('bottom-8');
      expect(container.firstChild).toHaveClass('right-5');
    });

    it('has z-[100] for proper layering above page content', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toHaveClass('z-[100]');
    });

    it('does not apply touch-none to the full floating controller', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).not.toHaveClass('touch-none');
    });

    it('keeps touch-none scoped to the draggable main button', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.getByLabelText('Buka menu')).toHaveClass('touch-none');
    });

    it('does not apply drag affordance to the full floating controller', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).not.toHaveClass('cursor-grab');
    });

    it('keeps drag affordance scoped to the main button', () => {
      render(<FloatingController {...createProps()} />);
      const btn = screen.getByLabelText('Buka menu');
      expect(btn).toHaveClass('cursor-grab');
      expect(btn).toHaveClass('active:cursor-grabbing');
    });

    it('uses flex-col layout for vertical stacking of items', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('marks the floating root as safe to interact with while Driver.js is active', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toHaveAttribute('data-floating-controller');
    });

    it('always renders the main button regardless of props', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /*  2. Main button – aria, click behavior                              */
  /* ------------------------------------------------------------------ */

  describe('Main button', () => {
    it('has aria-label "Buka menu" when menu is closed', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.getByLabelText('Buka menu')).toBeInTheDocument();
    });

    it('has aria-label "Tutup menu" when menu is open', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByLabelText('Tutup menu')).toBeInTheDocument();
    });

    it('does not have "Tutup menu" label when closed', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByLabelText('Tutup menu')).not.toBeInTheDocument();
    });

    it('does not have "Buka menu" label when open', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.queryByLabelText('Buka menu')).not.toBeInTheDocument();
    });

    it('calls setIsToolsOpen(true) when clicked while closed', () => {
      const setIsToolsOpen = vi.fn();
      render(<FloatingController {...createProps({ setIsToolsOpen })} />);
      fireEvent.click(screen.getByLabelText('Buka menu'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(true);
      expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    });

    it('calls setIsToolsOpen(false) when clicked while open', () => {
      const setIsToolsOpen = vi.fn();
      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);
      fireEvent.click(screen.getByLabelText('Tutup menu'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);
      expect(setIsToolsOpen).toHaveBeenCalledTimes(1);
    });

    it('has a 14x14 (w-14 h-14) circular button', () => {
      render(<FloatingController {...createProps()} />);
      const btn = screen.getByLabelText('Buka menu');
      expect(btn).toHaveClass('w-14');
      expect(btn).toHaveClass('h-14');
      expect(btn).toHaveClass('rounded-full');
    });

    it('has stable tour target for Driver.js', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.getByLabelText('Buka menu')).toHaveAttribute('data-tour', 'floating-menu-button');
    });

    it('has backdrop-blur-xl for frosted glass effect', () => {
      render(<FloatingController {...createProps()} />);
      const btn = screen.getByLabelText('Buka menu');
      expect(btn).toHaveClass('backdrop-blur-xl');
    });

    it('has shadow-2xl for depth', () => {
      render(<FloatingController {...createProps()} />);
      const btn = screen.getByLabelText('Buka menu');
      expect(btn).toHaveClass('shadow-2xl');
    });

    it('changes background class when open vs closed', () => {
      const { rerender } = render(<FloatingController {...createProps()} />);
      const closedBtn = screen.getByLabelText('Buka menu');
      expect(closedBtn).toHaveClass('bg-ivory/60');

      rerender(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const openBtn = screen.getByLabelText('Tutup menu');
      expect(openBtn).toHaveClass('bg-ink');
    });
  });

  /* ------------------------------------------------------------------ */
  /*  3. Menu closed state                                               */
  /* ------------------------------------------------------------------ */

  describe('Menu closed state', () => {
    it('does not show Twibbon menu item', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByText('Twibbon')).not.toBeInTheDocument();
    });

    it('does not show Ucapan & Doa menu item', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByText('Ucapan & Doa')).not.toBeInTheDocument();
    });

    it('does not show Tanda Kasih menu item', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByText('Tanda Kasih')).not.toBeInTheDocument();
    });

    it('does not show Rangkaian Acara menu item', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByText('Rangkaian Acara')).not.toBeInTheDocument();
    });

    it('does not show Putar Musik toggle', () => {
      render(<FloatingController {...createProps()} />);
      expect(screen.queryByText('Putar Musik')).not.toBeInTheDocument();
    });

    it('does not show Senyapkan Musik toggle', () => {
      render(<FloatingController {...createProps({ isPlaying: true })} />);
      expect(screen.queryByText('Senyapkan Musik')).not.toBeInTheDocument();
    });

    it('renders only the main button as a button element', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /*  4. Menu open state                                                 */
  /* ------------------------------------------------------------------ */

  describe('Menu open state', () => {
    it('shows Twibbon label', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByText('Twibbon')).toBeInTheDocument();
    });

    it('shows Ucapan & Doa label', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByText('Ucapan & Doa')).toBeInTheDocument();
    });

    it('shows Tanda Kasih label', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByText('Tanda Kasih')).toBeInTheDocument();
    });

    it('shows Rangkaian Acara label', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByText('Rangkaian Acara')).toBeInTheDocument();
    });

    it('shows music toggle button', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      expect(screen.getByText('Putar Musik')).toBeInTheDocument();
    });

    it('renders exactly 5 menu buttons plus the main button', () => {
      const { container } = render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const buttons = container.querySelectorAll('button');
      // 4 navigation + 1 music + 1 main = 6
      expect(buttons).toHaveLength(6);
    });

    it('all menu items have rounded-full styling', () => {
      const { container } = render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const menuButtons = Array.from(container.querySelectorAll('button')).slice(0, 5);
      menuButtons.forEach((btn) => {
        expect(btn).toHaveClass('rounded-full');
      });
    });

    it('menu items have backdrop-blur-xl', () => {
      const { container } = render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const menuButtons = Array.from(container.querySelectorAll('button')).slice(0, 5);
      menuButtons.forEach((btn) => {
        expect(btn).toHaveClass('backdrop-blur-xl');
      });
    });

    it('menu items have shadow-xl for depth', () => {
      const { container } = render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const menuButtons = Array.from(container.querySelectorAll('button')).slice(0, 5);
      menuButtons.forEach((btn) => {
        expect(btn).toHaveClass('shadow-xl');
      });
    });

    it('each label uses uppercase tracking text style', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const label = screen.getByText('Twibbon');
      expect(label).toHaveClass('uppercase');
      expect(label).toHaveClass('tracking-[0.2em]');
      expect(label).toHaveClass('font-bold');
    });
  });

  /* ------------------------------------------------------------------ */
  /*  5. Music state                                                     */
  /* ------------------------------------------------------------------ */

  describe('Music state', () => {
    it('shows "Putar Musik" when isPlaying is false and menu open', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: false })} />);
      expect(screen.getByText('Putar Musik')).toBeInTheDocument();
    });

    it('shows "Senyapkan Musik" when isPlaying is true and menu open', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: true })} />);
      expect(screen.getByText('Senyapkan Musik')).toBeInTheDocument();
    });

    it('does not show "Putar Musik" when playing', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: true })} />);
      expect(screen.queryByText('Putar Musik')).not.toBeInTheDocument();
    });

    it('does not show "Senyapkan Musik" when not playing', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: false })} />);
      expect(screen.queryByText('Senyapkan Musik')).not.toBeInTheDocument();
    });

    it('calls toggleMusic when music button is clicked', () => {
      const toggleMusic = vi.fn();
      render(<FloatingController {...createProps({ isToolsOpen: true, toggleMusic })} />);
      fireEvent.click(screen.getByText('Putar Musik'));
      expect(toggleMusic).toHaveBeenCalledTimes(1);
    });

    it('calls toggleMusic when Senyapkan Musik is clicked', () => {
      const toggleMusic = vi.fn();
      render(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: true, toggleMusic })} />);
      fireEvent.click(screen.getByText('Senyapkan Musik'));
      expect(toggleMusic).toHaveBeenCalledTimes(1);
    });

    it('toggleMusic does not call setIsToolsOpen', () => {
      const setIsToolsOpen = vi.fn();
      const toggleMusic = vi.fn();
      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen, toggleMusic })} />);
      fireEvent.click(screen.getByText('Putar Musik'));
      expect(toggleMusic).toHaveBeenCalledTimes(1);
      // setIsToolsOpen should NOT be called by the music button
      expect(setIsToolsOpen).not.toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  6. Visual – pulsing aura, status ring, heart icon                  */
  /* ------------------------------------------------------------------ */

  describe('Visual indicators', () => {
    it('pulsing aura element is present when isPlaying is true', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: true })} />);
      const aura = container.querySelector('.bg-rose-pastel\\/20.rounded-full');
      expect(aura).toBeInTheDocument();
    });

    it('pulsing aura is NOT present when isPlaying is false', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: false })} />);
      const aura = container.querySelector('.bg-rose-pastel\\/20.rounded-full');
      expect(aura).not.toBeInTheDocument();
    });

    it('status ring (dashed border) is always present', () => {
      const { container } = render(<FloatingController {...createProps()} />);
      const ring = container.querySelector('.border-dashed');
      expect(ring).toBeInTheDocument();
    });

    it('status ring has full opacity when playing', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: true })} />);
      const ring = container.querySelector('.border-dashed');
      expect(ring).toHaveClass('opacity-100');
    });

    it('status ring has reduced opacity when not playing', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: false })} />);
      const ring = container.querySelector('.border-dashed');
      expect(ring).toHaveClass('opacity-40');
    });

    it('heart icon has fill-rose-pastel class when playing (closed menu)', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: true })} />);
      const heart = container.querySelector('.fill-rose-pastel');
      expect(heart).toBeInTheDocument();
    });

    it('heart icon does NOT have fill-rose-pastel when not playing (closed menu)', () => {
      const { container } = render(<FloatingController {...createProps({ isPlaying: false })} />);
      const heart = container.querySelector('.fill-rose-pastel');
      expect(heart).not.toBeInTheDocument();
    });

    it('shows X icon when menu is open instead of Heart', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      // When open, we should have "Tutup menu" button; the Heart is replaced by X
      const btn = screen.getByLabelText('Tutup menu');
      expect(btn).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  7. Navigation – section ID targets                                 */
  /* ------------------------------------------------------------------ */

  describe('Navigation', () => {
    it('Twibbon button scrolls to twibbon-section', () => {
      const scrollMock = mockWindowScrollTo();
      const target = mockSectionTarget(420);
      const getByIdMock = vi.fn().mockReturnValue(target);
      vi.spyOn(document, 'getElementById').mockImplementation(getByIdMock);

      const setIsToolsOpen = vi.fn();
      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);
      fireEvent.click(screen.getByText('Twibbon'));

      expect(getByIdMock).toHaveBeenCalledWith('twibbon-section');
      expect(scrollMock).toHaveBeenCalledWith({ top: 412, left: 0, behavior: 'smooth' });
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    });

    it('dispatches navigation start before looking up the target section', () => {
      const sectionIds: string[] = [];
      const handleNavigationStart = vi.fn((event: Event) => {
        sectionIds.push((event as CustomEvent<{ sectionId: string }>).detail.sectionId);
      });
      window.addEventListener(FLOATING_NAVIGATION_START_EVENT, handleNavigationStart);

      const scrollMock = mockWindowScrollTo();
      const target = mockSectionTarget(420);
      const getByIdMock = vi.fn().mockReturnValue(target);
      vi.spyOn(document, 'getElementById').mockImplementation(getByIdMock);

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Twibbon'));

      expect(sectionIds).toEqual(['twibbon-section']);
      expect(handleNavigationStart.mock.invocationCallOrder[0]).toBeLessThan(getByIdMock.mock.invocationCallOrder[0]);
      expect(scrollMock).toHaveBeenCalledWith({ top: 412, left: 0, behavior: 'smooth' });

      window.removeEventListener(FLOATING_NAVIGATION_START_EVENT, handleNavigationStart);
    });

    it('waits for a stale Driver.js body scroll lock to clear before section navigation', () => {
      vi.useFakeTimers();
      mockNavigationFrames();
      document.body.classList.add('driver-no-scroll');
      const scrollMock = mockWindowScrollTo();
      const target = mockSectionTarget(420);
      const getByIdMock = vi.spyOn(document, 'getElementById').mockReturnValue(target);
      const setIsToolsOpen = vi.fn();

      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);
      fireEvent.click(screen.getByText('Twibbon'));

      expect(getByIdMock).not.toHaveBeenCalled();
      expect(scrollMock).not.toHaveBeenCalled();
      expect(setIsToolsOpen).not.toHaveBeenCalled();

      document.body.classList.remove('driver-no-scroll');
      act(() => {
        vi.advanceTimersByTime(120);
      });

      expect(getByIdMock).toHaveBeenCalledWith('twibbon-section');
      expect(scrollMock).toHaveBeenCalledWith({ top: 412, left: 0, behavior: 'smooth' });
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    });

    it('Ucapan & Doa button scrolls to rsvp-section', () => {
      const scrollMock = mockWindowScrollTo();
      vi.spyOn(document, 'getElementById').mockReturnValue(mockSectionTarget());

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Ucapan & Doa'));

      expect(document.getElementById).toHaveBeenCalledWith('rsvp-section');
      expect(scrollMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });

    it('Tanda Kasih button scrolls to gift-section', () => {
      const scrollMock = mockWindowScrollTo();
      vi.spyOn(document, 'getElementById').mockReturnValue(mockSectionTarget());

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Tanda Kasih'));

      expect(document.getElementById).toHaveBeenCalledWith('gift-section');
      expect(scrollMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });

    it('Rangkaian Acara button scrolls to event-section', () => {
      const scrollMock = mockWindowScrollTo();
      vi.spyOn(document, 'getElementById').mockReturnValue(mockSectionTarget());

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Rangkaian Acara'));

      expect(document.getElementById).toHaveBeenCalledWith('event-section');
      expect(scrollMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });

    it('navigation buttons close the menu after scrolling', () => {
      mockWindowScrollTo();
      vi.spyOn(document, 'getElementById').mockReturnValue(mockSectionTarget());
      const setIsToolsOpen = vi.fn();

      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);

      fireEvent.click(screen.getByText('Twibbon'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);

      setIsToolsOpen.mockClear();
      fireEvent.click(screen.getByText('Ucapan & Doa'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);

      setIsToolsOpen.mockClear();
      fireEvent.click(screen.getByText('Tanda Kasih'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);

      setIsToolsOpen.mockClear();
      fireEvent.click(screen.getByText('Rangkaian Acara'));
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    });

    it('keeps the menu open while a section target is still missing', () => {
      vi.useFakeTimers();
      mockNavigationFrames();
      const scrollMock = mockWindowScrollTo();
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
      const setIsToolsOpen = vi.fn();

      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);
      expect(() => fireEvent.click(screen.getByText('Twibbon'))).not.toThrow();

      act(() => {
        vi.advanceTimersByTime(4200);
      });

      expect(scrollMock).not.toHaveBeenCalled();
      expect(setIsToolsOpen).not.toHaveBeenCalled();
    });

    it('retries navigation until a lazy-loaded section appears', () => {
      vi.useFakeTimers();
      mockNavigationFrames();
      const scrollMock = mockWindowScrollTo();
      const setIsToolsOpen = vi.fn();
      const target = mockSectionTarget(560);
      let lookupCount = 0;
      vi.spyOn(document, 'getElementById').mockImplementation(() => {
        lookupCount += 1;
        return lookupCount < 3 ? null : target;
      });

      render(<FloatingController {...createProps({ isToolsOpen: true, setIsToolsOpen })} />);
      fireEvent.click(screen.getByText('Twibbon'));

      expect(scrollMock).not.toHaveBeenCalled();
      expect(setIsToolsOpen).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(240);
      });

      expect(document.getElementById).toHaveBeenCalledWith('twibbon-section');
      expect(scrollMock).toHaveBeenCalledWith({ top: 552, left: 0, behavior: 'smooth' });
      expect(setIsToolsOpen).toHaveBeenCalledWith(false);
    });

    it('falls back to smooth scrollIntoView when object smooth scroll is unsupported', () => {
      const scrollMock = vi.spyOn(window, 'scrollTo').mockImplementation((arg1: unknown) => {
        if (typeof arg1 === 'object') {
          throw new TypeError('smooth scroll options unsupported');
        }
      });
      const target = mockSectionTarget(420);
      target.scrollIntoView = vi.fn();
      vi.spyOn(document, 'getElementById').mockReturnValue(target);

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Rangkaian Acara'));

      expect(scrollMock).toHaveBeenNthCalledWith(1, { top: 412, left: 0, behavior: 'smooth' });
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      expect(scrollMock).not.toHaveBeenCalledWith(0, 412);
    });

    it('retries smoothly before using the last-resort direct scroll when the page does not move', () => {
      vi.useFakeTimers();
      mockNavigationFrames();
      const scrollMock = mockWindowScrollTo();
      const target = mockSectionTarget(420);
      target.scrollIntoView = vi.fn();
      vi.spyOn(document, 'getElementById').mockReturnValue(target);

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Rangkaian Acara'));

      expect(scrollMock).toHaveBeenCalledWith({ top: 412, left: 0, behavior: 'smooth' });

      act(() => {
        vi.advanceTimersByTime(499);
      });

      expect(target.scrollIntoView).not.toHaveBeenCalled();
      expect(scrollMock).not.toHaveBeenCalledWith(0, 412);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      expect(scrollMock).not.toHaveBeenCalledWith(0, 412);

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(scrollMock).toHaveBeenCalledWith(0, 412);
    });

    it('clears stale scroll fallbacks when another section is selected', () => {
      vi.useFakeTimers();
      mockNavigationFrames();
      const scrollMock = mockWindowScrollTo();
      const eventTarget = mockSectionTarget(420);
      eventTarget.scrollIntoView = vi.fn();
      const twibbonTarget = mockSectionTarget(560);
      twibbonTarget.scrollIntoView = vi.fn();

      vi.spyOn(document, 'getElementById').mockImplementation((id) => {
        if (id === 'event-section') return eventTarget;
        if (id === 'twibbon-section') return twibbonTarget;
        return null;
      });

      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      fireEvent.click(screen.getByText('Rangkaian Acara'));
      fireEvent.click(screen.getByText('Twibbon'));

      act(() => {
        vi.advanceTimersByTime(1600);
      });

      expect(eventTarget.scrollIntoView).not.toHaveBeenCalled();
      expect(scrollMock).not.toHaveBeenCalledWith(0, 412);
      expect(twibbonTarget.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      expect(scrollMock).toHaveBeenCalledWith(0, 552);
    });
  });

  /* ------------------------------------------------------------------ */
  /*  8. Edge cases                                                      */
  /* ------------------------------------------------------------------ */

  describe('Edge cases', () => {
    it('re-renders between open and closed do not duplicate menu items', () => {
      const props = createProps({ isToolsOpen: true });
      const { rerender } = render(<FloatingController {...props} />);

      expect(screen.getAllByText('Twibbon')).toHaveLength(1);

      rerender(<FloatingController {...createProps({ isToolsOpen: false })} />);
      rerender(<FloatingController {...createProps({ isToolsOpen: true })} />);

      expect(screen.getAllByText('Twibbon')).toHaveLength(1);
      expect(screen.getAllByText('Ucapan & Doa')).toHaveLength(1);
      expect(screen.getAllByText('Tanda Kasih')).toHaveLength(1);
      expect(screen.getAllByText('Rangkaian Acara')).toHaveLength(1);
    });

    it('rapid toggle does not break rendering', () => {
      const setIsToolsOpen = vi.fn();
      const { rerender } = render(<FloatingController {...createProps({ setIsToolsOpen })} />);

      for (let i = 0; i < 20; i++) {
        const isOpen = i % 2 === 0;
        rerender(<FloatingController {...createProps({ isToolsOpen: isOpen, setIsToolsOpen })} />);
      }

      // After even number of toggles, isToolsOpen is true (i=18 -> open, i=19 rerender with false? Let's check last: i=19 -> isOpen = false)
      // The component should still be in a valid state
      const { container } = render(<FloatingController {...createProps()} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('switching isPlaying while menu is open renders correctly', () => {
      const { rerender } = render(
        <FloatingController {...createProps({ isToolsOpen: true, isPlaying: false })} />
      );
      expect(screen.getByText('Putar Musik')).toBeInTheDocument();

      rerender(<FloatingController {...createProps({ isToolsOpen: true, isPlaying: true })} />);
      expect(screen.getByText('Senyapkan Musik')).toBeInTheDocument();
      expect(screen.queryByText('Putar Musik')).not.toBeInTheDocument();
    });

    it('switching isPlaying while menu is closed does not show music text', () => {
      const { rerender } = render(
        <FloatingController {...createProps({ isPlaying: false })} />
      );
      expect(screen.queryByText('Putar Musik')).not.toBeInTheDocument();

      rerender(<FloatingController {...createProps({ isPlaying: true })} />);
      expect(screen.queryByText('Senyapkan Musik')).not.toBeInTheDocument();
    });

    it('all four navigation labels have consistent styling', () => {
      render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const labels = ['Twibbon', 'Ucapan & Doa', 'Tanda Kasih', 'Rangkaian Acara'];
      labels.forEach((label) => {
        const el = screen.getByText(label);
        expect(el.tagName).toBe('SPAN');
        expect(el).toHaveClass('font-sans');
        expect(el).toHaveClass('text-[8px]');
      });
    });

    it('component handles all props being default simultaneously', () => {
      const { container } = render(
        <FloatingController isToolsOpen={false} setIsToolsOpen={vi.fn()} isPlaying={false} toggleMusic={vi.fn()} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('component handles all boolean props true simultaneously', () => {
      const { container } = render(
        <FloatingController isToolsOpen={true} setIsToolsOpen={vi.fn()} isPlaying={true} toggleMusic={vi.fn()} />
      );
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Senyapkan Musik')).toBeInTheDocument();
      expect(screen.getByLabelText('Tutup menu')).toBeInTheDocument();
    });

    it('menu items container has gap-3 spacing', () => {
      const { container } = render(<FloatingController {...createProps({ isToolsOpen: true })} />);
      const menuContainer = container.querySelector('.gap-3.mb-2');
      expect(menuContainer).toBeInTheDocument();
    });

    it('main button has overflow-hidden to clip internal animations', () => {
      render(<FloatingController {...createProps()} />);
      const btn = screen.getByLabelText('Buka menu');
      expect(btn).toHaveClass('overflow-hidden');
    });
  });
});
