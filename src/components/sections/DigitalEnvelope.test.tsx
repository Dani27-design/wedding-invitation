import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      expect(screen.getByText('Tanda Kasih')).toBeInTheDocument();
    });

    it('title has uppercase serif italic styling', () => {
      renderWithProps();
      const title = screen.getByText('Tanda Kasih');
      expect(title.className).toContain('font-serif');
      expect(title.className).toContain('italic');
      expect(title.className).toContain('uppercase');
    });

    it('displays description text about kehadiran dan doa', () => {
      renderWithProps();
      expect(screen.getByText(/Kehadiran dan doa Anda adalah kado terindah/)).toBeInTheDocument();
    });

    it('renders consistently on re-render', () => {
      const { rerender } = render(<DigitalEnvelope {...defaultProps} />);
      rerender(<DigitalEnvelope {...defaultProps} />);
      expect(screen.getByText('Tanda Kasih')).toBeInTheDocument();
    });

    it('has Gift icon in header', () => {
      const { container } = renderWithProps();
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  // ─── Bank Accounts ────────────────────────────────────────────────
  describe('bank accounts', () => {
    it('renders all 6 bank names', () => {
      renderWithProps();
      expect(screen.getByText('BCA')).toBeInTheDocument();
      expect(screen.getByText('BRI')).toBeInTheDocument();
      expect(screen.getByText('Mandiri')).toBeInTheDocument();
      expect(screen.getByText('BSI')).toBeInTheDocument();
      expect(screen.getByText('Gopay')).toBeInTheDocument();
      expect(screen.getByText('DANA')).toBeInTheDocument();
    });

    it('renders BCA account number', () => {
      renderWithProps();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('renders BRI account number', () => {
      renderWithProps();
      expect(screen.getByText('0987654321')).toBeInTheDocument();
    });

    it('renders Mandiri account number', () => {
      renderWithProps();
      expect(screen.getByText('111222333444')).toBeInTheDocument();
    });

    it('renders BSI account number', () => {
      renderWithProps();
      expect(screen.getByText('777888999000')).toBeInTheDocument();
    });

    it('renders Gopay account number', () => {
      renderWithProps();
      expect(screen.getByText('08123456789')).toBeInTheDocument();
    });

    it('renders DANA account number', () => {
      renderWithProps();
      expect(screen.getByText('08987654321')).toBeInTheDocument();
    });

    it('renders owner names for accounts', () => {
      renderWithProps();
      expect(screen.getAllByText('A/N M. Daniansyah C.').length).toBeGreaterThanOrEqual(1);
    });

    it('renders owner name for BRI', () => {
      renderWithProps();
      expect(screen.getByText('A/N Siti Nur Marini')).toBeInTheDocument();
    });

    it('renders owner name for BSI', () => {
      renderWithProps();
      expect(screen.getByText('A/N Siti Nur M.')).toBeInTheDocument();
    });

    it('renders owner name for Gopay', () => {
      renderWithProps();
      expect(screen.getByText('A/N Daniansyah')).toBeInTheDocument();
    });

    it('renders owner name for DANA', () => {
      renderWithProps();
      expect(screen.getByText('A/N Siti Nur')).toBeInTheDocument();
    });

    it('bank names have uppercase tracking-widest styling', () => {
      renderWithProps();
      const bca = screen.getByText('BCA');
      expect(bca.className).toContain('uppercase');
      expect(bca.className).toContain('tracking-widest');
    });
  });

  // ─── Copy Functionality ───────────────────────────────────────────
  describe('copy functionality', () => {
    it('shows "Salin" on all 6 cards when copiedIndex is null', () => {
      renderWithProps({ copiedIndex: null });
      const salinButtons = screen.getAllByText('Salin');
      expect(salinButtons).toHaveLength(6);
    });

    it('shows "Tersalin" on first card when copiedIndex=0', () => {
      renderWithProps({ copiedIndex: 0 });
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
    });

    it('shows "Tersalin" on second card when copiedIndex=1', () => {
      renderWithProps({ copiedIndex: 1 });
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
      expect(screen.getAllByText('Salin')).toHaveLength(5);
    });

    it('shows "Tersalin" on last card when copiedIndex=5', () => {
      renderWithProps({ copiedIndex: 5 });
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
      expect(screen.getAllByText('Salin')).toHaveLength(5);
    });

    it('Tersalin badge has green background', () => {
      renderWithProps({ copiedIndex: 0 });
      const tersalin = screen.getByText('Tersalin');
      expect(tersalin.className).toContain('bg-green-500');
      expect(tersalin.className).toContain('text-white');
    });

    it('Salin badge has gold styling', () => {
      renderWithProps({ copiedIndex: null });
      const salins = screen.getAllByText('Salin');
      salins.forEach((salin) => {
        expect(salin.className).toContain('bg-gold/5');
        expect(salin.className).toContain('text-gold/50');
      });
    });

    it('calls onCopy with BCA account and index 0 when first card clicked', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('1234567890'));
      expect(onCopy).toHaveBeenCalledWith('1234567890', 0);
    });

    it('calls onCopy with BRI account and index 1 when second card clicked', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('0987654321'));
      expect(onCopy).toHaveBeenCalledWith('0987654321', 1);
    });

    it('calls onCopy with Mandiri account and index 2', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('111222333444'));
      expect(onCopy).toHaveBeenCalledWith('111222333444', 2);
    });

    it('calls onCopy with BSI account and index 3', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('777888999000'));
      expect(onCopy).toHaveBeenCalledWith('777888999000', 3);
    });

    it('calls onCopy with Gopay account and index 4', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('08123456789'));
      expect(onCopy).toHaveBeenCalledWith('08123456789', 4);
    });

    it('calls onCopy with DANA account and index 5', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      fireEvent.click(screen.getByText('08987654321'));
      expect(onCopy).toHaveBeenCalledWith('08987654321', 5);
    });
  });

  // ─── Success Overlay ──────────────────────────────────────────────
  describe('success overlay', () => {
    it('shows "Disalin" text when a card is copied', () => {
      renderWithProps({ copiedIndex: 0 });
      expect(screen.getByText('Disalin')).toBeInTheDocument();
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

    it('"Disalin" text has serif italic style', () => {
      renderWithProps({ copiedIndex: 0 });
      const disalin = screen.getByText('Disalin');
      expect(disalin.className).toContain('font-serif');
      expect(disalin.className).toContain('italic');
    });

    it('no overlay shown when copiedIndex is null', () => {
      const { container } = renderWithProps({ copiedIndex: null });
      expect(container.querySelector('.bg-white\\/95')).not.toBeInTheDocument();
      expect(screen.queryByText('Disalin')).not.toBeInTheDocument();
    });

    it('only one overlay shown at a time', () => {
      const { container } = renderWithProps({ copiedIndex: 2 });
      const overlays = container.querySelectorAll('.bg-white\\/95');
      expect(overlays.length).toBe(1);
    });
  });

  // ─── Visual / Styling ────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('uses responsive grid: 1 col -> 2 col -> 3 col', () => {
      const { container } = renderWithProps();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-2');
      expect(grid?.className).toContain('lg:grid-cols-3');
    });

    it('cards have glassmorphism: bg-white/40 backdrop-blur-md', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.bg-white\\/40');
      expect(cards.length).toBe(6);
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
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(6);
    });

    it('cards have shadow-sm', () => {
      const { container } = renderWithProps();
      const cards = container.querySelectorAll('.shadow-sm');
      expect(cards.length).toBe(6);
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

    it('container has max-w-4xl', () => {
      const { container } = renderWithProps();
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('container is centered with mx-auto', () => {
      const { container } = renderWithProps();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('section has py-6 padding', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('py-6');
    });

    it('section has bg-ivory background', () => {
      const { container } = renderWithProps();
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-ivory');
    });

    it('cards have gold hover blur decoration', () => {
      const { container } = renderWithProps();
      const goldBlurs = container.querySelectorAll('.bg-gold\\/5.rounded-full.blur-xl');
      expect(goldBlurs.length).toBe(6);
    });

    it('account numbers have serif font with tracking-tight', () => {
      renderWithProps();
      const account = screen.getByText('1234567890');
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
      fireEvent.click(screen.getByText('1234567890'));
      fireEvent.click(screen.getByText('0987654321'));
      expect(onCopy).toHaveBeenCalledTimes(2);
      expect(onCopy).toHaveBeenNthCalledWith(1, '1234567890', 0);
      expect(onCopy).toHaveBeenNthCalledWith(2, '0987654321', 1);
    });

    it('rapid clicks on the same card call onCopy multiple times', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      const card = screen.getByText('1234567890');
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
      expect(onCopy).toHaveBeenCalledTimes(3);
    });

    it('all cards show Salin after reset (copiedIndex back to null)', () => {
      const { rerender } = render(<DigitalEnvelope copiedIndex={2} onCopy={vi.fn()} />);
      expect(screen.getByText('Tersalin')).toBeInTheDocument();

      rerender(<DigitalEnvelope copiedIndex={null} onCopy={vi.fn()} />);
      expect(screen.queryByText('Tersalin')).not.toBeInTheDocument();
      expect(screen.getAllByText('Salin')).toHaveLength(6);
    });

    it('switching copiedIndex moves the Tersalin badge', () => {
      const { rerender } = render(<DigitalEnvelope copiedIndex={0} onCopy={vi.fn()} />);
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
      expect(screen.getAllByText('Salin')).toHaveLength(5);

      rerender(<DigitalEnvelope copiedIndex={3} onCopy={vi.fn()} />);
      expect(screen.getByText('Tersalin')).toBeInTheDocument();
      expect(screen.getAllByText('Salin')).toHaveLength(5);
    });

    it('clicking on bank name area triggers onCopy via parent card', () => {
      const onCopy = vi.fn();
      renderWithProps({ onCopy });
      // Click the card via the bank name parent
      const bcaText = screen.getByText('BCA');
      const card = bcaText.closest('.cursor-pointer');
      expect(card).not.toBeNull();
      fireEvent.click(card!);
      expect(onCopy).toHaveBeenCalledWith('1234567890', 0);
    });

    it('owner names have truncate class for long names', () => {
      const { container } = renderWithProps();
      const owners = container.querySelectorAll('.truncate');
      expect(owners.length).toBe(6);
    });
  });
});
