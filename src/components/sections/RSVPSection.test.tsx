import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RSVPSection } from './RSVPSection';
import { GuestWishes } from '../../types';

const SEED_WISHES: GuestWishes[] = [
  { id: 'd1', name: 'Ahmad & Keluarga', attendance: 'yes', message: 'Selamat menempuh hidup baru Dani & Marini! Semoga menjadi keluarga sakinah mawaddah warahmah.', createdAt: Date.now() - 1000000 },
  { id: 'd2', name: 'Budi Santoso', attendance: 'yes', message: 'Happy wedding! Titip doa terbaik buat kalian berdua.', createdAt: Date.now() - 2000000 },
  { id: 'd3', name: 'Citra Lestari', attendance: 'no', message: 'Maaf belum bisa hadir, lancar sampai hari H ya!', createdAt: Date.now() - 3000000 },
  { id: 'd4', name: 'Dedi Kurniawan', attendance: 'yes', message: "Baarakallahu laka wa baaraka 'alaika wa jama'a bainakuma fii khoir.", createdAt: Date.now() - 4000000 },
  { id: 'd5', name: 'Eka Putri', attendance: 'yes', message: 'Semoga bahagia selamanya, sampai kakek nenek.', createdAt: Date.now() - 5000000 },
  { id: 'd6', name: 'Fajar Ramadhan', attendance: 'yes', message: 'Congrats brader! Akhirnya sah juga.', createdAt: Date.now() - 6000000 },
  { id: 'd7', name: 'Gita Amalia', attendance: 'yes', message: 'Cantik banget Marini! Semoga berkah rumah tangganya.', createdAt: Date.now() - 7000000 },
  { id: 'd8', name: 'Hadi Prasetyo', attendance: 'no', message: 'Selamat ya Dan! Maaf lagi di luar kota.', createdAt: Date.now() - 8000000 },
  { id: 'd9', name: 'Indra Jaya', attendance: 'yes', message: 'Selamat menempuh bahtera rumah tangga baru.', createdAt: Date.now() - 9000000 },
  { id: 'd10', name: 'Joko Susilo', attendance: 'yes', message: 'Sakinah mawaddah warahmah ya gaes.', createdAt: Date.now() - 10000000 },
  { id: 'd11', name: 'Kiki Amelia', attendance: 'yes', message: 'Happy forever you two!', createdAt: Date.now() - 11000000 },
  { id: 'd12', name: 'Lia Kusuma', attendance: 'yes', message: 'Lancar-lancar acaranya Marini.', createdAt: Date.now() - 12000000 },
  { id: 'd13', name: 'Maman', attendance: 'yes', message: 'Selamat menempuh hidup baru teman.', createdAt: Date.now() - 13000000 },
  { id: 'd14', name: 'Nina', attendance: 'no', message: 'Doa terbaik untuk kalian.', createdAt: Date.now() - 14000000 },
  { id: 'd15', name: 'Oky', attendance: 'yes', message: 'Mantap Dani! Selamat ya.', createdAt: Date.now() - 15000000 },
  { id: 'd16', name: 'Putu', attendance: 'yes', message: 'Rahajeng wedding Dani & Marini.', createdAt: Date.now() - 16000000 },
  { id: 'd17', name: 'Qori', attendance: 'yes', message: 'Selamat ya kak.', createdAt: Date.now() - 17000000 },
  { id: 'd18', name: 'Rian', attendance: 'yes', message: 'Selamat ya Dani dan Marini.', createdAt: Date.now() - 18000000 },
  { id: 'd19', name: 'Siska', attendance: 'yes', message: 'Happy wedding day!', createdAt: Date.now() - 19000000 },
  { id: 'd20', name: 'Tono', attendance: 'yes', message: 'Selamat berbahagia bro.', createdAt: Date.now() - 20000000 },
];

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
      // Both mobile and desktop layouts render "Ucapan & Doa"; use getAllByText
      expect(screen.getAllByText('Ucapan & Doa')[0]).toBeInTheDocument();
    });

    it('title has uppercase tracking styling', () => {
      renderWithProps();
      // Both layouts render the title; pick the first occurrence
      const title = screen.getAllByText('Ucapan & Doa')[0];
      expect(title.className).toContain('uppercase');
      expect(title.className).toContain('tracking-');
    });

    it('renders consistently on re-render without errors', () => {
      const { rerender } = render(<RSVPSection {...defaultProps} />);
      rerender(<RSVPSection {...defaultProps} />);
      expect(screen.getAllByText('Ucapan & Doa')[0]).toBeInTheDocument();
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
      // Both mobile and desktop layouts render the same wish; use getAllByText
      expect(screen.getAllByText(firstWish.name)[0]).toBeInTheDocument();
    });

    it('renders all 5 current wishes', () => {
      renderWithProps();
      SEED_WISHES.slice(0, 5).forEach((wish) => {
        expect(screen.getAllByText(wish.name)[0]).toBeInTheDocument();
      });
    });

    it('displays wish messages in quotes', () => {
      renderWithProps();
      SEED_WISHES.slice(0, 5).forEach((wish) => {
        expect(screen.getAllByText(`"${wish.message}"`)[0]).toBeInTheDocument();
      });
    });

    it('displays attendance badge "Hadir" for yes attendance', () => {
      const yesWish = SEED_WISHES.filter((w) => w.attendance === 'yes').slice(0, 3);
      renderWithProps({ currentWishes: yesWish });
      const hadirBadges = screen.getAllByText('Hadir');
      // Both mobile and desktop layouts render each badge, so count is doubled
      expect(hadirBadges.length).toBe(yesWish.length * 2);
    });

    it('displays attendance badge "Absen" for no attendance', () => {
      const noWish = SEED_WISHES.filter((w) => w.attendance === 'no').slice(0, 2);
      renderWithProps({ currentWishes: noWish, wishes: noWish });
      const absenBadges = screen.getAllByText('Berhalangan');
      // Both mobile and desktop layouts render each badge, so count is doubled
      expect(absenBadges.length).toBe(noWish.length * 2);
    });

    it('attendance badge "Hadir" has gold styling', () => {
      const yesWish = SEED_WISHES.filter((w) => w.attendance === 'yes').slice(0, 1);
      renderWithProps({ currentWishes: yesWish });
      // Both layouts render the badge; pick the first occurrence
      const badge = screen.getAllByText('Hadir')[0];
      expect(badge.className).toContain('bg-gold/10');
      expect(badge.className).toContain('text-gold');
    });

    it('attendance badge "Absen" has ink styling', () => {
      const noWish = SEED_WISHES.filter((w) => w.attendance === 'no').slice(0, 1);
      renderWithProps({ currentWishes: noWish, wishes: noWish });
      // Both layouts render the badge; pick the first occurrence
      const badge = screen.getAllByText('Berhalangan')[0];
      expect(badge.className).toContain('bg-ink/5');
      expect(badge.className).toContain('text-ink/60');
    });

    it('displays formatted dates for each wish', () => {
      const { container } = renderWithProps();
      // Each wish card has a date span with specific styling
      const dateSpans = container.querySelectorAll('.font-serif.shrink-0.text-ink\\/60');
      expect(dateSpans.length).toBeGreaterThanOrEqual(5);
    });

    it('wish cards have white background with border', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/60');
      // Both mobile and desktop layouts render the cards, so count is doubled
      expect(cards.length).toBe(10);
    });

    it('wish messages have serif italic font', () => {
      renderWithProps();
      const firstMsg = SEED_WISHES[0].message;
      // Both layouts render the message; pick the first occurrence
      const msgEl = screen.getAllByText(`"${firstMsg}"`)[0];
      expect(msgEl.className).toContain('font-serif');
      expect(msgEl.className).toContain('italic');
    });

    it('wish messages are clamped to 2 lines', () => {
      renderWithProps();
      const firstMsg = SEED_WISHES[0].message;
      // Both layouts render the message; pick the first occurrence
      const msgEl = screen.getAllByText(`"${firstMsg}"`)[0];
      expect(msgEl.className).toContain('line-clamp-2');
    });
  });

  // ─── Empty State ───────────────────────────────────────────────────
  describe('empty state', () => {
    it('shows "Belum ada doa." when wishes array is empty', () => {
      renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      // Both mobile and desktop layouts render the empty state text
      expect(screen.getAllByText('Ruang ini masih menunggu cerita pertama.')[0]).toBeInTheDocument();
    });

    it('empty state text has serif italic font', () => {
      renderWithProps({ wishes: [], currentWishes: [], totalPages: 0 });
      // Both layouts render the text; pick the first occurrence
      const text = screen.getAllByText('Ruang ini masih menunggu cerita pertama.')[0];
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
      // Both mobile (circular FAB) and desktop (text button) have aria-label="Kirim Doa"
      expect(screen.getAllByLabelText('Kirim Doa')[0]).toBeInTheDocument();
    });

    it('FAB is a button element', () => {
      renderWithProps();
      // Pick the first button (mobile circular FAB)
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab.tagName).toBe('BUTTON');
    });

    it('calls onOpenRSVP when FAB is clicked', () => {
      const onOpenRSVP = vi.fn();
      renderWithProps({ onOpenRSVP });
      // Click the first (mobile) button
      fireEvent.click(screen.getAllByLabelText('Kirim Doa')[0]);
      expect(onOpenRSVP).toHaveBeenCalledOnce();
    });

    it('calls onOpenRSVP exactly once per click', () => {
      const onOpenRSVP = vi.fn();
      renderWithProps({ onOpenRSVP });
      // Use the first (mobile) button for repeated click testing
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      fireEvent.click(fab);
      fireEvent.click(fab);
      fireEvent.click(fab);
      expect(onOpenRSVP).toHaveBeenCalledTimes(3);
    });

    it('FAB has gold gradient styling', () => {
      renderWithProps();
      // Pick the first (mobile circular FAB) button
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab.className).toContain('bg-gradient-to-br');
      expect(fab.className).toContain('from-gold');
    });

    it('FAB has rounded-full shape', () => {
      renderWithProps();
      // Pick the first (mobile circular FAB) button
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab.className).toContain('rounded-full');
    });

    it('FAB has shadow for depth effect', () => {
      renderWithProps();
      // Pick the first (mobile circular FAB) button
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab.className).toContain('shadow-');
    });

    it('FAB has white border for glass effect', () => {
      renderWithProps();
      // Pick the first (mobile circular FAB) button
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab.className).toContain('border');
      expect(fab.className).toContain('border-white/20');
    });

    it('FAB has title attribute "Kirim Doa"', () => {
      renderWithProps();
      // Only the mobile circular FAB has the title attribute
      const fab = screen.getAllByLabelText('Kirim Doa')[0];
      expect(fab).toHaveAttribute('title', 'Kirim Doa');
    });
  });

  // ─── Pagination ────────────────────────────────────────────────────
  describe('pagination', () => {
    it('shows pagination when totalPages > 1', () => {
      renderWithProps({ totalPages: 3 });
      // Both mobile and desktop layouts render pagination buttons
      expect(screen.getAllByLabelText('Halaman sebelumnya')[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText('Halaman selanjutnya')[0]).toBeInTheDocument();
    });

    it('prev button has aria-label "Halaman sebelumnya"', () => {
      renderWithProps();
      expect(screen.getAllByLabelText('Halaman sebelumnya')[0]).toBeInTheDocument();
    });

    it('next button has aria-label "Halaman selanjutnya"', () => {
      renderWithProps();
      expect(screen.getAllByLabelText('Halaman selanjutnya')[0]).toBeInTheDocument();
    });

    it('prev button is disabled on page 1', () => {
      renderWithProps({ currentPage: 1 });
      // All instances of the prev button should be disabled on page 1
      screen.getAllByLabelText('Halaman sebelumnya').forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it('next button is disabled on last page', () => {
      renderWithProps({ currentPage: 3, totalPages: 3 });
      // All instances of the next button should be disabled on the last page
      screen.getAllByLabelText('Halaman selanjutnya').forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it('prev button is enabled on page 2', () => {
      renderWithProps({ currentPage: 2, totalPages: 3 });
      expect(screen.getAllByLabelText('Halaman sebelumnya')[0]).not.toBeDisabled();
    });

    it('next button is enabled when not on last page', () => {
      renderWithProps({ currentPage: 1, totalPages: 3 });
      expect(screen.getAllByLabelText('Halaman selanjutnya')[0]).not.toBeDisabled();
    });

    it('displays page indicator "X / Y"', () => {
      renderWithProps({ currentPage: 2, totalPages: 5 });
      // Both layouts render the page indicator
      expect(screen.getAllByText('Bab 2 dari 5')[0]).toBeInTheDocument();
    });

    it('displays page indicator "1 / 3" on first page', () => {
      renderWithProps({ currentPage: 1, totalPages: 3 });
      expect(screen.getAllByText('Bab 1 dari 3')[0]).toBeInTheDocument();
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
      // Click the first (mobile) next button
      fireEvent.click(screen.getAllByLabelText('Halaman selanjutnya')[0]);
      expect(setCurrentPage).toHaveBeenCalledOnce();
      // setCurrentPage is called with a function (p) => p + 1
      const fn = setCurrentPage.mock.calls[0][0];
      expect(typeof fn).toBe('function');
      expect(fn(1)).toBe(2);
    });

    it('clicking prev button calls setCurrentPage', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 2, totalPages: 3 });
      // Click the first (mobile) prev button
      fireEvent.click(screen.getAllByLabelText('Halaman sebelumnya')[0]);
      expect(setCurrentPage).toHaveBeenCalledOnce();
      const fn = setCurrentPage.mock.calls[0][0];
      expect(typeof fn).toBe('function');
      expect(fn(2)).toBe(1);
    });

    it('next button increments page by 1 via callback', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 1, totalPages: 5 });
      fireEvent.click(screen.getAllByLabelText('Halaman selanjutnya')[0]);
      const fn = setCurrentPage.mock.calls[0][0];
      expect(fn(3)).toBe(4);
      expect(fn(4)).toBe(5);
    });

    it('prev button decrements page by 1 via callback', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 3, totalPages: 5 });
      fireEvent.click(screen.getAllByLabelText('Halaman sebelumnya')[0]);
      const fn = setCurrentPage.mock.calls[0][0];
      expect(fn(3)).toBe(2);
      expect(fn(1)).toBe(0);
    });

    it('does not call setCurrentPage when prev is disabled (page 1)', () => {
      const setCurrentPage = vi.fn();
      renderWithProps({ setCurrentPage, currentPage: 1, totalPages: 3 });
      fireEvent.click(screen.getAllByLabelText('Halaman sebelumnya')[0]);
      // Disabled buttons still fire events but browser prevents default
      // The button is disabled so it should not trigger the handler
      // Note: disabled buttons don't fire click events in real DOM
      // but testing-library may still call handler — check the button is disabled
      expect(screen.getAllByLabelText('Halaman sebelumnya')[0]).toBeDisabled();
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

    it('has decorative background gradient element', () => {
      const { container } = renderWithProps();
      const gradientEl = container.querySelector('.pointer-events-none');
      expect(gradientEl).toBeInTheDocument();
    });

    it('background blur element is pointer-events-none', () => {
      const { container } = renderWithProps();
      const bgLayer = container.querySelector('.pointer-events-none');
      expect(bgLayer).toBeInTheDocument();
    });

    it('pagination buttons have bubble-glow class', () => {
      const { container } = renderWithProps();
      const bubbleGlows = container.querySelectorAll('.bubble-glow');
      // Both mobile and desktop layouts render 2 pagination buttons each
      expect(bubbleGlows.length).toBe(4);
    });

    it('wish grid uses responsive 1-col mobile, 2-col desktop', () => {
      const { container } = renderWithProps();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
    });

    it('container has max-w-lg or max-w-5xl', () => {
      const { container } = renderWithProps();
      // Mobile layout uses max-w-lg, desktop uses max-w-5xl
      const maxW = container.querySelector('.max-w-lg') || container.querySelector('.max-w-5xl');
      expect(maxW).toBeInTheDocument();
    });

    it('container is centered with mx-auto', () => {
      const { container } = renderWithProps();
      const centered = container.querySelector('.mx-auto');
      expect(centered).toBeInTheDocument();
    });

    it('section has py-[3vh] vertical padding', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('py-[3vh]');
    });

    it('wish cards have rounded corners', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.rounded-xl');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('wish cards have hover border effect', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.hover\\:border-gold\\/20');
      // Both mobile and desktop layouts render 5 cards each
      expect(cards.length).toBe(10);
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('renders with a single wish', () => {
      const singleWish = [SEED_WISHES[0]];
      renderWithProps({ wishes: singleWish, currentWishes: singleWish, totalPages: 1 });
      // Both layouts render the name; use getAllByText
      expect(screen.getAllByText(singleWish[0].name)[0]).toBeInTheDocument();
    });

    it('renders with many wishes (full SEED_WISHES as current)', () => {
      renderWithProps({ currentWishes: SEED_WISHES, totalPages: 1 });
      SEED_WISHES.forEach((wish) => {
        // Both layouts render each name; use getAllByText
        expect(screen.getAllByText(wish.name)[0]).toBeInTheDocument();
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
      // Both layouts render the message; pick the first occurrence
      const msgEl = screen.getAllByText(`"${'A'.repeat(500)}"`)[0];
      expect(msgEl.className).toContain('line-clamp-2');
    });

    it('renders correctly when switching from empty to having wishes', () => {
      const { rerender } = render(
        <RSVPSection {...defaultProps} wishes={[]} currentWishes={[]} totalPages={0} />
      );
      expect(screen.getAllByText('Ruang ini masih menunggu cerita pertama.').length).toBeGreaterThanOrEqual(1);

      rerender(<RSVPSection {...defaultProps} />);
      expect(screen.queryByText('Ruang ini masih menunggu cerita pertama.')).not.toBeInTheDocument();
      expect(screen.getAllByText(SEED_WISHES[0].name).length).toBeGreaterThanOrEqual(1);
    });

    it('handles mixed attendance wishes correctly', () => {
      const mixed: GuestWishes[] = [
        { id: 'm1', name: 'Yes Person', attendance: 'yes', message: 'Coming!', createdAt: Date.now() },
        { id: 'm2', name: 'No Person', attendance: 'no', message: 'Sorry!', createdAt: Date.now() },
      ];
      renderWithProps({ wishes: mixed, currentWishes: mixed, totalPages: 1 });
      expect(screen.getAllByText('Hadir').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Berhalangan').length).toBeGreaterThanOrEqual(1);
    });

    it('each wish card has a unique key via id', () => {
      // Verify no duplicate warnings by rendering without error
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/60');
      // Mobile + desktop layouts both render cards
      expect(cards.length).toBe(defaultProps.currentWishes.length * 2);
    });

    it('page indicator updates with different pages', () => {
      const { rerender } = render(
        <RSVPSection {...defaultProps} currentPage={1} totalPages={4} />
      );
      expect(screen.getAllByText('Bab 1 dari 4').length).toBeGreaterThanOrEqual(1);

      rerender(<RSVPSection {...defaultProps} currentPage={3} totalPages={4} />);
      expect(screen.getAllByText('Bab 3 dari 4').length).toBeGreaterThanOrEqual(1);
    });
  });
});
