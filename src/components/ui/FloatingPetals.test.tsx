import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FloatingPetals } from './FloatingPetals';

describe('FloatingPetals', () => {
  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('does not render any visible text', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.textContent).toBe('');
    });

    it('does not render images', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('does not render interactive elements', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Exactly 8 petals
  // ---------------------------------------------------------------------------
  describe('petal count', () => {
    it('renders exactly 8 petal elements via transform-gpu', () => {
      const { container } = render(<FloatingPetals />);
      const petals = container.querySelectorAll('.transform-gpu');
      expect(petals).toHaveLength(8);
    });

    it('root container has exactly 8 direct children (motion wrappers)', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(8);
    });

    it('each motion wrapper has exactly 1 petal child', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((wrapper) => {
        expect(wrapper.children.length).toBe(1);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Pointer events
  // ---------------------------------------------------------------------------
  describe('pointer-events-none', () => {
    it('root container has pointer-events-none', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('petals do not block interactions with underlying content', () => {
      const { container } = render(<FloatingPetals />);
      const allElements = container.querySelectorAll('*');
      const interactive = Array.from(allElements).filter((el) =>
        ['button', 'a', 'input'].includes(el.tagName.toLowerCase())
      );
      expect(interactive).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Overflow hidden
  // ---------------------------------------------------------------------------
  describe('overflow hidden', () => {
    it('root container has overflow-hidden to prevent scrollbar from petals', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. transform-gpu for hardware acceleration
  // ---------------------------------------------------------------------------
  describe('hardware acceleration', () => {
    it('all 8 petals use transform-gpu', () => {
      const { container } = render(<FloatingPetals />);
      const gpuElements = container.querySelectorAll('.transform-gpu');
      expect(gpuElements).toHaveLength(8);
    });

    it('transform-gpu is on the inner petal div, not the wrapper', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((wrapper) => {
        expect(wrapper.className).not.toContain('transform-gpu');
        expect(wrapper.children[0]).toHaveClass('transform-gpu');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Absolute positioning
  // ---------------------------------------------------------------------------
  describe('absolute positioning', () => {
    it('root container has absolute positioning', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toHaveClass('absolute');
    });

    it('each petal wrapper has absolute positioning', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((wrapper) => {
        expect(wrapper).toHaveClass('absolute');
      });
    });

    it('container uses inset-0 for full coverage', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.firstChild).toHaveClass('inset-0');
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Z-10 layering
  // ---------------------------------------------------------------------------
  // 8. Blur effect on petals

  // ---------------------------------------------------------------------------
  // 8. Blur effect on petals
  // ---------------------------------------------------------------------------
  describe('blur effect', () => {
    it('all petals have blur-[0.5px]', () => {
      const { container } = render(<FloatingPetals />);
      const blurElements = container.querySelectorAll('.blur-\\[0\\.5px\\]');
      expect(blurElements).toHaveLength(8);
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Shadow on petals
  // ---------------------------------------------------------------------------
  describe('shadow', () => {
    it('all petals have shadow-sm', () => {
      const { container } = render(<FloatingPetals />);
      const shadowElements = container.querySelectorAll('.shadow-sm');
      expect(shadowElements).toHaveLength(8);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Rounded petal shape
  // ---------------------------------------------------------------------------
  describe('petal shape', () => {
    it('petals use custom border-radius for organic petal shape', () => {
      const { container } = render(<FloatingPetals />);
      const petals = container.querySelectorAll('.rounded-\\[100\\%_10\\%_100\\%_10\\%\\]');
      expect(petals).toHaveLength(8);
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Petal dimensions
  // ---------------------------------------------------------------------------
  describe('petal dimensions', () => {
    it('petals have w-4 width', () => {
      const { container } = render(<FloatingPetals />);
      const petals = container.querySelectorAll('.w-4');
      expect(petals).toHaveLength(8);
    });

    it('petals have h-6 height', () => {
      const { container } = render(<FloatingPetals />);
      const petals = container.querySelectorAll('.h-6');
      expect(petals).toHaveLength(8);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Gold color
  // ---------------------------------------------------------------------------
  describe('color', () => {
    it('petals use gold background with low opacity', () => {
      const { container } = render(<FloatingPetals />);
      const petals = container.querySelectorAll('.transform-gpu');
      Array.from(petals).forEach((petal) => {
        expect(petal.className).toContain('bg-gold/5');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders maintain exactly 8 petals', () => {
      const { container, rerender } = render(<FloatingPetals />);
      rerender(<FloatingPetals />);
      const petals = container.querySelectorAll('.transform-gpu');
      expect(petals).toHaveLength(8);
    });

    it('re-renders 5 times without duplication', () => {
      const { container, rerender } = render(<FloatingPetals />);
      for (let i = 0; i < 5; i++) {
        rerender(<FloatingPetals />);
      }
      expect(container.querySelectorAll('.transform-gpu')).toHaveLength(8);
    });

    it('root container has required classes after re-render', () => {
      const { container, rerender } = render(<FloatingPetals />);
      rerender(<FloatingPetals />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden');
    });

    it('petal count stays consistent across multiple re-renders', () => {
      const { container, rerender } = render(<FloatingPetals />);
      for (let i = 0; i < 10; i++) {
        rerender(<FloatingPetals />);
        const count = container.querySelectorAll('.transform-gpu').length;
        expect(count).toBe(8);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('root is in the document after mount', () => {
      const { container } = render(<FloatingPetals />);
      expect(document.body.contains(container.firstChild)).toBe(true);
    });

    it('no inline layout-shifting styles on root', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      expect(root.style.width).toBe('');
      expect(root.style.height).toBe('');
    });

    it('does not produce console errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<FloatingPetals />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not produce console warnings', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<FloatingPetals />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('all 8 petal wrappers are attached to the DOM', () => {
      const { container } = render(<FloatingPetals />);
      const root = container.firstChild as HTMLElement;
      Array.from(root.children).forEach((child) => {
        expect(document.body.contains(child)).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Snapshot
  // ---------------------------------------------------------------------------
  describe('snapshot stability', () => {
    it('snapshot is consistent between renders', () => {
      const { container, rerender } = render(<FloatingPetals />);
      const snap1 = container.innerHTML;
      rerender(<FloatingPetals />);
      expect(container.innerHTML).toBe(snap1);
    });
  });

  // ---------------------------------------------------------------------------
  // 16. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered in a fragment', () => {
      const { container } = render(
        <>
          <FloatingPetals />
        </>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders alongside siblings without conflict', () => {
      const { container } = render(
        <div>
          <FloatingPetals />
          <span data-testid="sibling">hello</span>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.transform-gpu')).toHaveLength(8);
    });

    it('multiple instances render independently', () => {
      const { container } = render(
        <div>
          <FloatingPetals />
          <FloatingPetals />
        </div>
      );
      expect(container.querySelectorAll('.transform-gpu')).toHaveLength(16);
    });
  });

  // ---------------------------------------------------------------------------
  // 17. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.querySelectorAll('[role]')).toHaveLength(0);
    });

    it('has no aria-label', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.querySelectorAll('[aria-label]')).toHaveLength(0);
    });

    it('has no focusable elements', () => {
      const { container } = render(<FloatingPetals />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });
});
