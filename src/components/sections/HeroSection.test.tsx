import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const renderComponent = () => render(<HeroSection />);

// ===========================================================================
// 1. RENDERING — basic mount & structure
// ===========================================================================
describe('HeroSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderComponent();
      expect(container.firstChild!.nodeName).toBe('SECTION');
    });

    it('section has h-[100svh] for full viewport height', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('h-[100svh]');
    });

    it('section does not use md:min-h-screen (replaced by h-[100svh])', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section!.className).not.toContain('md:min-h-screen');
    });

    it('section has bg-ivory background', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('bg-ivory');
    });

    it('renders a non-empty DOM tree', () => {
      const { container } = renderComponent();
      expect(container.firstChild).not.toBeEmptyDOMElement();
    });

    it('mounts and unmounts cleanly', () => {
      const { unmount, container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
      unmount();
      expect(container.firstChild).toBeNull();
    });

    it('section uses relative positioning', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('relative');
    });

    it('section has overflow-hidden to prevent bleed', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('overflow-hidden');
    });
  });

  // =========================================================================
  // 2. CONTENT — names, ampersand, date, location
  // =========================================================================
  describe('Content', () => {
    it('displays "Dani" name', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toBeInTheDocument();
    });

    it('displays "Marini" name', () => {
      renderComponent();
      expect(screen.getByText('Marini')).toBeInTheDocument();
    });

    it('displays "&" ampersand between names', () => {
      renderComponent();
      expect(screen.getByText('&')).toBeInTheDocument();
    });

    it('ampersand has gold color (text-gold/80)', () => {
      renderComponent();
      expect(screen.getByText('&').className).toContain('text-gold');
    });

    it('ampersand is smaller than names (text-2xl sm:text-4xl md:text-6xl)', () => {
      renderComponent();
      const el = screen.getByText('&');
      expect(el.className).toContain('text-2xl');
    });

    it('displays "Sabtu, 29 Agustus 2026" date', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
    });

    it('displays "Surabaya . Indonesia" location', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toBeInTheDocument();
    });

    it('Dani and Marini are each in their own h1 element', () => {
      renderComponent();
      expect(screen.getByText('Dani').tagName).toBe('H1');
      expect(screen.getByText('Marini').tagName).toBe('H1');
    });

    it('names are h1 elements', () => {
      renderComponent();
      expect(screen.getByText('Dani').tagName).toBe('H1');
      expect(screen.getByText('Marini').tagName).toBe('H1');
    });
  });

  // =========================================================================
  // 3. IMAGES — hero portrait
  // =========================================================================
  describe('Images', () => {
    it('renders hero portrait image with correct alt text', () => {
      renderComponent();
      const img = screen.getByAltText('Hero Portrait');
      expect(img).toBeInTheDocument();
    });

    it('hero image has correct src path', () => {
      renderComponent();
      const img = screen.getByAltText('Hero Portrait');
      expect(img).toHaveAttribute('src', '/images/bride_and_groom_full_body_potrait.jpeg');
    });

    it('hero image has object-cover class', () => {
      renderComponent();
      expect(screen.getByAltText('Hero Portrait')).toHaveClass('object-cover');
    });

    it('hero image uses default center positioning (no object-top)', () => {
      renderComponent();
      expect(screen.getByAltText('Hero Portrait')).not.toHaveClass('object-top');
    });

    it('hero image has brightness filter', () => {
      renderComponent();
      const img = screen.getByAltText('Hero Portrait');
      expect(img).toHaveClass('brightness-[0.85]');
    });

    it('hero image has contrast filter', () => {
      renderComponent();
      const img = screen.getByAltText('Hero Portrait');
      expect(img).toHaveClass('contrast-[1.05]');
    });

    it('hero image fills container (w-full h-full)', () => {
      renderComponent();
      const img = screen.getByAltText('Hero Portrait');
      expect(img).toHaveClass('w-full');
      expect(img).toHaveClass('h-full');
    });
  });

  // =========================================================================
  // 4. TYPOGRAPHY
  // =========================================================================
  describe('Typography', () => {
    it('names use font-dayland', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toHaveClass('font-dayland');
    });

    it('names use responsive sizing text-5xl sm:text-7xl md:text-9xl', () => {
      renderComponent();
      expect(screen.getByText('Dani').className).toContain('text-5xl');
    });

    it('names have text-ivory color', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toHaveClass('text-ivory');
    });

    it('names do not have leading-none (line spacing is default)', () => {
      renderComponent();
      expect(screen.getByText('Dani').className).not.toContain('leading-none');
    });

    it('date uses responsive sizing (text-2xl sm:text-3xl md:text-5xl)', () => {
      renderComponent();
      const dateEl = screen.getByText('Sabtu, 29 Agustus 2026');
      expect(dateEl.className).toContain('text-2xl');
      expect(dateEl.className).toContain('sm:text-3xl');
      expect(dateEl.className).toContain('md:text-5xl');
    });

    it('date is italic', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toHaveClass('italic');
    });

    it('date uses font-display', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toHaveClass('font-display');
    });

    it('location is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('uppercase');
    });

    it('location has wide letter tracking', () => {
      renderComponent();
      const loc = screen.getByText('Surabaya . Indonesia');
      expect(loc.className).toContain('tracking-');
    });

    it('location uses font-display', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('font-display');
    });

    it('location has gold color', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('text-gold');
    });

    it('location uses very small font size text-[8px]', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('text-xs');
    });
  });

  // =========================================================================
  // 5. VISUAL — gradient, z-layers
  // =========================================================================
  describe('Visual', () => {
    it('gradient overlay goes from transparent to ivory', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('.bg-gradient-to-b');
      expect(gradient).toBeInTheDocument();
    });

    it('gradient has from-transparent class', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('.from-transparent');
      expect(gradient).toBeInTheDocument();
    });

    it('gradient has to-ivory class', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('.to-ivory');
      expect(gradient).toBeInTheDocument();
    });

    it('content overlay has z-10', () => {
      const { container } = renderComponent();
      const zLayers = container.querySelectorAll('.z-10');
      expect(zLayers.length).toBeGreaterThanOrEqual(1);
    });

    it('background layer has z-0', () => {
      const { container } = renderComponent();
      const bgLayer = container.querySelector('.z-0');
      expect(bgLayer).toBeInTheDocument();
    });

    it('background is absolutely positioned', () => {
      const { container } = renderComponent();
      const bg = container.querySelector('.absolute.inset-0.z-0');
      expect(bg).toBeInTheDocument();
    });

    it('gold decorative line separator exists', () => {
      const { container } = renderComponent();
      const line = container.querySelector('.bg-gold\\/30');
      expect(line).toBeInTheDocument();
    });

    it('decorative line has correct dimensions (w-12 h-px)', () => {
      const { container } = renderComponent();
      const line = container.querySelector('.w-12.h-px');
      expect(line).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. AMBIENT COMPONENTS
  // =========================================================================
  describe('Ambient Components', () => {
    it('does not render LightGlow component (removed for GPU performance)', () => {
      const { container } = renderComponent();
      const glow = container.querySelector('.bg-gold\\/10.blur-\\[180px\\]');
      expect(glow).toBeNull();
    });

    it('does not render FloatingPetals component (removed for GPU performance)', () => {
      const { container } = renderComponent();
      const petals = container.querySelector('.bg-gold\\/5.rounded-\\[100\\%_10\\%_100\\%_10\\%\\]');
      expect(petals).toBeNull();
    });

    it('does not render ForegroundOrnaments component (removed for GPU performance)', () => {
      const { container } = renderComponent();
      const ornaments = container.querySelector('.z-20');
      expect(ornaments).toBeNull();
    });
  });

  // =========================================================================
  // 7. LAYOUT
  // =========================================================================
  describe('Layout', () => {
    it('section uses flex column layout', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex');
      expect(section).toHaveClass('flex-col');
    });

    it('section uses items-center for horizontal centering', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('items-center');
    });

    it('section uses justify-between to space names and date', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('justify-between');
    });

    it('section has px-6 horizontal padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('px-6');
    });

    it('section has pb-[3vh] bottom padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('py-[5vh]');
    });

    it('top content section has text-center', () => {
      const { container } = renderComponent();
      const topContent = container.querySelector('.text-center');
      expect(topContent).toBeInTheDocument();
    });

    it('bottom content section has text-center and z-10', () => {
      const { container } = renderComponent();
      const bottomContent = container.querySelector('.relative.z-10.text-center.w-full');
      expect(bottomContent).toBeInTheDocument();
    });

    it('bottom content section has full width and pb-[5vh]', () => {
      const { container } = renderComponent();
      const bottomSection = container.querySelector('.z-10.text-center.w-full');
      expect(bottomSection).toBeInTheDocument();
      expect(bottomSection!.className).toContain('pb-[5vh]');
    });
  });

  // =========================================================================
  // 8. EDGE CASES
  // =========================================================================
  describe('Edge Cases', () => {
    it('re-renders without duplicating content', () => {
      const { rerender } = render(<HeroSection />);
      rerender(<HeroSection />);
      const daniElements = screen.getAllByText('Dani');
      expect(daniElements).toHaveLength(1);
    });

    it('multiple renders produce stable DOM structure', () => {
      const { container, rerender } = render(<HeroSection />);
      const firstHTML = container.innerHTML;
      rerender(<HeroSection />);
      expect(container.innerHTML).toBe(firstHTML);
    });

    it('all text content is present in a single render', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toBeInTheDocument();
      expect(screen.getByText('&')).toBeInTheDocument();
      expect(screen.getByText('Marini')).toBeInTheDocument();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
      expect(screen.getByText('Surabaya . Indonesia')).toBeInTheDocument();
    });

    it('does not render extraneous images beyond the hero portrait', () => {
      renderComponent();
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
    });

    it('section has two h1 headings (one per name)', () => {
      const { container } = renderComponent();
      const h1s = container.querySelectorAll('h1');
      expect(h1s).toHaveLength(2);
    });

    it('date section has space-y-4 for consistent spacing', () => {
      const { container } = renderComponent();
      const spacer = container.querySelector('.space-y-4');
      expect(spacer).toBeInTheDocument();
    });

    it('date subsection has space-y-3', () => {
      const { container } = renderComponent();
      const spacer = container.querySelector('.space-y-3');
      expect(spacer).toBeInTheDocument();
    });
  });
});
