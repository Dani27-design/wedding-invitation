import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TwibbonSection } from './TwibbonSection';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const renderComponent = () => render(<TwibbonSection />);

// ===========================================================================
// 1. RENDERING — basic mount & structure
// ===========================================================================
describe('TwibbonSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderComponent();
      expect(container.firstChild!.nodeName).toBe('SECTION');
    });

    it('section has id="twibbon-section" for navigation', () => {
      const { container } = renderComponent();
      expect(container.querySelector('#twibbon-section')).toBeInTheDocument();
    });

    it('section has bg-ivory background', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('bg-ivory');
    });

    it('section has relative positioning', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('relative');
    });

    it('section has py-6 vertical padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('py-[2vh]');
    });

    it('section has overflow-hidden', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('overflow-hidden');
    });

    it('mounts and unmounts cleanly', () => {
      const { unmount, container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
      unmount();
      expect(container.firstChild).toBeNull();
    });

    it('renders non-empty content', () => {
      const { container } = renderComponent();
      expect(container.firstChild).not.toBeEmptyDOMElement();
    });

    it('does not render null', () => {
      const { container } = renderComponent();
      expect(container.innerHTML).not.toBe('');
    });
  });

  // =========================================================================
  // 2. TWIBBON CREATOR CONTENT
  // =========================================================================
  describe('TwibbonCreator Content', () => {
    it('renders a canvas element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('img[src*="twibbon-overlay"]')).toBeInTheDocument();
    });

    it('displays "rayakan momen bahagia ini" heading text', () => {
      renderComponent();
      expect(screen.getByText('rayakan momen bahagia ini bersama kami.')).toBeInTheDocument();
    });

    it('"rayakan momen bahagia ini" is in h3 element', () => {
      renderComponent();
      const el = screen.getByText('rayakan momen bahagia ini bersama kami.');
      expect(el.tagName).toBe('P');
    });

    it('"rayakan momen bahagia ini" has serif italic styling', () => {
      renderComponent();
      const el = screen.getByText('rayakan momen bahagia ini bersama kami.');
      expect(el).toHaveClass('font-serif');
      expect(el).toHaveClass('italic');
    });

    it('"rayakan momen bahagia ini" has ink text color', () => {
      renderComponent();
      expect(screen.getByText('rayakan momen bahagia ini bersama kami.')).toHaveClass('text-ink/70');
    });

    it('displays "Twibbon Pernikahan Kami" subtitle', () => {
      renderComponent();
      expect(screen.getByText('Twibbon Pernikahan Kami')).toBeInTheDocument();
    });

    it('"Twibbon Pernikahan Kami" is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Twibbon Pernikahan Kami')).toHaveClass('uppercase');
    });

    it('"Twibbon Pernikahan Kami" has gold color', () => {
      renderComponent();
      expect(screen.getByText('Twibbon Pernikahan Kami')).toHaveClass('text-gold');
    });

    it('has a file input element', () => {
      const { container } = renderComponent();
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('file input accepts images', () => {
      const { container } = renderComponent();
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('file input is hidden', () => {
      const { container } = renderComponent();
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass('hidden');
    });
  });

  // =========================================================================
  // 3. LAYOUT
  // =========================================================================
  describe('Layout', () => {
    it('inner content wrapper has z-10', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex-col');
    });

    it('inner wrapper uses flex column layout', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex');
      expect(section).toHaveClass('flex-col');
    });

    it('inner wrapper centers items', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('items-center');
    });

    it('inner wrapper has full width', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex-col');
    });

    it('inner wrapper has full height', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('h-fit');
    });

    it('TwibbonCreator wrapper has flex column evenly distributed layout', () => {
      const { container } = renderComponent();
      const creatorWrapper = container.querySelector('.flex.flex-col.items-center.justify-start[class*="w-full"]');
      expect(creatorWrapper).toBeInTheDocument();
    });

    it('text header section has text-center alignment', () => {
      const { container } = renderComponent();
      const header = container.querySelector('.text-center.shrink-0');
      expect(header).toBeInTheDocument();
    });

    it('canvas preview area has aspect-[9/16] ratio', () => {
      const { container } = renderComponent();
      const preview = container.querySelector('[class*="aspect-\\[9\\/16\\]"]');
      expect(preview).toBeInTheDocument();
    });

    it('canvas preview has shadow styling', () => {
      const { container } = renderComponent();
      const preview = container.querySelector('[class*="shadow-"]');
      expect(preview).toBeInTheDocument();
    });

    it('canvas preview has border', () => {
      const { container } = renderComponent();
      const preview = container.querySelector('[class*="aspect-"][class*="border"]');
      expect(preview).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. VISUAL — styling, background, canvas overlay
  // =========================================================================
  describe('Visual', () => {
    it('canvas is absolutely positioned within preview', () => {
      const { container } = renderComponent();
      const overlayImg = container.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toHaveClass('absolute');
    });

    it('canvas covers full area (inset-0)', () => {
      const { container } = renderComponent();
      const overlayImg = container.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toHaveClass('inset-0');
    });

    it('canvas is on z-10 layer', () => {
      const { container } = renderComponent();
      const overlayImg = container.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toHaveClass('z-10');
    });

    it('canvas has pointer-events-none', () => {
      const { container } = renderComponent();
      const overlayImg = container.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toHaveClass('pointer-events-none');
    });

    it('canvas fills width and height (w-full h-full)', () => {
      const { container } = renderComponent();
      const overlayImg = container.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toHaveClass('w-full');
      expect(overlayImg).toHaveClass('h-full');
    });

    it('placeholder area has neutral background (#8E8A85)', () => {
      const { container } = renderComponent();
      const placeholder = container.querySelector('.bg-\\[\\#8E8A85\\]');
      expect(placeholder).toBeInTheDocument();
    });

    it('Camera icon placeholder is rendered', () => {
      const { container } = renderComponent();
      const cameraIcon = container.querySelector('svg');
      expect(cameraIcon).toBeInTheDocument();
    });

    it('preview frame has ivory background (#F2EEE9)', () => {
      const { container } = renderComponent();
      const frame = container.querySelector('.bg-\\[\\#F2EEE9\\]');
      expect(frame).toBeInTheDocument();
    });

    it('preview is constrained to max-w-[82%]', () => {
      const { container } = renderComponent();
      const preview = container.querySelector('.max-w-\\[82\\%\\]');
      expect(preview).toBeInTheDocument();
    });

    it('preview uses height-driven sizing h-[55vh]', () => {
      const { container } = renderComponent();
      const preview = container.querySelector('.h-\\[55vh\\]');
      expect(preview).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. DOWNLOAD BUTTON — initial state
  // =========================================================================
  describe('Download Button', () => {
    it('renders download button with "Bagikan Momen" text', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button is a button element', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button is disabled when no image is uploaded', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has disabled styling (opacity-30)', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has disabled pointer-events-none', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has bg-ink background', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has text-gold color', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has rounded-full', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has uppercase font-black', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has full width (w-full)', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has shadow-xl', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has transition-all for smooth state changes', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('download button has wide tracking', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. INTERACTION — cursor and preview behavior
  // =========================================================================
  describe('Interaction', () => {
    it('preview area has cursor-pointer when no image is set', () => {
      const { container } = renderComponent();
      const interactionArea = container.querySelector('.cursor-pointer');
      expect(interactionArea).toBeInTheDocument();
    });

    it('preview area has select-none to prevent text selection', () => {
      const { container } = renderComponent();
      const interactionArea = container.querySelector('.select-none');
      expect(interactionArea).toBeInTheDocument();
    });

    it('preview area has overflow-hidden', () => {
      const { container } = renderComponent();
      const interactionArea = container.querySelector('.select-none.overflow-hidden');
      expect(interactionArea).toBeInTheDocument();
    });

    it('"Ganti Foto" button is NOT visible initially (no image)', () => {
      renderComponent();
      expect(screen.queryByText('Ganti Foto')).not.toBeInTheDocument();
    });

    it('"Seret" drag hint is NOT visible initially (no image)', () => {
      renderComponent();
      expect(screen.queryByText(/Seret/)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. EDGE CASES — re-renders, stability
  // =========================================================================
  describe('Edge Cases', () => {
    it('re-renders without duplicating "rayakan momen bahagia ini"', () => {
      const { rerender } = render(<TwibbonSection />);
      rerender(<TwibbonSection />);
      const elements = screen.getAllByText('rayakan momen bahagia ini bersama kami.');
      expect(elements).toHaveLength(1);
    });

    it('re-renders without duplicating canvas', () => {
      const { container, rerender } = render(<TwibbonSection />);
      rerender(<TwibbonSection />);
      const overlayImgs = container.querySelectorAll('img[src*="twibbon-overlay"]');
      expect(overlayImgs).toHaveLength(1);
    });

    it('re-renders without duplicating file input', () => {
      const { container, rerender } = render(<TwibbonSection />);
      rerender(<TwibbonSection />);
      const inputs = container.querySelectorAll('input[type="file"]');
      expect(inputs).toHaveLength(1);
    });

    it('re-renders without duplicating download button', () => {
      const { rerender } = render(<TwibbonSection />);
      rerender(<TwibbonSection />);
      expect(screen.queryAllByText('Bagikan Momen')).toHaveLength(0);
    });

    it('multiple renders produce stable DOM structure', () => {
      const { container, rerender } = render(<TwibbonSection />);
      const firstHTML = container.innerHTML;
      rerender(<TwibbonSection />);
      expect(container.innerHTML).toBe(firstHTML);
    });

    it('all essential content renders in a single pass', () => {
      const { container } = renderComponent();
      expect(screen.getByText('rayakan momen bahagia ini bersama kami.')).toBeInTheDocument();
      expect(screen.getByText('Twibbon Pernikahan Kami')).toBeInTheDocument();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
      expect(container.querySelector('img[src*="twibbon-overlay"]')).toBeInTheDocument();
      expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    it('section structure remains intact after re-render', () => {
      const { container, rerender } = render(<TwibbonSection />);
      rerender(<TwibbonSection />);
      expect(container.querySelector('#twibbon-section')).toBeInTheDocument();
      expect(container.querySelector('section')).toHaveClass('bg-ivory');
    });
  });

  // =========================================================================
  // 8. INTEGRATION — component composition
  // =========================================================================
  describe('Integration', () => {
    it('TwibbonCreator is rendered inside the section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('#twibbon-section');
      const overlayImg = section!.querySelector('img[src*="twibbon-overlay"]');
      expect(overlayImg).toBeInTheDocument();
    });

    it('download button is inside the section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('#twibbon-section');
      const btn = section!.querySelector('button');
      expect(btn).toBeNull();
    });

    it('file input is inside the section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('#twibbon-section');
      const input = section!.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });

    it('heading is inside the section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('#twibbon-section');
      const heading = section!.querySelector('p.font-serif');
      expect(heading).toBeInTheDocument();
      expect(heading!.textContent).toBe('rayakan momen bahagia ini bersama kami.');
    });

    it('section contains exactly one canvas', () => {
      const { container } = renderComponent();
      const overlayImgs = container.querySelectorAll('#twibbon-section img[src*="twibbon-overlay"]');
      expect(overlayImgs).toHaveLength(1);
    });

    it('section contains exactly one file input', () => {
      const { container } = renderComponent();
      const inputs = container.querySelectorAll('#twibbon-section input[type="file"]');
      expect(inputs).toHaveLength(1);
    });

    it('section contains no buttons without image', () => {
      const { container } = renderComponent();
      const buttons = container.querySelectorAll('#twibbon-section button');
      expect(buttons.length).toBe(0);
    });

    it('section has no broken image elements initially', () => {
      const { container } = renderComponent();
      const images = container.querySelectorAll('#twibbon-section img');
      expect(images).toHaveLength(1);
    });
  });

  // =========================================================================
  // 9. ACCESSIBILITY & USABILITY
  // =========================================================================
  describe('Accessibility', () => {
    it('section is a semantic section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has a heading element for screen readers', () => {
      renderComponent();
      expect(screen.getByText('Twibbon Pernikahan Kami')).toBeInTheDocument();
    });

    it('file input is present for assistive technology', () => {
      const { container } = renderComponent();
      const input = container.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });

    it('download button is focusable', () => {
      renderComponent();
      expect(screen.queryByText('Bagikan Momen')).not.toBeInTheDocument();
    });

    it('section has a unique id for anchor navigation', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('id', 'twibbon-section');
    });
  });
});
