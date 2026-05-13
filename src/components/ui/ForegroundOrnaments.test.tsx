import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ForegroundOrnaments } from './ForegroundOrnaments';

describe('ForegroundOrnaments', () => {
  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('does not render any visible text (purely decorative)', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.textContent).toBe('');
    });

    it('does not render any images', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('does not render any interactive elements', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });

    it('does not render SVGs', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Pointer events
  // ---------------------------------------------------------------------------
  describe('pointer-events-none', () => {
    it('root container has pointer-events-none', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('no element inside is clickable or interactive', () => {
      const { container } = render(<ForegroundOrnaments />);
      const allElements = container.querySelectorAll('*');
      const interactive = Array.from(allElements).filter((el) =>
        ['button', 'a', 'input', 'textarea', 'select'].includes(el.tagName.toLowerCase())
      );
      expect(interactive).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Overflow hidden
  // ---------------------------------------------------------------------------
  describe('overflow hidden', () => {
    it('root container has overflow-hidden to prevent layout shift', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Exactly 2 blur ornament elements
  // ---------------------------------------------------------------------------
  describe('two ornament elements', () => {
    it('renders exactly 2 blur elements', () => {
      const { container } = render(<ForegroundOrnaments />);
      const blurElements = container.querySelectorAll('[class*="blur-"]');
      expect(blurElements).toHaveLength(2);
    });

    it('root container has exactly 2 children', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(2);
    });

    it('first ornament is a div', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0].tagName).toBe('DIV');
    });

    it('second ornament is a div', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1].tagName).toBe('DIV');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Absolute positioning on both ornaments
  // ---------------------------------------------------------------------------
  describe('absolute positioning', () => {
    it('root container has absolute positioning', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toHaveClass('absolute');
    });

    it('first ornament has absolute positioning', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0]).toHaveClass('absolute');
    });

    it('second ornament has absolute positioning', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1]).toHaveClass('absolute');
    });

    it('container uses inset-0 for full coverage', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.firstChild).toHaveClass('inset-0');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Rounded-full shape
  // ---------------------------------------------------------------------------
  describe('rounded-full shape', () => {
    it('first ornament has rounded-full', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0]).toHaveClass('rounded-full');
    });

    it('second ornament has rounded-full', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1]).toHaveClass('rounded-full');
    });
  });
// ---------------------------------------------------------------------------
// 8. Shadow

  // 8. Different sizes for each ornament
  // ---------------------------------------------------------------------------
  describe('different sizes for ornaments', () => {
    it('first ornament has w-80 h-80 dimensions', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0]).toHaveClass('w-80', 'h-80');
    });

    it('second ornament has w-96 h-96 dimensions', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1]).toHaveClass('w-96', 'h-96');
    });

    it('ornaments have different sizes (not identical)', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      const firstClasses = root.children[0].className;
      const secondClasses = root.children[1].className;
      expect(firstClasses).not.toBe(secondClasses);
    });

    it('first ornament has blur-[60px]', () => {
      const { container } = render(<ForegroundOrnaments />);
      const el = container.querySelector('.blur-\\[60px\\]');
      expect(el).toBeInTheDocument();
    });

    it('second ornament has blur-[80px]', () => {
      const { container } = render(<ForegroundOrnaments />);
      const el = container.querySelector('.blur-\\[80px\\]');
      expect(el).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Position offsets (bottom-left, top-right)
  // ---------------------------------------------------------------------------
  describe('position offsets', () => {
    it('first ornament is positioned at bottom-left', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0]).toHaveClass('-bottom-20', '-left-20');
    });

    it('second ornament is positioned at top-right', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1]).toHaveClass('-top-20', '-right-20');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Color themes
  // ---------------------------------------------------------------------------
  describe('color themes', () => {
    it('first ornament uses ink color', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0].className).toContain('bg-ink/10');
    });

    it('second ornament uses gold color', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[1].className).toContain('bg-gold/5');
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders without duplicating ornaments', () => {
      const { container, rerender } = render(<ForegroundOrnaments />);
      rerender(<ForegroundOrnaments />);
      const blurs = container.querySelectorAll('[class*="blur-"]');
      expect(blurs).toHaveLength(2);
    });

    it('re-renders 5 times without extra children', () => {
      const { container, rerender } = render(<ForegroundOrnaments />);
      for (let i = 0; i < 5; i++) {
        rerender(<ForegroundOrnaments />);
      }
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(2);
    });

    it('maintains structure identity after re-render', () => {
      const { container, rerender } = render(<ForegroundOrnaments />);
      const before = container.innerHTML;
      rerender(<ForegroundOrnaments />);
      expect(container.innerHTML).toBe(before);
    });

    it('keeps all required classes on root after re-render', () => {
      const { container, rerender } = render(<ForegroundOrnaments />);
      rerender(<ForegroundOrnaments />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('root is attached to the DOM after mount', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(document.body.contains(container.firstChild)).toBe(true);
    });

    it('no inline width/height styles that cause layout shift', () => {
      const { container } = render(<ForegroundOrnaments />);
      const root = container.firstChild as HTMLElement;
      expect(root.style.width).toBe('');
      expect(root.style.height).toBe('');
    });

    it('does not produce console errors on render', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<ForegroundOrnaments />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not produce console warnings on render', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<ForegroundOrnaments />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Snapshot stability
  // ---------------------------------------------------------------------------
  describe('snapshot stability', () => {
    it('matches snapshot on first render', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('snapshot is identical after re-render', () => {
      const { container, rerender } = render(<ForegroundOrnaments />);
      const snap1 = container.innerHTML;
      rerender(<ForegroundOrnaments />);
      expect(container.innerHTML).toBe(snap1);
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered inside a fragment', () => {
      const { container } = render(
        <>
          <ForegroundOrnaments />
        </>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('can be rendered alongside siblings', () => {
      const { container } = render(
        <div>
          <ForegroundOrnaments />
          <div data-testid="sibling">other</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(container.querySelectorAll('[class*="blur-"]')).toHaveLength(2);
    });

    it('multiple instances render independently', () => {
      const { container } = render(
        <div>
          <ForegroundOrnaments />
          <ForegroundOrnaments />
        </div>
      );
      const blurs = container.querySelectorAll('[class*="blur-"]');
      expect(blurs).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Accessibility (decorative)
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('[role]')).toHaveLength(0);
    });

    it('has no aria-label', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('[aria-label]')).toHaveLength(0);
    });

    it('has no tab-focusable elements', () => {
      const { container } = render(<ForegroundOrnaments />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });
});
