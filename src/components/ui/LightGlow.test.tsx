import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LightGlow } from './LightGlow';

describe('LightGlow', () => {
  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('renders exactly one child element inside the root container', () => {
      const { container } = render(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(1);
    });

    it('the child element is also a div', () => {
      const { container } = render(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      expect(root.children[0].tagName).toBe('DIV');
    });

    it('does not render any text content (purely decorative)', () => {
      const { container } = render(<LightGlow />);
      expect(container.textContent).toBe('');
    });

    it('does not render any images', () => {
      const { container } = render(<LightGlow />);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(0);
    });

    it('does not render any buttons or interactive elements', () => {
      const { container } = render(<LightGlow />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });

    it('does not render any SVGs', () => {
      const { container } = render(<LightGlow />);
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Pointer events / interaction blocking
  // ---------------------------------------------------------------------------
  describe('pointer-events-none (prevents interaction blocking)', () => {
    it('root container has pointer-events-none class', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('glow child also has pointer-events-none', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow).toHaveClass('pointer-events-none');
    });

    it('no element within the component is interactive', () => {
      const { container } = render(<LightGlow />);
      const allElements = container.querySelectorAll('*');
      const interactiveElements = Array.from(allElements).filter((el) => {
        const tag = el.tagName.toLowerCase();
        return ['button', 'a', 'input', 'textarea', 'select'].includes(tag);
      });
      expect(interactiveElements).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Overflow hidden (prevent layout shift / scrollbar glitch)
  // ---------------------------------------------------------------------------
  describe('overflow hidden', () => {
    it('root container has overflow-hidden to prevent scrollbar glitch', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });

    it('glow extends beyond its container bounds (large width/height) but is clipped', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).querySelector('[class*="w-\\[150%\\]"]');
      expect(glow).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Blur effect (soft glow, no hard edges)
  // ---------------------------------------------------------------------------
  describe('blur effect', () => {
    it('glow element has blur-[180px] for soft glow', () => {
      const { container } = render(<LightGlow />);
      const glow = container.querySelector('.blur-\\[180px\\]');
      expect(glow).toBeInTheDocument();
    });

    it('only one blur element exists (no duplication)', () => {
      const { container } = render(<LightGlow />);
      const blurs = container.querySelectorAll('[class*="blur-"]');
      expect(blurs).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. rounded-full for soft circular shape
  // ---------------------------------------------------------------------------
  describe('rounded shape', () => {
    it('glow element uses rounded-full for soft circular appearance', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow).toHaveClass('rounded-full');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. mix-blend-soft-light compositing
  // ---------------------------------------------------------------------------
  describe('blend mode compositing', () => {
    it('glow element uses mix-blend-soft-light for natural light compositing', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow).toHaveClass('mix-blend-soft-light');
    });

    it('no other blend modes are applied to the container', () => {
      const { container } = render(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).not.toContain('mix-blend-');
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Absolute positioning
  // ---------------------------------------------------------------------------
  describe('absolute positioning', () => {
    it('root container has absolute positioning', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toHaveClass('absolute');
    });

    it('glow child has absolute positioning', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow).toHaveClass('absolute');
    });

    it('container uses inset-0 for full coverage', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toHaveClass('inset-0');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Z-index layering
  // ---------------------------------------------------------------------------
  describe('z-index layering', () => {
    it('container has required layout classes', () => {
      const { container } = render(<LightGlow />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden');
    });

  });

  // ---------------------------------------------------------------------------
  // 9. Glow dimensions and positioning offsets
  // ---------------------------------------------------------------------------
  describe('glow dimensions and offset', () => {
    it('glow has 150% width for oversized soft coverage', () => {
      const { container } = render(<LightGlow />);
      const glow = container.querySelector('.w-\\[150\\%\\]');
      expect(glow).toBeInTheDocument();
    });

    it('glow has 150% height for oversized soft coverage', () => {
      const { container } = render(<LightGlow />);
      const glow = container.querySelector('.h-\\[150\\%\\]');
      expect(glow).toBeInTheDocument();
    });

    it('glow is offset to top-right with negative positioning', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow).toHaveClass('-top-1/4');
      expect(glow).toHaveClass('-right-1/4');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Gold color theme
  // ---------------------------------------------------------------------------
  describe('gold color theme', () => {
    it('glow uses gold background color with low opacity', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(glow.className).toContain('bg-gold/10');
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Re-render stability (prevent duplication / glitch)
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders without duplicating glow elements', () => {
      const { container, rerender } = render(<LightGlow />);
      rerender(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(1);
    });

    it('re-renders 5 times without duplication', () => {
      const { container, rerender } = render(<LightGlow />);
      for (let i = 0; i < 5; i++) {
        rerender(<LightGlow />);
      }
      const root = container.firstChild as HTMLElement;
      expect(root.children.length).toBe(1);
    });

    it('maintains the same structure after re-render', () => {
      const { container, rerender } = render(<LightGlow />);
      const initialHTML = container.innerHTML;
      rerender(<LightGlow />);
      expect(container.innerHTML).toBe(initialHTML);
    });

    it('container still has all required classes after re-render', () => {
      const { container, rerender } = render(<LightGlow />);
      rerender(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Snapshot stability
  // ---------------------------------------------------------------------------
  describe('snapshot stability', () => {
    it('matches snapshot on first render', () => {
      const { container } = render(<LightGlow />);
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('snapshot remains identical after re-render', () => {
      const { container, rerender } = render(<LightGlow />);
      const snap1 = container.innerHTML;
      rerender(<LightGlow />);
      const snap2 = container.innerHTML;
      expect(snap1).toBe(snap2);
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Visual rendering safety (prevent lag, disappear, broken display)
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('root element is in the document after mount', () => {
      const { container } = render(<LightGlow />);
      expect(document.body.contains(container.firstChild)).toBe(true);
    });

    it('glow element is in the document after mount', () => {
      const { container } = render(<LightGlow />);
      const glow = (container.firstChild as HTMLElement).children[0];
      expect(document.body.contains(glow)).toBe(true);
    });

    it('no inline style that could cause layout shift (e.g. no explicit width/height in style)', () => {
      const { container } = render(<LightGlow />);
      const root = container.firstChild as HTMLElement;
      // The root should not have pixel-based inline styles that shift layout
      expect(root.style.width).toBe('');
      expect(root.style.height).toBe('');
    });

    it('component does not produce console errors during render', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<LightGlow />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('component does not produce console warnings during render', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<LightGlow />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered inside a fragment', () => {
      const { container } = render(
        <>
          <LightGlow />
        </>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('can be rendered alongside siblings without conflict', () => {
      const { container } = render(
        <div>
          <LightGlow />
          <div data-testid="sibling">other</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(container.querySelector('.blur-\\[180px\\]')).toBeInTheDocument();
    });

    it('multiple instances do not interfere', () => {
      const { container } = render(
        <div>
          <LightGlow />
          <LightGlow />
        </div>
      );
      const glows = container.querySelectorAll('.blur-\\[180px\\]');
      expect(glows).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Accessibility (decorative element)
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles (purely decorative)', () => {
      const { container } = render(<LightGlow />);
      const withRole = container.querySelectorAll('[role]');
      expect(withRole).toHaveLength(0);
    });

    it('has no aria-label (purely decorative)', () => {
      const { container } = render(<LightGlow />);
      const withLabel = container.querySelectorAll('[aria-label]');
      expect(withLabel).toHaveLength(0);
    });

    it('has no tab-focusable elements', () => {
      const { container } = render(<LightGlow />);
      const focusable = container.querySelectorAll('[tabindex]');
      expect(focusable).toHaveLength(0);
    });
  });
});
