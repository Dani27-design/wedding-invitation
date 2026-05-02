import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoupleSection } from './CoupleSection';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const renderComponent = () => render(<CoupleSection />);

// ===========================================================================
// 1. RENDERING — basic mount & structure
// ===========================================================================
describe('CoupleSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderComponent();
      expect(container.firstChild!.nodeName).toBe('SECTION');
    });

    it('section has id="couple-section" for navigation', () => {
      const { container } = renderComponent();
      expect(container.querySelector('#couple-section')).toBeInTheDocument();
    });

    it('section has min-h-screen for full viewport height', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')!.className).toContain('max-h-[100dvh]');
    });

    it('section has bg-ivory background', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('bg-ivory');
    });

    it('section uses relative positioning', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('relative');
    });

    it('section has py-6 vertical padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('py-4');
    });

    it('section uses flex items-center for vertical centering', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex');
      expect(section).toHaveClass('items-center');
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
  });

  // =========================================================================
  // 2. GROOM — name, label, parent info
  // =========================================================================
  describe('Groom', () => {
    it('displays groom full name', () => {
      renderComponent();
      expect(screen.getByText('M. Daniansyah Chusyaidin, S.Kom')).toBeInTheDocument();
    });

    it('displays "Mempelai Pria" label', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Pria')).toBeInTheDocument();
    });

    it('"Mempelai Pria" is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Pria')).toHaveClass('uppercase');
    });

    it('"Mempelai Pria" has gold color', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Pria')).toHaveClass('text-gold');
    });

    it('"Mempelai Pria" has font-black weight', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Pria')).toHaveClass('font-black');
    });

    it('displays groom parent info with Safiudin Sukri', () => {
      renderComponent();
      expect(screen.getByText(/Safiudin Sukri/)).toBeInTheDocument();
    });

    it('displays groom parent info with Indiarti', () => {
      renderComponent();
      expect(screen.getByText(/Indiarti/)).toBeInTheDocument();
    });

    it('groom parent info contains "Putra Bapak"', () => {
      renderComponent();
      expect(screen.getByText(/Putra Bapak/)).toBeInTheDocument();
    });

    it('groom name is in h3 element', () => {
      renderComponent();
      const el = screen.getByText('M. Daniansyah Chusyaidin, S.Kom');
      expect(el.tagName).toBe('H3');
    });
  });

  // =========================================================================
  // 3. BRIDE — name, label, parent info
  // =========================================================================
  describe('Bride', () => {
    it('displays bride full name', () => {
      renderComponent();
      expect(screen.getByText('Siti Nur Marini, A.Md.M')).toBeInTheDocument();
    });

    it('displays "Mempelai Wanita" label', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Wanita')).toBeInTheDocument();
    });

    it('"Mempelai Wanita" is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Wanita')).toHaveClass('uppercase');
    });

    it('"Mempelai Wanita" has gold color', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Wanita')).toHaveClass('text-gold');
    });

    it('"Mempelai Wanita" has font-black weight', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Wanita')).toHaveClass('font-black');
    });

    it('displays bride parent info with Margono', () => {
      renderComponent();
      expect(screen.getByText(/Margono/)).toBeInTheDocument();
    });

    it('displays bride parent info with (Almh) Sulami', () => {
      renderComponent();
      expect(screen.getByText(/Almh.*Sulami/)).toBeInTheDocument();
    });

    it('bride parent info contains "Putri Bapak"', () => {
      renderComponent();
      expect(screen.getByText(/Putri Bapak/)).toBeInTheDocument();
    });

    it('bride name is in h3 element', () => {
      renderComponent();
      const el = screen.getByText('Siti Nur Marini, A.Md.M');
      expect(el.tagName).toBe('H3');
    });
  });

  // =========================================================================
  // 4. IMAGES — groom and bride portraits
  // =========================================================================
  describe('Images', () => {
    it('renders groom image with alt="Dani"', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toBeInTheDocument();
    });

    it('renders bride image with alt="Marini"', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toBeInTheDocument();
    });

    it('groom image has lazy loading', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveAttribute('loading', 'lazy');
    });

    it('bride image has lazy loading', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toHaveAttribute('loading', 'lazy');
    });

    it('groom image has correct src path', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveAttribute('src', '/groom_face_potrait.jpeg');
    });

    it('bride image has correct src path', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toHaveAttribute('src', '/bride_face_potrait.jpeg');
    });

    it('groom image has object-cover', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveClass('object-cover');
    });

    it('bride image has object-cover', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toHaveClass('object-cover');
    });

    it('groom image has saturate filter', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveClass('saturate-[1.05]');
    });

    it('bride image has saturate filter', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toHaveClass('saturate-[1.05]');
    });

    it('groom image has contrast filter', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveClass('contrast-[1.02]');
    });

    it('bride image has contrast filter', () => {
      renderComponent();
      expect(screen.getByAltText('Marini')).toHaveClass('contrast-[1.02]');
    });

    it('both images fill their containers (w-full h-full)', () => {
      renderComponent();
      const dani = screen.getByAltText('Dani');
      const marini = screen.getByAltText('Marini');
      expect(dani).toHaveClass('w-full', 'h-full');
      expect(marini).toHaveClass('w-full', 'h-full');
    });
  });

  // =========================================================================
  // 5. TYPOGRAPHY
  // =========================================================================
  describe('Typography', () => {
    it('groom name uses responsive sizing (text-2xl sm:text-3xl md:text-5xl)', () => {
      renderComponent();
      const el = screen.getByText('M. Daniansyah Chusyaidin, S.Kom');
      expect(el.className).toContain('text-2xl');
      expect(el.className).toContain('sm:text-3xl');
      expect(el.className).toContain('md:text-5xl');
    });

    it('bride name uses responsive sizing (text-2xl sm:text-3xl md:text-5xl)', () => {
      renderComponent();
      const el = screen.getByText('Siti Nur Marini, A.Md.M');
      expect(el.className).toContain('text-2xl');
      expect(el.className).toContain('sm:text-3xl');
      expect(el.className).toContain('md:text-5xl');
    });

    it('groom name has tracking-tighter', () => {
      renderComponent();
      expect(screen.getByText('M. Daniansyah Chusyaidin, S.Kom')).toHaveClass('tracking-tighter');
    });

    it('bride name has tracking-tighter', () => {
      renderComponent();
      expect(screen.getByText('Siti Nur Marini, A.Md.M')).toHaveClass('tracking-tighter');
    });

    it('groom name uses font-serif', () => {
      renderComponent();
      expect(screen.getByText('M. Daniansyah Chusyaidin, S.Kom')).toHaveClass('font-serif');
    });

    it('bride name uses font-serif', () => {
      renderComponent();
      expect(screen.getByText('Siti Nur Marini, A.Md.M')).toHaveClass('font-serif');
    });

    it('groom name has leading-none', () => {
      renderComponent();
      expect(screen.getByText('M. Daniansyah Chusyaidin, S.Kom')).toHaveClass('leading-none');
    });

    it('bride name has leading-none', () => {
      renderComponent();
      expect(screen.getByText('Siti Nur Marini, A.Md.M')).toHaveClass('leading-none');
    });

    it('parent info uses very small text (text-[10px])', () => {
      renderComponent();
      const parentInfo = screen.getByText(/Safiudin Sukri/);
      expect(parentInfo).toHaveClass('text-[10px]');
    });

    it('parent info has tracking-widest', () => {
      renderComponent();
      const parentInfo = screen.getByText(/Safiudin Sukri/);
      expect(parentInfo).toHaveClass('tracking-widest');
    });

    it('parent info has muted ink color', () => {
      renderComponent();
      const parentInfo = screen.getByText(/Safiudin Sukri/);
      expect(parentInfo.className).toContain('text-ink/40');
    });
  });

  // =========================================================================
  // 6. VISUAL — blob shapes, rotating rings, shadows, filters
  // =========================================================================
  describe('Visual', () => {
    it('has shadow-2xl on portrait frames', () => {
      const { container } = renderComponent();
      const shadows = container.querySelectorAll('.shadow-2xl');
      expect(shadows.length).toBeGreaterThanOrEqual(2);
    });

    it('portrait frames have overflow-hidden', () => {
      const { container } = renderComponent();
      const frames = container.querySelectorAll('.overflow-hidden.shadow-2xl');
      expect(frames.length).toBeGreaterThanOrEqual(2);
    });

    it('has decorative rotating ring elements (border border-gold)', () => {
      const { container } = renderComponent();
      const rings = container.querySelectorAll('[class*="border-gold"]');
      expect(rings.length).toBeGreaterThanOrEqual(2);
    });

    it('gold overlay exists on images (bg-gold/5 mix-blend-soft-light)', () => {
      const { container } = renderComponent();
      const overlays = container.querySelectorAll('.bg-gold\\/5.mix-blend-soft-light');
      expect(overlays.length).toBeGreaterThanOrEqual(2);
    });

    it('images have hover scale transition', () => {
      renderComponent();
      const dani = screen.getByAltText('Dani');
      expect(dani.className).toContain('hover:scale-');
      expect(dani).toHaveClass('transition-all');
    });

    it('images have long transition duration (duration-1000)', () => {
      renderComponent();
      expect(screen.getByAltText('Dani')).toHaveClass('duration-1000');
    });
  });

  // =========================================================================
  // 7. LAYOUT — grid, overlapping, z-layers
  // =========================================================================
  describe('Layout', () => {
    it('uses 2-column grid on md+ (md:grid-cols-2)', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid!.className).toContain('md:grid-cols-2');
    });

    it('grid has gap-8 spacing', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4');
    });

    it('groom portrait has z-10 layering', () => {
      const { container } = renderComponent();
      const z10 = container.querySelector('.z-10[class*="w-[65%]"]');
      expect(z10).toBeInTheDocument();
    });

    it('bride portrait has z-20 layering for overlap', () => {
      const { container } = renderComponent();
      const z20 = container.querySelector('.z-20[class*="w-[65%]"]');
      expect(z20).toBeInTheDocument();
    });

    it('portraits use 65% width for overlapping design', () => {
      const { container } = renderComponent();
      const portraits = container.querySelectorAll('[class*="w-[65%]"]');
      expect(portraits.length).toBeGreaterThanOrEqual(2);
    });

    it('groom portrait is positioned top-left (top-0 left-4)', () => {
      const { container } = renderComponent();
      const groomContainer = container.querySelector('.absolute.top-0.left-4');
      expect(groomContainer).toBeInTheDocument();
    });

    it('bride portrait is positioned bottom-right (bottom-4 right-4)', () => {
      const { container } = renderComponent();
      const brideContainer = container.querySelector('.absolute.bottom-4.right-4');
      expect(brideContainer).toBeInTheDocument();
    });

    it('portrait container has defined height (h-[400px] md:h-[500px])', () => {
      const { container } = renderComponent();
      const portraitArea = container.querySelector('[class*="h-[40vh]"]');
      expect(portraitArea).toBeInTheDocument();
    });

    it('container has max-w-5xl', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.max-w-5xl')).toBeInTheDocument();
    });

    it('container is centered with mx-auto', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('text info section has md:pl-16 left padding on desktop', () => {
      const { container } = renderComponent();
      const textSection = container.querySelector('[class*="md:pl-16"]');
      expect(textSection).toBeInTheDocument();
    });

    it('text is center-aligned on mobile, left on desktop', () => {
      const { container } = renderComponent();
      const textSection = container.querySelector('.text-center[class*="md:text-left"]');
      expect(textSection).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 8. SEPARATOR — heart divider, gold lines
  // =========================================================================
  describe('Separator', () => {
    it('has gold horizontal lines as dividers', () => {
      const { container } = renderComponent();
      const lines = container.querySelectorAll('.h-px.w-12.bg-gold\\/20');
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('has Heart icon between groom and bride info', () => {
      const { container } = renderComponent();
      const heart = container.querySelector('.text-gold\\/30');
      expect(heart).toBeInTheDocument();
    });

    it('separator is horizontally centered with gap-4', () => {
      const { container } = renderComponent();
      const separator = container.querySelector('.items-center.gap-4');
      expect(separator).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 9. EDGE CASES
  // =========================================================================
  describe('Edge Cases', () => {
    it('re-renders without duplicating names', () => {
      const { rerender } = render(<CoupleSection />);
      rerender(<CoupleSection />);
      const groomNames = screen.getAllByText('M. Daniansyah Chusyaidin, S.Kom');
      expect(groomNames).toHaveLength(1);
    });

    it('re-renders without duplicating bride name', () => {
      const { rerender } = render(<CoupleSection />);
      rerender(<CoupleSection />);
      const brideNames = screen.getAllByText('Siti Nur Marini, A.Md.M');
      expect(brideNames).toHaveLength(1);
    });

    it('exactly two portrait images are rendered', () => {
      renderComponent();
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });

    it('all essential content is present in one render', () => {
      renderComponent();
      expect(screen.getByText('Mempelai Pria')).toBeInTheDocument();
      expect(screen.getByText('Mempelai Wanita')).toBeInTheDocument();
      expect(screen.getByText('M. Daniansyah Chusyaidin, S.Kom')).toBeInTheDocument();
      expect(screen.getByText('Siti Nur Marini, A.Md.M')).toBeInTheDocument();
      expect(screen.getByAltText('Dani')).toBeInTheDocument();
      expect(screen.getByAltText('Marini')).toBeInTheDocument();
    });

    it('multiple renders produce stable DOM', () => {
      const { container, rerender } = render(<CoupleSection />);
      const firstHTML = container.innerHTML;
      rerender(<CoupleSection />);
      expect(container.innerHTML).toBe(firstHTML);
    });

    it('section has exactly two h3 headings for names', () => {
      const { container } = renderComponent();
      const h3s = container.querySelectorAll('h3');
      expect(h3s).toHaveLength(2);
    });

    it('labels appear before their corresponding names in DOM order', () => {
      const { container } = renderComponent();
      const allText = container.textContent || '';
      const priaIndex = allText.indexOf('Mempelai Pria');
      const groomIndex = allText.indexOf('M. Daniansyah');
      const wanitaIndex = allText.indexOf('Mempelai Wanita');
      const brideIndex = allText.indexOf('Siti Nur Marini');
      expect(priaIndex).toBeLessThan(groomIndex);
      expect(wanitaIndex).toBeLessThan(brideIndex);
    });
  });
});
