import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundLayers } from './BackgroundLayers';

describe('BackgroundLayers', () => {
  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('renders multiple top-level children (fragment with 2 layers)', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.children.length).toBe(2);
    });

    it('all top-level children are divs', () => {
      const { container } = render(<BackgroundLayers />);
      Array.from(container.children).forEach((child) => {
        expect(child.tagName).toBe('DIV');
      });
    });

    it('does not render any visible text', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.textContent).toBe('');
    });

    it('does not render any interactive elements', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });

    it('does not render any img elements', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. All layers pointer-events-none
  // ---------------------------------------------------------------------------
  describe('pointer-events-none', () => {
    it('all 2 top-level layers have pointer-events-none', () => {
      const { container } = render(<BackgroundLayers />);
      const layers = container.querySelectorAll('.pointer-events-none');
      expect(layers.length).toBeGreaterThanOrEqual(2);
    });

    it('film grain layer has pointer-events-none', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('pointer-events-none');
    });

    it('light sweep layer parent has pointer-events-none', () => {
      const { container } = render(<BackgroundLayers />);
      const sweepParent = container.querySelector('.animate-light-sweep')?.parentElement;
      expect(sweepParent).toHaveClass('pointer-events-none');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. All layers fixed position
  // ---------------------------------------------------------------------------
  describe('fixed positioning', () => {
    it('all 2 top-level layers use fixed positioning', () => {
      const { container } = render(<BackgroundLayers />);
      const fixed = container.querySelectorAll('.fixed');
      expect(fixed.length).toBeGreaterThanOrEqual(2);
    });

    it('film grain layer has fixed position', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('fixed');
    });

    it('light sweep container has fixed position', () => {
      const { container } = render(<BackgroundLayers />);
      const sweepParent = container.querySelector('.animate-light-sweep')?.parentElement;
      expect(sweepParent).toHaveClass('fixed');
    });

    it('all fixed layers also have inset-0', () => {
      const { container } = render(<BackgroundLayers />);
      const fixedLayers = container.querySelectorAll('.fixed');
      fixedLayers.forEach((layer) => {
        expect(layer).toHaveClass('inset-0');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Film grain layer
  // ---------------------------------------------------------------------------
  describe('film grain layer', () => {
    it('has animate-grain class', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toBeInTheDocument();
    });

    it('grain has low opacity (0.025)', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('opacity-[0.025]');
    });

    it('grain has bg-repeat for tiled texture', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('bg-repeat');
    });

    it('grain references local texture file', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain?.className).toContain("bg-[url('/textures/p6.png')]");
    });

    it('grain has highest z-index among background layers', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('z-[15]');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Light sweep layer
  // ---------------------------------------------------------------------------
  describe('light sweep layer', () => {
    it('has animate-light-sweep class', () => {
      const { container } = render(<BackgroundLayers />);
      const sweep = container.querySelector('.animate-light-sweep');
      expect(sweep).toBeInTheDocument();
    });

    it('sweep uses gradient for light effect', () => {
      const { container } = render(<BackgroundLayers />);
      const sweep = container.querySelector('.animate-light-sweep');
      expect(sweep?.className).toContain('bg-gradient-to-r');
    });

    it('sweep has 200% width for animation travel', () => {
      const { container } = render(<BackgroundLayers />);
      const sweep = container.querySelector('.animate-light-sweep');
      expect(sweep).toHaveClass('w-[200%]');
    });

    it('sweep container has z-[1]', () => {
      const { container } = render(<BackgroundLayers />);
      const sweepParent = container.querySelector('.animate-light-sweep')?.parentElement;
      expect(sweepParent).toHaveClass('z-[1]');
    });

    it('sweep container has overflow-hidden', () => {
      const { container } = render(<BackgroundLayers />);
      const sweepParent = container.querySelector('.animate-light-sweep')?.parentElement;
      expect(sweepParent).toHaveClass('overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Shadow drift layer (removed)
  // ---------------------------------------------------------------------------
  describe('shadow drift layer', () => {
    it('does not have any animate-shadow-drift elements', () => {
      const { container } = render(<BackgroundLayers />);
      const drifts = container.querySelectorAll('.animate-shadow-drift');
      expect(drifts).toHaveLength(0);
    });

    it('does not have any mix-blend-multiply elements', () => {
      const { container } = render(<BackgroundLayers />);
      const layers = Array.from(container.children);
      const shadowLayer = layers.find((l) => l.className.includes('mix-blend-multiply'));
      expect(shadowLayer).toBeUndefined();
    });

    it('does not reference stardust.png', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('stardust.png');
    });

    it('does not have blur-[80px] elements', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('blur-[80px]');
    });

    it('does not have blur-[100px] elements', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('blur-[100px]');
    });
  });

  // ---------------------------------------------------------------------------
  // 7. References local textures (not external URLs)
  // ---------------------------------------------------------------------------
  describe('local textures', () => {
    it('does not reference transparenttextures.com', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('transparenttextures.com');
    });

    it('does not reference any external http URL', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('http://');
      expect(container.innerHTML).not.toContain('https://');
    });

    it('references /textures/p6.png for grain', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).toContain('/textures/p6.png');
    });

    it('does not reference /textures/stardust.png (shadow layer removed)', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).not.toContain('/textures/stardust.png');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Z-index layering order
  // ---------------------------------------------------------------------------
  describe('z-index layering', () => {
    it('grain has z-[15] (below opening overlay z-1000)', () => {
      const { container } = render(<BackgroundLayers />);
      const grain = container.querySelector('.animate-grain');
      expect(grain).toHaveClass('z-[15]');
    });

    it('light sweep container has z-[1] (below grain)', () => {
      const { container } = render(<BackgroundLayers />);
      const sweepParent = container.querySelector('.animate-light-sweep')?.parentElement;
      expect(sweepParent).toHaveClass('z-[1]');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. No layout-shifting elements
  // ---------------------------------------------------------------------------
  describe('no layout shift', () => {
    it('no element uses relative positioning that could shift layout', () => {
      const { container } = render(<BackgroundLayers />);
      const topLevelLayers = Array.from(container.children);
      topLevelLayers.forEach((layer) => {
        // All top-level should be fixed, not relative
        expect(layer).toHaveClass('fixed');
      });
    });

    it('no inline width/height styles on top-level layers', () => {
      const { container } = render(<BackgroundLayers />);
      Array.from(container.children).forEach((layer) => {
        const el = layer as HTMLElement;
        expect(el.style.width).toBe('');
        expect(el.style.height).toBe('');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders without duplicating layers', () => {
      const { container, rerender } = render(<BackgroundLayers />);
      rerender(<BackgroundLayers />);
      expect(container.children.length).toBe(2);
    });

    it('re-renders 5 times without extra layers', () => {
      const { container, rerender } = render(<BackgroundLayers />);
      for (let i = 0; i < 5; i++) {
        rerender(<BackgroundLayers />);
      }
      expect(container.children.length).toBe(2);
    });

    it('still has grain and light sweep after re-render', () => {
      const { container, rerender } = render(<BackgroundLayers />);
      rerender(<BackgroundLayers />);
      expect(container.querySelector('.animate-grain')).toBeInTheDocument();
      expect(container.querySelectorAll('.animate-shadow-drift')).toHaveLength(0);
      expect(container.querySelector('.animate-light-sweep')).toBeInTheDocument();
    });

    it('HTML structure is identical after re-render', () => {
      const { container, rerender } = render(<BackgroundLayers />);
      const before = container.innerHTML;
      rerender(<BackgroundLayers />);
      expect(container.innerHTML).toBe(before);
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('all layers are in the document', () => {
      const { container } = render(<BackgroundLayers />);
      Array.from(container.children).forEach((child) => {
        expect(document.body.contains(child)).toBe(true);
      });
    });

    it('does not produce console errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<BackgroundLayers />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not produce console warnings', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<BackgroundLayers />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Snapshot stability
  // ---------------------------------------------------------------------------
  describe('snapshot stability', () => {
    it('matches snapshot', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('snapshot is identical after re-render', () => {
      const { container, rerender } = render(<BackgroundLayers />);
      const snap1 = container.innerHTML;
      rerender(<BackgroundLayers />);
      expect(container.innerHTML).toBe(snap1);
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered alongside siblings', () => {
      const { container } = render(
        <div>
          <BackgroundLayers />
          <div data-testid="sibling">content</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
      expect(container.querySelector('.animate-grain')).toBeInTheDocument();
    });

    it('multiple instances produce doubled layers', () => {
      const { container } = render(
        <div>
          <BackgroundLayers />
          <BackgroundLayers />
        </div>
      );
      const grains = container.querySelectorAll('.animate-grain');
      expect(grains).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.querySelectorAll('[role]')).toHaveLength(0);
    });

    it('has no aria-label', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.querySelectorAll('[aria-label]')).toHaveLength(0);
    });

    it('has no focusable elements', () => {
      const { container } = render(<BackgroundLayers />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });
});
