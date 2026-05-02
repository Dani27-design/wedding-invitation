import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AmbientSocialLayer } from './AmbientSocialLayer';

describe('AmbientSocialLayer', () => {
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
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a root div element', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('does not crash with no props', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toBeTruthy();
    });

    it('renders without console errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<AmbientSocialLayer />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('renders without console warnings', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<AmbientSocialLayer />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Pointer-events-none
  // ---------------------------------------------------------------------------
  describe('pointer-events-none', () => {
    it('root container has pointer-events-none', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('no interactive elements within', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Overflow-hidden
  // ---------------------------------------------------------------------------
  describe('overflow-hidden', () => {
    it('root container has overflow-hidden', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Z-20 layering
  // ---------------------------------------------------------------------------
  describe('z-index layering', () => {
    it('root container has z-20', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('z-20');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Accepts empty props
  // ---------------------------------------------------------------------------
  describe('empty props', () => {
    it('accepts no props at all', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts empty customComments array', () => {
      const { container } = render(<AmbientSocialLayer customComments={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts triggerHeartTap as 0', () => {
      const { container } = render(<AmbientSocialLayer triggerHeartTap={0} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts triggerCommentTap as null', () => {
      const { container } = render(<AmbientSocialLayer triggerCommentTap={null} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts all props as default/empty', () => {
      const { container } = render(
        <AmbientSocialLayer customComments={[]} triggerHeartTap={0} triggerCommentTap={null} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Accepts custom comments
  // ---------------------------------------------------------------------------
  describe('custom comments', () => {
    it('accepts a single custom comment', () => {
      const { container } = render(
        <AmbientSocialLayer customComments={[{ name: 'Tamu', text: 'Congrats' }]} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts multiple custom comments', () => {
      const comments = [
        { name: 'Alice', text: 'Beautiful' },
        { name: 'Bob', text: 'Congrats' },
        { name: 'Charlie', text: 'Amazing' },
      ];
      const { container } = render(<AmbientSocialLayer customComments={comments} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts large number of custom comments', () => {
      const comments = Array.from({ length: 50 }, (_, i) => ({
        name: `Guest${i}`,
        text: `Message ${i}`,
      }));
      const { container } = render(<AmbientSocialLayer customComments={comments} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Renders with all optional props as null/undefined
  // ---------------------------------------------------------------------------
  describe('optional props null/undefined', () => {
    it('renders with customComments undefined', () => {
      const { container } = render(<AmbientSocialLayer customComments={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with triggerHeartTap undefined', () => {
      const { container } = render(<AmbientSocialLayer triggerHeartTap={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with triggerCommentTap undefined', () => {
      const { container } = render(<AmbientSocialLayer triggerCommentTap={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with all props undefined', () => {
      const { container } = render(
        <AmbientSocialLayer
          customComments={undefined}
          triggerHeartTap={undefined}
          triggerCommentTap={undefined}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Container has absolute positioning and inset-0
  // ---------------------------------------------------------------------------
  describe('absolute positioning', () => {
    it('root has absolute class', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('absolute');
    });

    it('root has inset-0', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('root has all container classes together', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden', 'z-20');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. No initial visible elements (hearts spawn over time)
  // ---------------------------------------------------------------------------
  describe('no initial visible elements', () => {
    it('has no heart or comment elements initially', () => {
      const { container } = render(<AmbientSocialLayer />);
      const root = container.firstChild as HTMLElement;
      // Initially, the state is empty, so no motion children
      expect(root.querySelectorAll('.will-change-transform').length).toBe(0);
    });

    it('has no SVGs initially (hearts are SVG)', () => {
      const { container } = render(<AmbientSocialLayer />);
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('svg').length).toBe(0);
    });

    it('has no span comments initially', () => {
      const { container } = render(<AmbientSocialLayer />);
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('span').length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Elements spawn after interval
  // ---------------------------------------------------------------------------
  describe('elements spawn over time', () => {
    it('spawns at least one element after 4 seconds', () => {
      const { container } = render(<AmbientSocialLayer />);
      act(() => {
        vi.advanceTimersByTime(4100);
      });
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeGreaterThanOrEqual(1);
    });

    it('spawns multiple elements after several intervals', () => {
      const { container } = render(<AmbientSocialLayer />);
      act(() => {
        vi.advanceTimersByTime(12500);
      });
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeGreaterThanOrEqual(2);
    });

    it('does not exceed 21 elements (limit is slice(-20) + 1 new)', () => {
      const { container } = render(<AmbientSocialLayer />);
      act(() => {
        // 100 intervals * 4 seconds = should trigger many spawns
        vi.advanceTimersByTime(400000);
      });
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeLessThanOrEqual(21);
    });
  });

  // ---------------------------------------------------------------------------
  // 11. will-change-transform for animation performance
  // ---------------------------------------------------------------------------
  describe('will-change-transform', () => {
    it('spawned elements have will-change-transform class', () => {
      const { container } = render(<AmbientSocialLayer />);
      act(() => {
        vi.advanceTimersByTime(4100);
      });
      const root = container.firstChild as HTMLElement;
      const elements = root.querySelectorAll('.will-change-transform');
      elements.forEach((el) => {
        expect(el).toHaveClass('will-change-transform');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Heart tap trigger
  // ---------------------------------------------------------------------------
  describe('triggerHeartTap', () => {
    it('spawns a burst heart when triggerHeartTap changes', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerHeartTap={0} />);
      rerender(<AmbientSocialLayer triggerHeartTap={1} />);
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeGreaterThanOrEqual(1);
    });

    it('spawns another heart on second trigger', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerHeartTap={0} />);
      rerender(<AmbientSocialLayer triggerHeartTap={1} />);
      rerender(<AmbientSocialLayer triggerHeartTap={2} />);
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeGreaterThanOrEqual(2);
    });

    it('heart trigger renders an SVG (heart icon)', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerHeartTap={0} />);
      rerender(<AmbientSocialLayer triggerHeartTap={1} />);
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Comment tap trigger
  // ---------------------------------------------------------------------------
  describe('triggerCommentTap', () => {
    it('spawns a comment when triggerCommentTap is set', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerCommentTap={null} />);
      rerender(
        <AmbientSocialLayer
          triggerCommentTap={{ name: 'Tamu', text: 'MasyaAllah', id: 1 }}
        />
      );
      const root = container.firstChild as HTMLElement;
      expect(root.querySelectorAll('.will-change-transform').length).toBeGreaterThanOrEqual(1);
    });

    it('comment text is displayed', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerCommentTap={null} />);
      rerender(
        <AmbientSocialLayer
          triggerCommentTap={{ name: 'Alice', text: 'Beautiful', id: 1 }}
        />
      );
      const root = container.firstChild as HTMLElement;
      const spans = root.querySelectorAll('span');
      const hasText = Array.from(spans).some((s) => s.textContent?.includes('Alice: Beautiful'));
      expect(hasText).toBe(true);
    });

    it('instant comment has z-50 class', () => {
      const { container, rerender } = render(<AmbientSocialLayer triggerCommentTap={null} />);
      rerender(
        <AmbientSocialLayer
          triggerCommentTap={{ name: 'Bob', text: 'Congrats', id: 1 }}
        />
      );
      const root = container.firstChild as HTMLElement;
      const z50 = root.querySelectorAll('.z-50');
      expect(z50.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Re-renders cleanly with different props
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders with new customComments without crash', () => {
      const { container, rerender } = render(
        <AmbientSocialLayer customComments={[{ name: 'A', text: 'Hello' }]} />
      );
      rerender(
        <AmbientSocialLayer customComments={[{ name: 'B', text: 'World' }]} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('re-renders from props to no props without crash', () => {
      const { container, rerender } = render(
        <AmbientSocialLayer
          customComments={[{ name: 'A', text: 'Hello' }]}
          triggerHeartTap={1}
        />
      );
      rerender(<AmbientSocialLayer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('re-renders 5 times without crash', () => {
      const { container, rerender } = render(<AmbientSocialLayer />);
      for (let i = 0; i < 5; i++) {
        rerender(<AmbientSocialLayer customComments={[{ name: `G${i}`, text: `T${i}` }]} />);
      }
      expect(container.firstChild).toBeInTheDocument();
    });

    it('root keeps all required classes after re-render', () => {
      const { container, rerender } = render(<AmbientSocialLayer />);
      rerender(<AmbientSocialLayer customComments={[{ name: 'X', text: 'Y' }]} />);
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none', 'overflow-hidden', 'z-20');
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Cleanup on unmount
  // ---------------------------------------------------------------------------
  describe('cleanup', () => {
    it('clears interval on unmount (no memory leak)', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<AmbientSocialLayer />);
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 16. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('can be rendered in a fragment', () => {
      const { container } = render(
        <>
          <AmbientSocialLayer />
        </>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders alongside siblings', () => {
      const { container } = render(
        <div>
          <AmbientSocialLayer />
          <div data-testid="sibling">other</div>
        </div>
      );
      expect(container.querySelector('[data-testid="sibling"]')).toBeInTheDocument();
    });

    it('multiple instances render independently', () => {
      const { container } = render(
        <div>
          <AmbientSocialLayer />
          <AmbientSocialLayer />
        </div>
      );
      const roots = container.querySelectorAll('.z-20.overflow-hidden');
      expect(roots.length).toBeGreaterThanOrEqual(2);
    });

    it('custom comments with special characters render without crash', () => {
      const { container } = render(
        <AmbientSocialLayer
          customComments={[
            { name: '<script>', text: 'alert("xss")' },
            { name: 'O\'Brien', text: 'He said "hello"' },
          ]}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('custom comments with empty strings render without crash', () => {
      const { container } = render(
        <AmbientSocialLayer customComments={[{ name: '', text: '' }]} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('custom comments with very long text render without crash', () => {
      const longText = 'A'.repeat(1000);
      const { container } = render(
        <AmbientSocialLayer customComments={[{ name: 'Guest', text: longText }]} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 17. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no aria roles on root', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.querySelectorAll('[role]')).toHaveLength(0);
    });

    it('has no focusable elements', () => {
      const { container } = render(<AmbientSocialLayer />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });
});
