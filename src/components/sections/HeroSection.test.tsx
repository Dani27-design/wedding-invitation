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

    it('section has min-h-[100vh] for full viewport height', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-[100vh]');
    });

    it('section has md:min-h-screen for desktop', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section!.className).toContain('md:min-h-screen');
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

    it('ampersand has gold color', () => {
      renderComponent();
      expect(screen.getByText('&')).toHaveClass('text-gold');
    });

    it('ampersand is smaller than names (text-4xl md:text-5xl)', () => {
      renderComponent();
      const el = screen.getByText('&');
      expect(el.className).toContain('text-4xl');
    });

    it('displays "Sabtu, 29 Agustus 2026" date', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
    });

    it('displays "Surabaya . Indonesia" location', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toBeInTheDocument();
    });

    it('Dani and Marini are each in block span elements', () => {
      renderComponent();
      expect(screen.getByText('Dani').tagName).toBe('SPAN');
      expect(screen.getByText('Dani')).toHaveClass('block');
      expect(screen.getByText('Marini').tagName).toBe('SPAN');
      expect(screen.getByText('Marini')).toHaveClass('block');
    });

    it('names are inside an h1 element', () => {
      renderComponent();
      const h1 = screen.getByText('Dani').closest('h1');
      expect(h1).toBeInTheDocument();
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
      expect(img).toHaveAttribute('src', '/bride_and_groom_full_body_potrait.jpeg');
    });

    it('hero image has object-cover class', () => {
      renderComponent();
      expect(screen.getByAltText('Hero Portrait')).toHaveClass('object-cover');
    });

    it('hero image has object-top positioning', () => {
      renderComponent();
      expect(screen.getByAltText('Hero Portrait')).toHaveClass('object-top');
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
      const h1 = screen.getByText('Dani').closest('h1');
      expect(h1).toHaveClass('font-dayland');
    });

    it('names use responsive sizing text-7xl md:text-[8rem]', () => {
      renderComponent();
      const h1 = screen.getByText('Dani').closest('h1');
      expect(h1!.className).toContain('text-7xl');
    });

    it('names have text-ink color', () => {
      renderComponent();
      const h1 = screen.getByText('Dani').closest('h1');
      expect(h1).toHaveClass('text-ink');
    });

    it('names have leading-none for tight line spacing', () => {
      renderComponent();
      const h1 = screen.getByText('Dani').closest('h1');
      expect(h1).toHaveClass('leading-none');
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

    it('location uses font-sans', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('font-sans');
    });

    it('location has gold color', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('text-gold');
    });

    it('location uses very small font size text-[8px]', () => {
      renderComponent();
      expect(screen.getByText('Surabaya . Indonesia')).toHaveClass('text-[8px]');
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
    it('renders LightGlow component', () => {
      const { container } = renderComponent();
      const glow = container.querySelector('.bg-gold\\/10.blur-\\[180px\\]');
      expect(glow).toBeInTheDocument();
    });

    it('renders FloatingPetals component', () => {
      const { container } = renderComponent();
      const petals = container.querySelector('.bg-gold\\/5.rounded-\\[100\\%_10\\%_100\\%_10\\%\\]');
      expect(petals).toBeInTheDocument();
    });

    it('renders ForegroundOrnaments component', () => {
      const { container } = renderComponent();
      const ornaments = container.querySelector('.z-20');
      expect(ornaments).toBeInTheDocument();
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

    it('section has pb-6 bottom padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('pb-6');
    });

    it('top content section has text-center', () => {
      const { container } = renderComponent();
      const topContent = container.querySelector('.z-10.text-center.pt-6');
      expect(topContent).toBeInTheDocument();
    });

    it('bottom content section has text-center', () => {
      const { container } = renderComponent();
      const sections = container.querySelectorAll('.z-10.text-center');
      expect(sections.length).toBeGreaterThanOrEqual(2);
    });

    it('top and bottom sections have full width', () => {
      const { container } = renderComponent();
      const wideSections = container.querySelectorAll('.z-10.text-center.w-full');
      expect(wideSections.length).toBe(2);
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

    it('section has only one h1 heading', () => {
      const { container } = renderComponent();
      const h1s = container.querySelectorAll('h1');
      expect(h1s).toHaveLength(1);
    });

    it('date section has space-y-6 for consistent spacing', () => {
      const { container } = renderComponent();
      const spacer = container.querySelector('.space-y-6');
      expect(spacer).toBeInTheDocument();
    });

    it('date subsection has space-y-3', () => {
      const { container } = renderComponent();
      const spacer = container.querySelector('.space-y-3');
      expect(spacer).toBeInTheDocument();
    });
  });
});
