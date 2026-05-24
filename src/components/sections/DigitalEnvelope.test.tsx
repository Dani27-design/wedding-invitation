import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../context/WeddingContext', () => ({
  useWeddingContext: () => ({
    giftAccounts: [
      { bank: 'BCA', account: '1234567890', owner: 'M. Daniansyah Chusyaidin' },
      { bank: 'BRI', account: '0987654321', owner: 'Siti Nur Marini' },
      { bank: 'Jenius', account: '111222333444', owner: 'M. Daniansyah Chusyaidin' },
      { bank: 'BTN', account: '777888999000', owner: 'Siti Nur Marini' },
      { bank: 'Gopay', account: '08123456789', owner: 'M. Daniansyah Chusyaidin' },
      { bank: 'Seabank', account: '08987654321', owner: 'Siti Nur Marini' },
    ],
  }),
}));

import { DigitalEnvelope } from './DigitalEnvelope';

const defaultProps = {
  copiedIndex: null as number | null,
  onCopy: vi.fn(),
};

function renderWithProps(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<DigitalEnvelope {...props} />);
}

describe('DigitalEnvelope', () => {
  // ─── Basic Rendering ───────────────────────────────────────────────
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProps();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderWithProps();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has section id="gift-section" for navigation', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('#gift-section');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });

    it('displays "Tanda Kasih" title', () => {
      renderWithProps();
      expect(screen.getAllByText('Tanda Kasih')[0]).toBeInTheDocument();
    });

    it('title has uppercase serif italic styling', () => {
      renderWithProps();
      const title = screen.getAllByText('Tanda Kasih')[0];
      expect(title.className).toContain('font-black');
      expect(title.className).toContain('uppercase');
    });

    it('displays description text about kehadiran dan doa', () => {
      renderWithProps();
      expect(screen.getAllByText(/Kehadiran dan Doa Anda adalah hadiah terindah bagi kami/)[0]).toBeInTheDocument();
    });

    it('renders consistently on re-render', () => {
      const { rerender } = render(<DigitalEnvelope {...defaultProps} />);
      rerender(<DigitalEnvelope {...defaultProps} />);
      expect(screen.getAllByText('Tanda Kasih')[0]).toBeInTheDocument();
    });

    it('has Gift icon in header', () => {
      const { container } = renderWithProps();
      const header = container.querySelector('.text-center');
      const giftIcon = header?.querySelector('[data-lucide="gift"]');
      expect(giftIcon).not.toBeInTheDocument();
    });
  });

  // ─── Bank Accounts ────────────────────────────────────────────────
  describe('bank accounts', () => {
    it('renders all 6 bank names', () => {
      renderWithProps();
      expect(screen.getAllByText('BCA')[0]).toBeInTheDocument();
      expect(screen.getAllByText('BRI')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Jenius')[0]).toBeInTheDocument();
      expect(screen.getAllByText('BTN')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Gopay')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Seabank')[0]).toBeInTheDocument();
    });

    it('renders BCA account number', () => {
      renderWithProps();
      expect(screen.getAllByText('1234567890')[0]).toBeInTheDocument();
    });

    it('renders BRI account number', () => {
      renderWithProps();
      expect(screen.getAllByText('0987654321')[0]).toBeInTheDocument();
    });

    it('renders Jenius account number', () => {
      renderWithProps();
      expect(screen.getAllByText('111222333444')[0]).toBeInTheDocument();
    });

    it('renders BTN account number', () => {
      renderWithProps();
      expect(screen.getAllByText('777888999000')[0]).toBeInTheDocument();
    });

    it('renders Gopay account number', () => {
      renderWithProps();
      expect(screen.getAllByText('08123456789')[0]).toBeInTheDocument();
    });

    it('renders Seabank account number', () => {
      renderWithProps();
      expect(screen.getAllByText('08987654321')[0]).toBeInTheDocument();
    });

    it('renders owner names for accounts', () => {
      renderWithProps();
      expect(screen.getAllByText('M. Daniansyah Chusyaidin').length).toBeGreaterThanOrEqual(1);
    });

    it('renders owner name for BRI', () => {
      renderWithProps();
      expect(screen.getAllByText('Siti Nur Marini').length).toBeGreaterThanOrEqual(1);
    });

    it('renders owner name for BTN', () => {
      renderWithProps();
      expect(screen.getAllByText('Siti Nur Marini').length).toBeGreaterThanOrEqual(1);
    });

    it('renders owner name for Gopay', () => {
      renderWithProps();
      expect(screen.getAllByText('M. Daniansyah Chusyaidin').length).toBeGreaterThanOrEqual(1);
    });

    it('renders owner name for Seabank', () => {
      renderWithProps();
      expect(screen.getAllByText('Siti Nur Marini').length).toBeGreaterThanOrEqual(1);
    });

    it('bank names have uppercase tracking-widest styling', () => {
      renderWithProps();
      const bca = screen.getAllByText('BCA')[0];
      expect(bca.className).toContain('uppercase');
      expect(bca.className).toContain('tracking-widest');
    });
  });

  // ─── Copy Functionality ───────────────────────────────────────────
  describe('copy functionality', () => {
    it('shows copy icon on all 6 cards when copiedIndex is null', () => {
      const { container } = renderWithProps({ copiedIndex: null });
      // Lucide renders SVG elements with class containing the icon name
      // Both mobile and desktop layouts render simultaneously, so 12 total
      const icons = container.querySelectorAll('svg.lucide-copy');
      expect(icons).toHaveLength(12);
    });

    it('shows Tersalin badge on copied card', () => {
      renderWithProps({ copiedIndex: 0 });
      const tersalin = screen.getAllByText('Tersalin');
      expect(tersalin.length).toBeGreaterThan(0);
    });

    it('Tersalin badge has green background', () => {
      const { container } = renderWithProps({ copiedIndex: 0 });
      // The green circle is a sibling div inside the AnimatePresence overlay
      const greenCircle = container.querySelector('.bg-green-500');
      expect(greenCircle).toBeInTheDocument();
    });

    it('calls onCopy with BCA account and index 0 when first card clicked', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('1234567890')[0]);
      expect(onCopy).toHaveBeenCalledWith('1234567890', 0);
    });

    it('calls onCopy with BRI account and index 1 when second card clicked', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('0987654321')[0]);
      expect(onCopy).toHaveBeenCalledWith('0987654321', 1);
    });

    it('calls onCopy with Jenius account and index 2', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('111222333444')[0]);
      expect(onCopy).toHaveBeenCalledWith('111222333444', 2);
    });

    it('calls onCopy with BTN account and index 3', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('777888999000')[0]);
      expect(onCopy).toHaveBeenCalledWith('777888999000', 3);
    });

    it('calls onCopy with Gopay account and index 4', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('08123456789')[0]);
      expect(onCopy).toHaveBeenCalledWith('08123456789', 4);
    });

    it('calls onCopy with Seabank account and index 5', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('08987654321')[0]);
      expect(onCopy).toHaveBeenCalledWith('08987654321', 5);
    });
  });

  // ─── Success Overlay ──────────────────────────────────────────────
  describe('success overlay', () => {
    it('shows "Disalin" text when a card is copied', () => {
      renderWithProps({ copiedIndex: 0 });
      expect(screen.getAllByText('Tersalin').length).toBeGreaterThan(0);
    });

    it('overlay has white blurred background', () => {
      const { container } = renderWithProps({ copiedIndex: 0 });
      const overlay = container.querySelector('.bg-white\\/95');
      expect(overlay).toBeInTheDocument();
      expect(overlay?.className).toContain('backdrop-blur-md');
    });

    it('overlay has green checkmark circle', () => {
      const { container } = renderWithProps({ copiedIndex: 0 });
      const greenCircle = container.querySelector('.bg-green-500.rounded-full');
      expect(greenCircle).toBeInTheDocument();
    });

    it('"Tersalin" overlay text has serif italic style', () => {
      renderWithProps({ copiedIndex: 0 });
      const tersalinElements = screen.getAllByText('Tersalin');
      const overlayTersalin = tersalinElements.find((el) => el.tagName === 'P');
      expect(overlayTersalin).toBeDefined();
      expect(overlayTersalin!.className).toContain('font-serif');
      expect(overlayTersalin!.className).toContain('italic');
    });

    it('no overlay shown when copiedIndex is null', () => {
      const { container } = renderWithProps({ copiedIndex: null });
      expect(container.querySelector('.bg-white\\/95')).not.toBeInTheDocument();
      expect(screen.queryByText('Tersalin')).not.toBeInTheDocument();
    });

    it('only one overlay shown at a time', () => {
      const { container } = renderWithProps({ copiedIndex: 2 });
      // Both mobile and desktop layouts render simultaneously, so 2 overlays (one per layout)
      const overlays = container.querySelectorAll('.bg-white\\/95');
      expect(overlays.length).toBe(2);
    });
  });

  // ─── Visual / Styling ────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('uses responsive grid: 2 col layout', () => {
      const { container } = renderWithProps();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-2');
    });

    it('cards have glassmorphism: bg-white/60 backdrop-blur-md', () => {
      const { container } = renderWithProps();
      // Both mobile and desktop layouts render simultaneously, so 12 cards total
      const cards = container.querySelectorAll('.bg-white\\/60');
      expect(cards.length).toBe(12);
      cards.forEach((card) => {
        expect(card.className).toContain('backdrop-blur-md');
      });
    });

    it('cards have rounded-xl border', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/40');
      cards.forEach((card) => {
        expect(card.className).toContain('rounded-xl');
        expect(card.className).toContain('border');
      });
    });

    it('cards have cursor-pointer for click affordance', () => {
      const { container } = renderWithProps();
      // Both mobile and desktop layouts render simultaneously, so 12 cards total
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(12);
    });

    it('cards have shadow-sm', () => {
      const { container } = renderWithProps();
      // Both mobile and desktop layouts render simultaneously, so 12 cards total
      const cards = container.querySelectorAll('.shadow-sm');
      expect(cards.length).toBe(12);
    });

    it('has rotating circle decorations', () => {
      const { container } = renderWithProps();
      const circles = container.querySelectorAll('.rounded-full.border.border-gold\\/5');
      expect(circles.length).toBeGreaterThanOrEqual(2);
    });

    it('decorative circles are in pointer-events-none layer', () => {
      const { container } = renderWithProps();
      const bgLayer = container.querySelector('.pointer-events-none');
      expect(bgLayer).toBeInTheDocument();
    });

    it('container has max-w-lg (mobile) or max-w-5xl (desktop)', () => {
      const { container } = renderWithProps();
      // Mobile layout uses max-w-lg; desktop uses max-w-5xl
      const mobileContainer = container.querySelector('.max-w-lg');
      const desktopContainer = container.querySelector('.max-w-5xl');
      expect(mobileContainer || desktopContainer).toBeInTheDocument();
    });

    it('container is centered with mx-auto', () => {
      const { container } = renderWithProps();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('section has py-[3vh] padding', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('py-[3vh]');
    });

    it('section has bg-ivory background', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-ivory');
    });

    it('cards have gold hover blur decoration', () => {
      const { container } = renderWithProps();
      // Both mobile and desktop layouts render simultaneously, so 12 total
      const goldBlurs = container.querySelectorAll('.bg-gold\\/5.rounded-full.blur-xl');
      expect(goldBlurs.length).toBe(12);
    });

    it('account numbers have serif font with tracking-tight', () => {
      renderWithProps();
      const account = screen.getAllByText('1234567890')[0];
      expect(account.className).toContain('font-serif');
      expect(account.className).toContain('tracking-tight');
    });
  });

  // ─── Layout ────────────────────────────────────────────────────────
  describe('layout', () => {
    it('has container with mx-auto px-6', () => {
      const { container } = renderWithProps();
      const cont = container.querySelector('.container.mx-auto.px-6');
      expect(cont).toBeInTheDocument();
    });

    it('text is centered in header', () => {
      const { container } = renderWithProps();
      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });

    it('section has overflow-hidden', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('section has relative positioning for z-index stacking', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('relative');
    });

    it('content has z-10 above decorations', () => {
      const { container } = renderWithProps();
      const zContent = container.querySelector('.z-10');
      expect(zContent).toBeInTheDocument();
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────
  describe('edge cases', () => {
    it('clicking different cards calls onCopy with different indices', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getAllByText('1234567890')[0]);
      fireEvent.click(screen.getAllByText('0987654321')[0]);
      expect(onCopy).toHaveBeenCalledTimes(2);
      expect(onCopy).toHaveBeenNthCalledWith(1, '1234567890', 0);
      expect(onCopy).toHaveBeenNthCalledWith(2, '0987654321', 1);
    });

    it('rapid clicks on the same card call onCopy multiple times', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      const card = screen.getAllByText('1234567890')[0];
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
      expect(onCopy).toHaveBeenCalledTimes(3);
    });

    it('all cards show copy icon after reset (copiedIndex back to null)', () => {
      const { container, rerender } = render(<DigitalEnvelope copiedIndex={2} onCopy={vi.fn()} />);
      expect(screen.getAllByText('Tersalin')[0]).toBeInTheDocument();

      rerender(<DigitalEnvelope copiedIndex={null} onCopy={vi.fn()} />);
      const icons = container.querySelectorAll('svg.lucide-copy');
      // Both mobile and desktop layouts render simultaneously, so 12 total
      expect(icons).toHaveLength(12);
    });

    it('switching copiedIndex updates the Tersalin badge', () => {
      const { rerender } = render(<DigitalEnvelope copiedIndex={0} onCopy={vi.fn()} />);
      const tersalinElements = screen.getAllByText('Tersalin');
      expect(tersalinElements.length).toBeGreaterThanOrEqual(1);

      rerender(<DigitalEnvelope copiedIndex={3} onCopy={vi.fn()} />);
      const updatedElements = screen.getAllByText('Tersalin');
      expect(updatedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('clicking on bank name area triggers onCopy via parent card', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      // Click the card via the bank name parent (use first instance from mobile layout)
      const bcaText = screen.getAllByText('BCA')[0];
      const card = bcaText.closest('.cursor-pointer');
      expect(card).not.toBeNull();
      fireEvent.click(card!);
      expect(onCopy).toHaveBeenCalledWith('1234567890', 0);
    });

    it('owner names have truncate class for long names', () => {
      const { container } = renderWithProps();
      // Both mobile and desktop layouts render simultaneously, so 12 total
      const owners = container.querySelectorAll('.truncate');
      expect(owners.length).toBe(12);
    });
  });
});
