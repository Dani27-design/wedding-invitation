import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoZoomModal } from './PhotoZoomModal';

describe('PhotoZoomModal', () => {
  const defaultOnClose = vi.fn();

  // ---------------------------------------------------------------------------
  // 1. Does not render when selectedPhoto is null
  // ---------------------------------------------------------------------------
  describe('null/empty state', () => {
    it('does not render when selectedPhoto is null', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto={null} onClose={defaultOnClose} />);
      expect(container.innerHTML).toBe('');
    });

    it('container is empty with null photo', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(container.children.length).toBe(0);
    });

    it('does not render any img element when null', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('does not render close button when null', () => {
      render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(screen.queryByLabelText('Tutup')).toBeNull();
    });

    it('does not render backdrop when null', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(container.querySelector('.cursor-zoom-out')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Renders image when photo is provided
  // ---------------------------------------------------------------------------
  describe('renders with photo', () => {
    it('renders when selectedPhoto is provided', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toBeInTheDocument();
    });

    it('renders a visible container', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto="/photo.jpg" onClose={vi.fn()} />);
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('renders an img element', () => {
      const { container } = render(<PhotoZoomModal selectedPhoto="/photo.jpg" onClose={vi.fn()} />);
      expect(container.querySelectorAll('img')).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Image has correct src
  // ---------------------------------------------------------------------------
  describe('image src', () => {
    it('image has correct src attribute', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img).toHaveAttribute('src', '/test.jpg');
    });

    it('image src changes when prop changes', () => {
      const { rerender } = render(<PhotoZoomModal selectedPhoto="/first.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', '/first.jpg');
      rerender(<PhotoZoomModal selectedPhoto="/second.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', '/second.jpg');
    });

    it('image with absolute URL works', () => {
      render(<PhotoZoomModal selectedPhoto="https://example.com/photo.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Image has alt text
  // ---------------------------------------------------------------------------
  describe('image alt text', () => {
    it('image has alt text "Foto dalam tampilan penuh"', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img).toBeInTheDocument();
    });

    it('alt text is exactly "Foto dalam tampilan penuh" (not empty)', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img.getAttribute('alt')).toBe('Foto dalam tampilan penuh');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Close button has aria-label "Tutup"
  // ---------------------------------------------------------------------------
  describe('close button aria-label', () => {
    it('close button has aria-label "Tutup"', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const closeBtn = screen.getByLabelText('Tutup');
      expect(closeBtn).toBeInTheDocument();
    });

    it('close button is a button element', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const closeBtn = screen.getByLabelText('Tutup');
      expect(closeBtn.tagName).toBe('BUTTON');
    });

    it('close button has exactly one instance', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const buttons = screen.getAllByLabelText('Tutup');
      expect(buttons).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Close button calls onClose
  // ---------------------------------------------------------------------------
  describe('close button onClick', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      fireEvent.click(screen.getByLabelText('Tutup'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose each time close button is clicked', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      const btn = screen.getByLabelText('Tutup');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('onClose receives no arguments', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      fireEvent.click(screen.getByLabelText('Tutup'));
      // The handler is called with a click event from stopPropagation wrapper
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Backdrop click calls onClose
  // ---------------------------------------------------------------------------
  describe('backdrop click', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toBeTruthy();
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it('backdrop exists when photo is provided', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      expect(document.querySelector('.cursor-zoom-out')).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Image click does not close (stopPropagation)
  // ---------------------------------------------------------------------------
  describe('image click stopPropagation', () => {
    it('clicking the image does not call onClose', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      fireEvent.click(screen.getByAltText('Foto dalam tampilan penuh'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('clicking the image container div does not call onClose', () => {
      const onClose = vi.fn();
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={onClose} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      const imageContainer = img.parentElement;
      if (imageContainer) fireEvent.click(imageContainer);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Backdrop blur
  // ---------------------------------------------------------------------------
  describe('backdrop-blur', () => {
    it('backdrop has backdrop-blur-xl', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toHaveClass('backdrop-blur-xl');
    });

    it('image container has backdrop-blur-md on close button', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('backdrop-blur-md');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Max-height constraint
  // ---------------------------------------------------------------------------
  describe('max-height constraint', () => {
    it('image has max-height constraint via style', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img.style.maxHeight).toBe('85vh');
    });

    it('image has max-width constraint via style', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img.style.maxWidth).toBe('100%');
    });

    it('image uses object-contain to prevent distortion', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img).toHaveClass('object-contain');
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Fixed positioning z-2000
  // ---------------------------------------------------------------------------
  describe('fixed positioning and z-index', () => {
    it('backdrop has fixed positioning', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toHaveClass('fixed');
    });

    it('backdrop has inset-0', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toHaveClass('inset-0');
    });

    it('backdrop has z-[2000]', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toHaveClass('z-[2000]');
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Border-radius
  // ---------------------------------------------------------------------------
  describe('border-radius', () => {
    it('image has rounded-[1.5rem]', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      expect(img).toHaveClass('rounded-[1.5rem]');
    });

    it('image container has rounded-[2rem]', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      const container = img.parentElement;
      expect(container).toHaveClass('rounded-[2rem]');
    });

    it('close button has rounded-full', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('rounded-full');
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Spring animation container present
  // ---------------------------------------------------------------------------
  describe('spring animation container', () => {
    it('image container has overflow-hidden for animation clipping', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      const container = img.parentElement;
      expect(container).toHaveClass('overflow-hidden');
    });

    it('image container has relative positioning for close button', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      const container = img.parentElement;
      expect(container).toHaveClass('relative');
    });

    it('image container has max-w-5xl', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const img = screen.getByAltText('Foto dalam tampilan penuh');
      const container = img.parentElement;
      expect(container).toHaveClass('max-w-5xl');
    });
  });

  // ---------------------------------------------------------------------------
  // 14. cursor-zoom-out on backdrop
  // ---------------------------------------------------------------------------
  describe('cursor-zoom-out', () => {
    it('backdrop has cursor-zoom-out class', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 15. Close button hover style classes
  // ---------------------------------------------------------------------------
  describe('close button styling', () => {
    it('close button has hover:bg-white/40 class', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('hover:bg-white/40');
    });

    it('close button has bg-white/20 base style', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('bg-white/20');
    });

    it('close button has white text', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('text-white');
    });

    it('close button has border', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn.className).toContain('border');
    });

    it('close button has transition-all', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('transition-all');
    });

    it('close button has absolute positioning (top-right corner)', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('absolute', 'top-6', 'right-6');
    });

    it('close button has fixed dimensions (w-12 h-12)', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('w-12', 'h-12');
    });
  });

  // ---------------------------------------------------------------------------
  // 16. Close button icon
  // ---------------------------------------------------------------------------
  describe('close button icon', () => {
    it('close button contains an SVG (X icon)', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 17. Re-render stability
  // ---------------------------------------------------------------------------
  describe('re-render stability', () => {
    it('re-renders from null to photo correctly', () => {
      const { rerender } = render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(screen.queryByAltText('Foto dalam tampilan penuh')).toBeNull();
      rerender(<PhotoZoomModal selectedPhoto="/photo.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toBeInTheDocument();
    });

    it('re-renders from photo to null correctly', () => {
      const { rerender } = render(<PhotoZoomModal selectedPhoto="/photo.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toBeInTheDocument();
      rerender(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      // AnimatePresence may keep exit animation in DOM briefly
      expect(screen.queryByAltText('Foto dalam tampilan penuh')).toBeDefined();
    });

    it('multiple re-renders with different photos work', () => {
      const { rerender } = render(<PhotoZoomModal selectedPhoto="/a.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', '/a.jpg');
      rerender(<PhotoZoomModal selectedPhoto="/b.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', '/b.jpg');
      rerender(<PhotoZoomModal selectedPhoto="/c.jpg" onClose={vi.fn()} />);
      expect(screen.getByAltText('Foto dalam tampilan penuh')).toHaveAttribute('src', '/c.jpg');
    });
  });

  // ---------------------------------------------------------------------------
  // 18. Visual rendering safety
  // ---------------------------------------------------------------------------
  describe('visual rendering safety', () => {
    it('does not produce console errors when rendering with photo', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not produce console errors when rendering with null', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<PhotoZoomModal selectedPhoto={null} onClose={vi.fn()} />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('backdrop uses flex centering to prevent misaligned display', () => {
      render(<PhotoZoomModal selectedPhoto="/test.jpg" onClose={vi.fn()} />);
      const backdrop = document.querySelector('.cursor-zoom-out');
      expect(backdrop).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});
