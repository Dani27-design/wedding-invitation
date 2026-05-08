import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// ---------------------------------------------------------------------------
// Helper: component that throws on render
// ---------------------------------------------------------------------------
const ThrowingComponent = () => {
  throw new Error('Test render error');
};

const SafeComponent = () => <div data-testid="safe-child">Hello</div>;

// ---------------------------------------------------------------------------
// 1. Normal rendering — passes children through
// ---------------------------------------------------------------------------
describe('ErrorBoundary', () => {
  describe('normal rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    });

    it('children content is visible', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('does not show fallback when no error', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Silakan refresh halaman')).not.toBeInTheDocument();
    });

    it('does not show couple names fallback when no error', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Dani & Marini')).not.toBeInTheDocument();
    });

    it('renders multiple children without error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('renders nested components without error', () => {
      render(
        <ErrorBoundary>
          <div>
            <SafeComponent />
          </div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    });

    it('does not interfere with child event handlers', () => {
      const onClick = vi.fn();
      render(
        <ErrorBoundary>
          <button onClick={onClick}>Click me</button>
        </ErrorBoundary>
      );
      screen.getByText('Click me').click();
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Error catching — shows fallback
  // ---------------------------------------------------------------------------
  describe('error catching', () => {
    it('catches render error and shows fallback', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Silakan refresh halaman')).toBeInTheDocument();
      spy.mockRestore();
    });

    it('does not crash the app when child throws', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toBeInTheDocument();
      spy.mockRestore();
    });

    it('hides the throwing child component', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByTestId('safe-child')).not.toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Fallback content — couple names, date, venue, refresh message
  // ---------------------------------------------------------------------------
  describe('fallback content', () => {
    it('shows generic "Undangan Pernikahan" when no props provided', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Undangan Pernikahan')).toBeInTheDocument();
      spy.mockRestore();
    });

    it('heading uses font-dayland', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const heading = screen.getByText('Undangan Pernikahan');
      expect(heading).toHaveClass('font-dayland');
      spy.mockRestore();
    });

    it('heading is in h1 element', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Undangan Pernikahan').tagName).toBe('H1');
      spy.mockRestore();
    });

    it('hides date when no props provided', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByText(/Agustus/)).not.toBeInTheDocument();
      spy.mockRestore();
    });

    it('hides venue when no props provided', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.queryByText(/Candra Kencana/)).not.toBeInTheDocument();
      spy.mockRestore();
    });

    it('shows "Silakan refresh halaman" message', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Silakan refresh halaman')).toBeInTheDocument();
      spy.mockRestore();
    });

    it('refresh message is uppercase', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Silakan refresh halaman')).toHaveClass('uppercase');
      spy.mockRestore();
    });

    it('refresh message has gold color', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Silakan refresh halaman')).toHaveClass('text-gold');
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Fallback styling — matches design system
  // ---------------------------------------------------------------------------
  describe('fallback styling', () => {
    it('fallback has min-h-screen for full viewport', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toHaveClass('min-h-screen');
      spy.mockRestore();
    });

    it('fallback has bg-ivory background', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toHaveClass('bg-ivory');
      spy.mockRestore();
    });

    it('fallback centers content', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
      spy.mockRestore();
    });

    it('fallback has text-center alignment', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toHaveClass('text-center');
      spy.mockRestore();
    });

    it('fallback has horizontal padding', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.firstChild).toHaveClass('px-8');
      spy.mockRestore();
    });

    it('has gold decorative line separator', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const line = container.querySelector('.bg-gold\\/30');
      expect(line).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('renders empty children without error', () => {
      const { container } = render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );
      expect(container).toBeTruthy();
    });

    it('renders undefined children without error', () => {
      const { container } = render(
        <ErrorBoundary>
          {undefined}
        </ErrorBoundary>
      );
      expect(container).toBeTruthy();
    });

    it('renders string children without error', () => {
      render(
        <ErrorBoundary>
          Just text
        </ErrorBoundary>
      );
      expect(screen.getByText('Just text')).toBeInTheDocument();
    });

    it('re-renders without losing error state', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Undangan Pernikahan')).toBeInTheDocument();

      // Re-render with same throwing child — should still show fallback
      rerender(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Undangan Pernikahan')).toBeInTheDocument();
      spy.mockRestore();
    });

    it('fallback does not contain any interactive elements that could break', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(container.querySelectorAll('a')).toHaveLength(0);
      expect(container.querySelectorAll('input')).toHaveLength(0);
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Accessibility
  // ---------------------------------------------------------------------------
  describe('accessibility', () => {
    it('fallback has semantic heading', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      const h1 = screen.getByText('Undangan Pernikahan');
      expect(h1.tagName).toBe('H1');
      spy.mockRestore();
    });

    it('fallback text is readable (not hidden)', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Silakan refresh halaman')).toBeInTheDocument();
      spy.mockRestore();
    });
  });
});
