import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('renders without errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Four Indonesian time labels
  // ---------------------------------------------------------------------------
  describe('Indonesian time labels', () => {
    it('displays "Hari" label', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(screen.getByText('Hari')).toBeInTheDocument();
    });

    it('displays "Jam" label', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(screen.getByText('Jam')).toBeInTheDocument();
    });

    it('displays "Menit" label', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(screen.getByText('Menit')).toBeInTheDocument();
    });

    it('displays "Detik" label', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(screen.getByText('Detik')).toBeInTheDocument();
    });

    it('displays all 4 labels simultaneously', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const labels = ['Hari', 'Jam', 'Menit', 'Detik'];
      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('labels are rendered as span elements', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari.tagName).toBe('SPAN');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Past date shows "00" for all values
  // ---------------------------------------------------------------------------
  describe('past date behavior', () => {
    it('shows "00" for all 4 units when target date is in the past', () => {
      render(<CountdownTimer targetDate="2020-01-01T00:00:00" />);
      const zeros = screen.getAllByText('00');
      expect(zeros).toHaveLength(4);
    });

    it('shows "00" for very old date (year 2000)', () => {
      render(<CountdownTimer targetDate="2000-06-15T12:00:00" />);
      const zeros = screen.getAllByText('00');
      expect(zeros).toHaveLength(4);
    });

    it('shows "00" for yesterday', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      render(<CountdownTimer targetDate={yesterday} />);
      const zeros = screen.getAllByText('00');
      expect(zeros).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Numbers are zero-padded (2 digits)
  // ---------------------------------------------------------------------------
  describe('zero-padded numbers', () => {
    it('all displayed numbers are 2 digits', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const numbers = screen.getAllByText(/^\d{2}$/);
      expect(numbers).toHaveLength(4);
    });

    it('past date shows "00" not "0"', () => {
      render(<CountdownTimer targetDate="2020-01-01T00:00:00" />);
      const zeros = screen.getAllByText('00');
      expect(zeros).toHaveLength(4);
      expect(screen.queryByText('0')).toBeNull();
    });

    it('no single-digit numbers are displayed', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const singleDigits = screen.queryAllByText(/^\d$/);
      expect(singleDigits).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Gold aura element
  // ---------------------------------------------------------------------------
  describe('gold aura / pulse element', () => {
    it('has an animate-pulse element for gold aura', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThanOrEqual(1);
    });

    it('aura has gold background', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      const hasGold = Array.from(pulseElements).some((el) =>
        el.className.includes('bg-gold/10')
      );
      expect(hasGold).toBe(true);
    });

    it('aura has blur-xl for soft glow', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      const hasBlur = Array.from(pulseElements).some((el) =>
        el.className.includes('blur-xl')
      );
      expect(hasBlur).toBe(true);
    });

    it('aura has rounded-full', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      const hasRounded = Array.from(pulseElements).some((el) =>
        el.className.includes('rounded-full')
      );
      expect(hasRounded).toBe(true);
    });

    it('aura has negative z-index (behind text)', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      const hasBehind = Array.from(pulseElements).some((el) =>
        el.className.includes('-z-10')
      );
      expect(hasBehind).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Labels typography (uppercase, tracking)
  // ---------------------------------------------------------------------------
  describe('label typography', () => {
    it('labels have uppercase class', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari).toHaveClass('uppercase');
    });

    it('labels have tracking (letter-spacing)', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari.className).toMatch(/tracking-\[/);
    });

    it('labels use font-sans', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari).toHaveClass('font-sans');
    });

    it('labels have gold color', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari.className).toContain('text-gold/80');
    });

    it('labels have font-bold', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari).toHaveClass('font-bold');
    });

    it('labels have small font size', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari.className).toMatch(/text-\[/);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Container max-width constraint
  // ---------------------------------------------------------------------------
  describe('container constraints', () => {
    it('has max-w-xl constraint', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toHaveClass('max-w-xl');
    });

    it('has mx-auto for centering', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toHaveClass('mx-auto');
    });

    it('has w-full', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('has horizontal padding px-4', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.firstChild).toHaveClass('px-4');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Responsive gap classes
  // ---------------------------------------------------------------------------
  describe('responsive gap', () => {
    it('has gap-1 for mobile', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      expect(flexContainer).toHaveClass('gap-1');
    });

    it('has md:gap-14 for desktop', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      expect(flexContainer).toHaveClass('md:gap-14');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Z-30 layering
  // ---------------------------------------------------------------------------
  describe('z-index layering', () => {
    it('flex container has z-30', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      expect(flexContainer).toHaveClass('z-30');
    });

    it('flex container has relative positioning', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      expect(flexContainer).toHaveClass('relative');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Structure has 4 TimeBox children
  // ---------------------------------------------------------------------------
  describe('TimeBox structure', () => {
    it('flex container has 4 children (TimeBox elements)', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      expect(flexContainer?.children.length).toBe(4);
    });

    it('each TimeBox has flex-col layout', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      if (flexContainer) {
        Array.from(flexContainer.children).forEach((child) => {
          expect(child).toHaveClass('flex-col');
        });
      }
    });

    it('each TimeBox has items-center', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      if (flexContainer) {
        Array.from(flexContainer.children).forEach((child) => {
          expect(child).toHaveClass('items-center');
        });
      }
    });

    it('each TimeBox has flex-1 and min-w-0 for flexible sizing', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const flexContainer = container.querySelector('.flex.justify-center');
      if (flexContainer) {
        Array.from(flexContainer.children).forEach((child) => {
          expect(child).toHaveClass('flex-1', 'min-w-0');
        });
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Number typography
  // ---------------------------------------------------------------------------
  describe('number typography', () => {
    it('numbers use font-serif', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const numbers = screen.getAllByText(/^\d{2}$/);
      numbers.forEach((num) => {
        expect(num).toHaveClass('font-serif');
      });
    });

    it('numbers have responsive text size', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const numbers = screen.getAllByText(/^\d{2}$/);
      numbers.forEach((num) => {
        expect(num.className).toContain('text-3xl');
        expect(num.className).toContain('md:text-5xl');
      });
    });

    it('numbers have font-light', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const numbers = screen.getAllByText(/^\d{2}$/);
      numbers.forEach((num) => {
        expect(num).toHaveClass('font-light');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders without duplicating labels', () => {
      const { rerender } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      rerender(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(screen.getAllByText('Hari')).toHaveLength(1);
      expect(screen.getAllByText('Jam')).toHaveLength(1);
      expect(screen.getAllByText('Menit')).toHaveLength(1);
      expect(screen.getAllByText('Detik')).toHaveLength(1);
    });

    it('re-renders 5 times without glitch', () => {
      const { rerender } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      for (let i = 0; i < 5; i++) {
        rerender(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      }
      expect(screen.getAllByText(/^\d{2}$/)).toHaveLength(4);
    });

    it('changing targetDate to past shows all zeros', () => {
      const { rerender } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      rerender(<CountdownTimer targetDate="2020-01-01T00:00:00" />);
      expect(screen.getAllByText('00')).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('root is in the document', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(document.body.contains(container.firstChild)).toBe(true);
    });

    it('no console warnings', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty string target date gracefully', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<CountdownTimer targetDate="" />);
      expect(container.firstChild).toBeInTheDocument();
      spy.mockRestore();
    });

    it('handles invalid date string', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<CountdownTimer targetDate="not-a-date" />);
      expect(container.firstChild).toBeInTheDocument();
      spy.mockRestore();
    });

    it('renders alongside siblings', () => {
      const { container } = render(
        <div>
          <CountdownTimer targetDate="2030-01-01T00:00:00" />
          <div data-testid="sibling">other</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(screen.getByText('Hari')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no interactive elements that lack labels', () => {
      const { container } = render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
    });

    it('labels are present in DOM', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const hari = screen.getByText('Hari');
      expect(hari).toBeInTheDocument();
    });

    it('numbers are present in DOM', () => {
      render(<CountdownTimer targetDate="2030-01-01T00:00:00" />);
      const numbers = screen.getAllByText(/^\d{2}$/);
      numbers.forEach((num) => {
        expect(num).toBeInTheDocument();
      });
    });
  });
});
