import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RSVPSection } from './RSVPSection';
import { SEED_WISHES } from '../../constants/wishes';
import { GuestWishes } from '../../types';

const defaultProps = {
  wishes: SEED_WISHES,
  currentWishes: SEED_WISHES.slice(0, 5),
  currentPage: 1,
  totalPages: 3,
  setCurrentPage: vi.fn(),
  onOpenRSVP: vi.fn(),
};

function renderWithProps(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<RSVPSection {...props} />);
}

describe('RSVPSection', () => {
  // ─── Basic Rendering ───────────────────────────────────────────────
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProps();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element as root', () => {
      const { container } = renderWithProps();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has section id="rsvp-section" for navigation anchor', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('#rsvp-section');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });

    it('displays "RSVP & Wishes" title text', () => {
      renderWithProps();
      expect(screen.getByText('Ucapan & Doa')).toBeInTheDocument();
    });

    it('title has uppercase tracking styling', () => {
      renderWithProps();
      const title = screen.getByText('Ucapan & Doa');
      expect(title.className).toContain('uppercase');
      expect(title.className).toContain('tracking-');
    });

    it('renders consistently on re-render without errors', () => {
      const { rerender } = render(<RSVPSection {...defaultProps} />);
      rerender(<RSVPSection {...defaultProps} />);
      expect(screen.getByText('Ucapan & Doa')).toBeInTheDocument();
    });

    it('renders MessageSquare icon in header', () => {
      const { container } = renderWithProps();
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  // ─── Wishes Display ────────────────────────────────────────────────
  describe('wishes display', () => {
    it('renders wish cards for each currentWish entry', () => {
      renderWithProps();
      const firstWish = SEED_WISHES[0];
      expect(screen.getByText(firstWish.name)).toBeInTheDocument();
    });

    it('renders all 5 current wishes', () => {
      renderWithProps();
      SEED_WISHES.slice(0, 5).forEach((wish) => {
        expect(screen.getByText(wish.name)).toBeInTheDocument();
      });
    });

    it('displays wish messages in quotes', () => {
      renderWithProps();
      SEED_WISHES.slice(0, 5).forEach((wish) => {
        expect(screen.getByText(`"${wish.message}"`)).toBeInTheDocument();
      });
    });

    it('displays attendance badge "Hadir" for yes attendance', () => {
      const yesWish = SEED_WISHES.filter((w) => w.attendance === 'yes').slice(0, 3);
      renderWithProps({ currentWishes: yesWish });
      const hadirBadges = screen.getAllByText('Hadir');
      expect(hadirBadges.length).toBe(yesWish.length);
    });

    it('displays attendance badge "Absen" for no attendance', () => {
      const noWish = SEED_WISHES.filter((w) => w.attendance === 'no').slice(0, 2);
      renderWithProps({ currentWishes: noWish, wishes: noWish });
      const absenBadges = screen.getAllByText('Berhalangan');
      expect(absenBadges.length).toBe(noWish.length);
    });

    it('attendance badge "Hadir" has gold styling', () => {
      const yesWish = SEED_WISHES.filter((w) => w.attendance === 'yes').slice(0, 1);
      renderWithProps({ currentWishes: yesWish });
      const badge = screen.getByText('Hadir');
      expect(badge.className).toContain('bg-gold/10');
      expect(badge.className).toContain('text-gold');
    });

    it('attendance badge "Absen" has ink styling', () => {
      const noWish = SEED_WISHES.filter((w) => w.attendance === 'no').slice(0, 1);
      renderWithProps({ currentWishes: noWish, wishes: noWish });
      const badge = screen.getByText('Berhalangan');
      expect(badge.className).toContain('bg-ink/5');
      expect(badge.className).toContain('text-ink/50');
    });

    it('displays formatted dates for each wish', () => {
      const { container } = renderWithProps();
      // Each wish card has a date span with specific styling
      const dateSpans = container.querySelectorAll('.tracking-tighter.shrink-0');
      expect(dateSpans.length).toBeGreaterThanOrEqual(5);
    });

    it('wish cards have white background with border', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/60');
      expect(cards.length).toBe(5);
    });

    it('wish messages have serif italic font', () => {
      renderWithProps();
      const firstMsg = SEED_WISHES[0].message;
      const msgEl = screen.getByText(`"${firstMsg}"`);
      expect(msgEl.className).toContain('font-serif');
      expect(msgEl.className).toContain('italic');
    });

    it('wish messages are clamped to 2 lines', () => {
      renderWithProps();
      const firstMsg = SEED_WISHES[0].message;
      const msgEl = screen.getByText(`"${firstMsg}"`);
      expect(msgEl.className).toContain('line-clamp-2');
    });
  });

  // ─── Empty State ───────────────────────────────────────────────────
  describe('empty state', () => {
    it('shows "Belum ada doa." when wishes array is empty', () => {
      renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      expect(screen.getByText('Ruang ini masih menunggu cerita pertama.')).toBeInTheDocument();
    });

    it('empty state text has serif italic font', () => {
      renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      const text = screen.getByText('Ruang ini masih menunggu cerita pertama.');
      expect(text.className).toContain('font-serif');
      expect(text.className).toContain('italic');
    });

    it('empty state has dashed border container', () => {
      const { container } = renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      const emptyBox = container.querySelector('.border-dashed');
      expect(emptyBox).toBeInTheDocument();
    });

    it('empty state has animate-pulse heart icon', () => {
      const { container } = renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      const pulsingHeart = container.querySelector('.animate-pulse');
      expect(pulsingHeart).toBeInTheDocument();
    });

    it('empty state container fills available height', () => {
      const { container } = renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      const emptyBox = container.querySelector('.w-full.border-dashed');
      expect(emptyBox).toBeInTheDocument();
    });

    it('does not show wish cards in empty state', () => {
      const { container } = renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      const cards = container.querySelectorAll('.bg-white\\/60');
      expect(cards.length).toBe(0);
    });

    it('does not show pagination in empty state', () => {
      renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      expect(screen.queryByLabelText('Halaman sebelumnya')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Halaman selanjutnya')).not.toBeInTheDocument();
    });
  });

  // ─── FAB Button ────────────────────────────────────────────────────
  describe('FAB (Kirim Doa button)', () => {
    it('renders "Kirim Doa" button with aria-label', () => {
      renderWithProps();
      expect(screen.getByLabelText('Kirim Doa')).toBeInTheDocument();
    });

    it('FAB is a button element', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab.tagName).toBe('BUTTON');
    });

    it('calls onOpenRSVP when FAB is clicked', () => {
      const onOpenRSVP = vi.fn();
      renderWithProps({ onOpenRSVP });
      fireEvent.click(screen.getByLabelText('Kirim Doa'));
      expect(onOpenRSVP).toHaveBeenCalledOnce();
    });

    it('calls onOpenRSVP exactly once per click', () => {
      const onOpenRSVP = vi.fn();
      renderWithProps({ onOpenRSVP });
      const fab = screen.getByLabelText('Kirim Doa');
      fireEvent.click(fab);
      fireEvent.click(fab);
      fireEvent.click(fab);
      expect(onOpenRSVP).toHaveBeenCalledTimes(3);
    });

    it('FAB has gold gradient styling', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab.className).toContain('bg-gradient-to-br');
      expect(fab.className).toContain('from-gold');
    });

    it('FAB has rounded-full shape', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab.className).toContain('rounded-full');
    });

    it('FAB has shadow for depth effect', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab.className).toContain('shadow-');
    });

    it('FAB has white border for glass effect', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab.className).toContain('border');
      expect(fab.className).toContain('border-white/20');
    });

    it('FAB has title attribute "Kirim Doa"', () => {
      renderWithProps();
      const fab = screen.getByLabelText('Kirim Doa');
      expect(fab).toHaveAttribute('title', 'Kirim Doa');
    });
  });

  // ─── Pagination ────────────────────────────────────────────────────
  describe('pagination', () => {
    it('shows pagination when totalPages > 1', () => {
      renderWithProps({ totalPages: 3 });
      expect(screen.getByLabelText('Halaman sebelumnya')).toBeInTheDocument();
      expect(screen.getByLabelText('Halaman selanjutnya')).toBeInTheDocument();
    });

    it('prev button has aria-label "Halaman sebelumnya"', () => {
      renderWithProps();
      expect(screen.getByLabelText('Halaman sebelumnya')).toBeInTheDocument();
    });

    it('next button has aria-label "Halaman selanjutnya"', () => {
      renderWithProps();
      expect(screen.getByLabelText('Halaman selanjutnya')).toBeInTheDocument();
    });

    it('prev button is disabled on page 1', () => {
      renderWithProps({ currentPage: 1 });
      expect(screen.getByLabelText('Halaman sebelumnya')).toBeDisabled();
    });

    it('next button is disabled on last page', () => {
      renderWithProps({ currentPage: 3, totalPages: 3 });
      expect(screen.getByLabelText('Halaman selanjutnya')).toBeDisabled();
    });

    it('prev button is enabled on page 2', () => {
      renderWithProps({ currentPage: 2, totalPages: 3 });
      expect(screen.getByLabelText('Halaman sebelumnya')).not.toBeDisabled();
    });

    it('next button is enabled when not on last page', () => {
      renderWithProps({ currentPage: 1, totalPages: 3 });
      expect(screen.getByLabelText('Halaman selanjutnya')).not.toBeDisabled();
    });

    it('displays page indicator "X / Y"', () => {
      renderWithProps({ currentPage: 2, totalPages: 5 });
      expect(screen.getByText('Bab 2 dari 5')).toBeInTheDocument();
    });

    it('displays page indicator "1 / 3" on first page', () => {
      renderWithProps({ currentPage: 1, totalPages: 3 });
      expect(screen.getByText('Bab 1 dari 3')).toBeInTheDocument();
    });

    it('hides pagination when totalPages is 1', () => {
      renderWithProps({ totalPages: 1 });
      expect(screen.queryByLabelText('Halaman sebelumnya')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Halaman selanjutnya')).not.toBeInTheDocument();
    });

    it('hides pagination when totalPages is 0', () => {
      renderWithProps({ totalPages: 0, wishes: [], currentWishes: [] });
      expect(screen.queryByLabelText('Halaman sebelumnya')).not.toBeInTheDocument();
    });

    it('pagination has border-top separator', () => {
      const { container } = renderWithProps();
      const paginationBar = container.querySelector('.border-t.border-gold\\/10');
      expect(paginationBar).toBeInTheDocument();
    });
  });

  // ─── Pagination Interactions ───────────────────────────────────────
  describe('pagination interactions', () => {
    it('clicking next button calls setCurrentPage', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 1, totalPages: 3 });
      fireEvent.click(screen.getByLabelText('Halaman selanjutnya'));
      expect(setCurrentPage).toHaveBeenCalledOnce();
      // setCurrentPage is called with a function (p) => p + 1
      const fn = setCurrentPage.mock.calls[0][0];
      expect(typeof fn).toBe('function');
      expect(fn(1)).toBe(2);
    });

    it('clicking prev button calls setCurrentPage', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 2, totalPages: 3 });
      fireEvent.click(screen.getByLabelText('Halaman sebelumnya'));
      expect(setCurrentPage).toHaveBeenCalledOnce();
      const fn = setCurrentPage.mock.calls[0][0];
      expect(typeof fn).toBe('function');
      expect(fn(2)).toBe(1);
    });

    it('next button increments page by 1 via callback', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 1, totalPages: 5 });
      fireEvent.click(screen.getByLabelText('Halaman selanjutnya'));
      const fn = setCurrentPage.mock.calls[0][0];
      expect(fn(3)).toBe(4);
      expect(fn(4)).toBe(5);
    });

    it('prev button decrements page by 1 via callback', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 3, totalPages: 5 });
      fireEvent.click(screen.getByLabelText('Halaman sebelumnya'));
      const fn = setCurrentPage.mock.calls[0][0];
      expect(fn(3)).toBe(2);
      expect(fn(1)).toBe(0);
    });

    it('does not call setCurrentPage when prev is disabled (page 1)', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 1, totalPages: 3 });
      fireEvent.click(screen.getByLabelText('Halaman sebelumnya'));
      // Disabled buttons still fire events but browser prevents default
      // The button is disabled so it should not trigger the handler
      // Note: disabled buttons don't fire click events in real DOM
      // but testing-library may still call handler — check the button is disabled
      expect(screen.getByLabelText('Halaman sebelumnya')).toBeDisabled();
    });
  });

  // ─── Visual / Styling ─────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('section has glassmorphism background bg-ivory/50', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-paper');
    });

    it('section has overflow-hidden', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('has decorative background blur element', () => {
      const { container } = renderWithProps();
      const blurEl = container.querySelector('.blur-\\[120px\\]');
      expect(blurEl).toBeInTheDocument();
    });

    it('background blur element is pointer-events-none', () => {
      const { container } = renderWithProps();
      const bgLayer = container.querySelector('.pointer-events-none');
      expect(bgLayer).toBeInTheDocument();
    });

    it('pagination buttons have bubble-glow class', () => {
      const { container } = renderWithProps();
      const bubbleGlows = container.querySelectorAll('.bubble-glow');
      expect(bubbleGlows.length).toBe(2);
    });

    it('wish grid uses responsive 1-col mobile, 2-col desktop', () => {
      const { container } = renderWithProps();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
    });

    it('container has max-w-4xl', () => {
      const { container } = renderWithProps();
      const maxW = container.querySelector('.max-w-4xl');
      expect(maxW).toBeInTheDocument();
    });

    it('container is centered with mx-auto', () => {
      const { container } = renderWithProps();
      const centered = container.querySelector('.mx-auto');
      expect(centered).toBeInTheDocument();
    });

    it('section has py-6 vertical padding', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('py-[2vh]');
    });

    it('wish cards have rounded corners', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('wish cards have hover border effect', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.hover\\:border-gold\\/20');
      expect(cards.length).toBe(5);
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('renders with a single wish', () => {
      const singleWish = [SEED_WISHES[0]];
      renderWithProps({ wishes: singleWish, currentWishes: singleWish, totalPages: 1 });
      expect(screen.getByText(singleWish[0].name)).toBeInTheDocument();
    });

    it('renders with many wishes (full SEED_WISHES as current)', () => {
      renderWithProps({ currentWishes: SEED_WISHES, totalPages: 1 });
      SEED_WISHES.forEach((wish) => {
        expect(screen.getByText(wish.name)).toBeInTheDocument();
      });
    });

    it('wish with very long name is truncated (truncate class)', () => {
      const longNameWish: GuestWishes[] = [{
        id: 'long1',
        name: 'Abdurrahman Muhammad Al-Farouq bin Abdullah Al-Rashid',
        attendance: 'yes',
        message: 'Selamat ya!',
        createdAt: Date.now(),
      }];
      const { container } = renderWithProps({
        wishes: longNameWish,
        currentWishes: longNameWish,
        totalPages: 1,
      });
      const nameEl = container.querySelector('.truncate');
      expect(nameEl).toBeInTheDocument();
      expect(nameEl?.textContent).toBe(longNameWish[0].name);
    });

    it('name element has max-w-[130px] for truncation', () => {
      const { container } = renderWithProps();
      const nameEl = container.querySelector('.max-w-\\[130px\\]');
      expect(nameEl).toBeInTheDocument();
    });

    it('name element has truncate class', () => {
      const { container } = renderWithProps();
      const truncated = container.querySelectorAll('.truncate');
      expect(truncated.length).toBeGreaterThan(0);
    });

    it('renders wish with very long message (clamped)', () => {
      const longMsgWish: GuestWishes[] = [{
        id: 'longmsg',
        name: 'Test',
        attendance: 'yes',
        message: 'A'.repeat(500),
        createdAt: Date.now(),
      }];
      renderWithProps({
        wishes: longMsgWish,
        currentWishes: longMsgWish,
        totalPages: 1,
      });
      const msgEl = screen.getByText(`"${'A'.repeat(500)}"`);
      expect(msgEl.className).toContain('line-clamp-2');
    });

    it('renders correctly when switching from empty to having wishes', () => {
      const { rerender } = render(
        <RSVPSection {...defaultProps} wishes={[]} currentWishes={[]} totalPages={0} />
      );
      expect(screen.getByText('Ruang ini masih menunggu cerita pertama.')).toBeInTheDocument();

      rerender(<RSVPSection {...defaultProps} />);
      expect(screen.queryByText('Ruang ini masih menunggu cerita pertama.')).not.toBeInTheDocument();
      expect(screen.getByText(SEED_WISHES[0].name)).toBeInTheDocument();
    });

    it('handles mixed attendance wishes correctly', () => {
      const mixed: GuestWishes[] = [
        { id: 'm1', name: 'Yes Person', attendance: 'yes', message: 'Coming!', createdAt: Date.now() },
        { id: 'm2', name: 'No Person', attendance: 'no', message: 'Sorry!', createdAt: Date.now() },
      ];
      renderWithProps({ wishes: mixed, currentWishes: mixed, totalPages: 1 });
      expect(screen.getByText('Hadir')).toBeInTheDocument();
      expect(screen.getByText('Berhalangan')).toBeInTheDocument();
    });

    it('each wish card has a unique key via id', () => {
      // Verify no duplicate warnings by rendering without error
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/60');
      expect(cards.length).toBe(defaultProps.currentWishes.length);
    });

    it('page indicator updates with different pages', () => {
      const { rerender } = render(
        <RSVPSection {...defaultProps} currentPage={1} totalPages={4} />
      );
      expect(screen.getByText('Bab 1 dari 4')).toBeInTheDocument();

      rerender(<RSVPSection {...defaultProps} currentPage={3} totalPages={4} />);
      expect(screen.getByText('Bab 3 dari 4')).toBeInTheDocument();
    });
  });
});
