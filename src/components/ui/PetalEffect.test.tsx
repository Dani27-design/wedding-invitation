import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PetalEffect } from './PetalEffect';

describe('PetalEffect', () => {
  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('does not render any visible text', () => {
      const { container } = render(<PetalEffect />);
      expect(container.textContent).toBe('');
    });

    it('does not render images', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('does not render interactive elements', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });

    it('does not render SVGs', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Exactly 15 particles
  // ---------------------------------------------------------------------------
  describe('particle count', () => {
    it('renders exactly 15 particle elements', () => {
      const { container } = render(<PetalEffect />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles).toHaveLength(15);
    });

    it('root has exactly 15 direct children (motion wrappers)', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(15);
    });

    it('particles are the motion divs themselves (no nested inner div)', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      // Each child is the particle directly (no extra wrapper inside)
      Array.from(root.children).forEach((child) => {
        expect(child).toHaveClass('rounded-full');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Pointer events
  // ---------------------------------------------------------------------------
  describe('pointer-events-none', () => {
    it('root container has pointer-events-none', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('no element within is interactive', () => {
      const { container } = render(<PetalEffect />);
      const allElements = container.querySelectorAll('*');
      const interactive = Array.from(allElements).filter((el) =>
        ['button', 'a', 'input', 'textarea', 'select'].includes(el.tagName.toLowerCase())
      );
      expect(interactive).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Overflow hidden
  // ---------------------------------------------------------------------------
  describe('overflow hidden', () => {
    it('root container has overflow-hidden to prevent scrollbar glitch', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Particles are rounded-full
  // ---------------------------------------------------------------------------
  describe('rounded-full shape', () => {
    it('all 15 particles have rounded-full', () => {
      const { container } = render(<PetalEffect />);
      const roundedElements = container.querySelectorAll('.rounded-full');
      expect(roundedElements).toHaveLength(15);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Particles have blur
  // ---------------------------------------------------------------------------
  describe('blur effect', () => {
    it('all particles have blur-[0.5px]', () => {
      const { container } = render(<PetalEffect />);
      const blurs = container.querySelectorAll('.blur-\\[0\\.5px\\]');
      expect(blurs).toHaveLength(15);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Z-10 layering
  // ---------------------------------------------------------------------------
  describe('z-index layering', () => {
    it('container has z-10', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toHaveClass('z-10');
    });

    it('particles do not have their own z-index', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((child) => {
        expect(child.className).not.toMatch(/\bz-\d/);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Container has inset-0
  // ---------------------------------------------------------------------------
  describe('inset-0', () => {
    it('container uses inset-0 for full coverage', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toHaveClass('inset-0');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Absolute positioning
  // ---------------------------------------------------------------------------
  describe('absolute positioning', () => {
    it('root container has absolute positioning', () => {
      const { container } = render(<PetalEffect />);
      expect(container.firstChild).toHaveClass('absolute');
    });

    it('each particle has absolute positioning', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((child) => {
        expect(child).toHaveClass('absolute');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Small size (w-1.5 h-1.5)
  // ---------------------------------------------------------------------------
  describe('particle dimensions', () => {
    it('particles have w-1.5 width', () => {
      const { container } = render(<PetalEffect />);
      const particles = container.querySelectorAll('.w-1\\.5');
      expect(particles).toHaveLength(15);
    });

    it('particles have h-1.5 height', () => {
      const { container } = render(<PetalEffect />);
      const particles = container.querySelectorAll('.h-1\\.5');
      expect(particles).toHaveLength(15);
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Rose-pastel color
  // ---------------------------------------------------------------------------
  describe('color', () => {
    it('particles use rose-pastel background', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((child) => {
        expect(child.className).toContain('bg-rose-pastel/15');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders maintain exactly 15 particles', () => {
      const { container, rerender } = render(<PetalEffect />);
      rerender(<PetalEffect />);
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(15);
    });

    it('re-renders 5 times without duplication', () => {
      const { container, rerender } = render(<PetalEffect />);
      for (let i = 0; i < 5; i++) {
        rerender(<PetalEffect />);
      }
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(15);
    });

    it('particle count stays 15 across 10 re-renders', () => {
      const { container, rerender } = render(<PetalEffect />);
      for (let i = 0; i < 10; i++) {
        rerender(<PetalEffect />);
        expect(container.querySelectorAll('.rounded-full')).toHaveLength(15);
      }
    });

    it('root keeps all required classes after re-render', () => {
      const { container, rerender } = render(<PetalEffect />);
      rerender(<PetalEffect />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden', 'z-10');
    });

    it('HTML structure is identical after re-render', () => {
      const { container, rerender } = render(<PetalEffect />);
      const before = container.innerHTML;
      rerender(<PetalEffect />);
      expect(container.innerHTML).toBe(before);
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('root is in the DOM after mount', () => {
      const { container } = render(<PetalEffect />);
      expect(document.body.contains(container.firstChild)).toBe(true);
    });

    it('all particles are in the DOM', () => {
      const { container } = render(<PetalEffect />);
      const particles = container.querySelectorAll('.rounded-full');
      particles.forEach((p) => {
        expect(document.body.contains(p)).toBe(true);
      });
    });

    it('no inline layout-shifting styles on root', () => {
      const { container } = render(<PetalEffect />);
      const root = container.firstChild as HTMLElement;
      expect(root.style.width).toBe('');
      expect(root.style.height).toBe('');
    });

    it('does not produce console errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<PetalEffect />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not produce console warnings', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<PetalEffect />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Snapshot stability
  // ---------------------------------------------------------------------------
  describe('snapshot stability', () => {
    it('snapshot is consistent between renders', () => {
      const { container, rerender } = render(<PetalEffect />);
      const snap1 = container.innerHTML;
      rerender(<PetalEffect />);
      expect(container.innerHTML).toBe(snap1);
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered in a fragment', () => {
      const { container } = render(
        <>
          <PetalEffect />
        </>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders alongside siblings without conflict', () => {
      const { container } = render(
        <div>
          <PetalEffect />
          <div data-testid="sibling">hello</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(15);
    });

    it('multiple instances render independently', () => {
      const { container } = render(
        <div>
          <PetalEffect />
          <PetalEffect />
        </div>
      );
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(30);
    });
  });

  // ---------------------------------------------------------------------------
  // 16. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('[role]')).toHaveLength(0);
    });

    it('has no aria-label', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('[aria-label]')).toHaveLength(0);
    });

    it('has no focusable elements', () => {
      const { container } = render(<PetalEffect />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });
});
