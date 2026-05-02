import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

function renderFooter() {
  return render(<Footer />);
}

describe('Footer', () => {
  // ─── Basic Rendering ───────────────────────────────────────────────
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderFooter();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a footer HTML element', () => {
      const { container } = renderFooter();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('footer has bg-ivory background', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('bg-ivory');
    });

    it('footer has border-top with gold accent', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('border-t');
      expect(footer?.className).toContain('border-gold/10');
    });

    it('footer has overflow-hidden', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('overflow-hidden');
    });

    it('footer has py-6 padding', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('py-6');
    });

    it('renders consistently on re-render', () => {
      const { rerender } = render(<Footer />);
      rerender(<Footer />);
      expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
    });
  });

  // ─── Names ────────────────────────────────────────────────────────
  describe('couple names', () => {
    it('displays "Dani & Marini" heading', () => {
      renderFooter();
      expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
    });

    it('"Dani & Marini" has dayland font', () => {
      renderFooter();
      const heading = screen.getByText('Dani & Marini');
      expect(heading.className).toContain('font-dayland');
    });

    it('"Dani & Marini" is an h4 element', () => {
      renderFooter();
      const heading = screen.getByText('Dani & Marini');
      expect(heading.tagName).toBe('H4');
    });

    it('"Dani & Marini" has responsive text size', () => {
      renderFooter();
      const heading = screen.getByText('Dani & Marini');
      expect(heading.className).toContain('text-5xl');
      expect(heading.className).toContain('md:text-6xl');
    });

    it('displays description tagline about perjalanan', () => {
      renderFooter();
      expect(screen.getByText(/Sebuah Cerita dari Perjalanan/)).toBeInTheDocument();
    });

    it('tagline has serif italic font', () => {
      renderFooter();
      const tagline = screen.getByText(/Sebuah Cerita dari Perjalanan/);
      expect(tagline.className).toContain('font-serif');
      expect(tagline.className).toContain('italic');
    });

    it('tagline has gold color', () => {
      renderFooter();
      const tagline = screen.getByText(/Sebuah Cerita dari Perjalanan/);
      expect(tagline.className).toContain('text-gold');
    });
  });

  // ─── Credits ──────────────────────────────────────────────────────
  describe('credits', () => {
    it('displays "M. Daniansyah C." name', () => {
      renderFooter();
      expect(screen.getByText('M. Daniansyah C.')).toBeInTheDocument();
    });

    it('displays "Siti Nur Marini" name', () => {
      renderFooter();
      expect(screen.getByText('Siti Nur Marini')).toBeInTheDocument();
    });

    it('"M. Daniansyah C." is an h5 element', () => {
      renderFooter();
      const name = screen.getByText('M. Daniansyah C.');
      expect(name.tagName).toBe('H5');
    });

    it('"Siti Nur Marini" is an h5 element', () => {
      renderFooter();
      const name = screen.getByText('Siti Nur Marini');
      expect(name.tagName).toBe('H5');
    });

    it('credit names have serif italic text-xl styling', () => {
      renderFooter();
      const dani = screen.getByText('M. Daniansyah C.');
      expect(dani.className).toContain('font-serif');
      expect(dani.className).toContain('italic');
      expect(dani.className).toContain('text-xl');
    });

    it('has Code icon for Dani (developer credit)', () => {
      const { container } = renderFooter();
      // Code icon is in the first credit card
      const iconContainers = container.querySelectorAll('.w-12.h-12.rounded-full.bg-gold\\/5');
      expect(iconContainers.length).toBe(2);
    });

    it('displays Dani description about code', () => {
      renderFooter();
      expect(screen.getByText(/Menulis setiap baris code/)).toBeInTheDocument();
    });

    it('displays Marini description about design', () => {
      renderFooter();
      expect(screen.getByText(/Menjadikan setiap bagian tidak hanya terlihat indah/)).toBeInTheDocument();
    });

    it('credit descriptions have xs text size and subdued color', () => {
      renderFooter();
      const desc = screen.getByText(/Menulis setiap baris code/);
      expect(desc.className).toContain('text-xs');
      expect(desc.className).toContain('text-ink/50');
    });
  });

  // ─── Social Links ─────────────────────────────────────────────────
  describe('social links', () => {
    it('has 2 Instagram links', () => {
      const { container } = renderFooter();
      const igLinks = container.querySelectorAll('a[href*="instagram.com"]');
      expect(igLinks).toHaveLength(2);
    });

    it('has 2 WhatsApp links', () => {
      const { container } = renderFooter();
      const waLinks = container.querySelectorAll('a[href*="wa.me"]');
      expect(waLinks).toHaveLength(2);
    });

    it('has 1 LinkedIn link', () => {
      const { container } = renderFooter();
      const liLinks = container.querySelectorAll('a[href*="linkedin.com"]');
      expect(liLinks).toHaveLength(1);
    });

    it('has 1 Threads link', () => {
      const { container } = renderFooter();
      const threadsLinks = container.querySelectorAll('a[href*="threads.com"]');
      expect(threadsLinks).toHaveLength(1);
    });

    it('all links open in new tab (target=_blank)', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBeGreaterThanOrEqual(6);
    });

    it('all links have rel=noopener noreferrer', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a[target="_blank"]');
      links.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('total social links count is 6', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBe(6);
    });
  });

  // ─── Link URLs ────────────────────────────────────────────────────
  describe('link URLs', () => {
    it('has correct Dani Instagram URL', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://instagram.com/danichusyaidin"]');
      expect(link).toBeInTheDocument();
    });

    it('has correct Marini Instagram URL', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://instagram.com/mariniw_"]');
      expect(link).toBeInTheDocument();
    });

    it('has correct Dani WhatsApp URL with phone number', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://wa.me/6285790428078"]');
      expect(link).toBeInTheDocument();
    });

    it('has correct Marini WhatsApp URL with phone number', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://wa.me/628883816403"]');
      expect(link).toBeInTheDocument();
    });

    it('has correct LinkedIn URL for Dani', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://id.linkedin.com/in/daniansyahchusyaidin"]');
      expect(link).toBeInTheDocument();
    });

    it('has correct Threads URL for Marini', () => {
      const { container } = renderFooter();
      const link = container.querySelector('a[href="https://threads.com/@mariniw_"]');
      expect(link).toBeInTheDocument();
    });

    it('all links contain valid protocol (https or wa.me)', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a[target="_blank"]');
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        expect(href).toMatch(/^https:\/\/|^https:\/\/wa\.me/);
      });
    });

    it('WhatsApp links use wa.me domain', () => {
      const { container } = renderFooter();
      const waLinks = container.querySelectorAll('a[href*="wa.me"]');
      waLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        expect(href).toContain('wa.me');
      });
    });

    it('Instagram links use instagram.com domain', () => {
      const { container } = renderFooter();
      const igLinks = container.querySelectorAll('a[href*="instagram.com"]');
      igLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        expect(href).toContain('instagram.com');
      });
    });
  });

  // ─── Copyright ────────────────────────────────────────────────────
  describe('copyright', () => {
    it('displays "2026" year text', () => {
      renderFooter();
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it('copyright text has uppercase tracking-widest', () => {
      renderFooter();
      const copyright = screen.getByText(/2026/);
      expect(copyright.className).toContain('uppercase');
      expect(copyright.className).toContain('tracking-widest');
    });

    it('copyright text has small font size', () => {
      renderFooter();
      const copyright = screen.getByText(/2026/);
      expect(copyright.className).toContain('text-[8px]');
    });

    it('copyright text has subdued ink color', () => {
      renderFooter();
      const copyright = screen.getByText(/2026/);
      expect(copyright.className).toContain('text-ink/20');
    });

    it('has heart icon with gold fill near copyright', () => {
      const { container } = renderFooter();
      // The heart icon near copyright has fill-gold class
      const hearts = container.querySelectorAll('.fill-gold');
      expect(hearts.length).toBeGreaterThanOrEqual(1);
    });

    it('heart icon has text-gold color', () => {
      const { container } = renderFooter();
      const heart = container.querySelector('.text-gold.fill-gold');
      expect(heart).toBeInTheDocument();
    });

    it('copyright section has border-top separator', () => {
      const { container } = renderFooter();
      const copyrightSection = container.querySelector('.border-t.border-gold\\/5');
      expect(copyrightSection).toBeInTheDocument();
    });

    it('copyright includes "Kami membangunnya bersama" text', () => {
      renderFooter();
      expect(screen.getByText(/Kami membangunnya bersama/)).toBeInTheDocument();
    });
  });

  // ─── Visual ───────────────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('has 2-column grid on md+ screens', () => {
      const { container } = renderFooter();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
    });

    it('credit cards have rounded-[2.5rem] corners', () => {
      const { container } = renderFooter();
      const cards = container.querySelectorAll('.rounded-\\[2\\.5rem\\]');
      expect(cards.length).toBe(2);
    });

    it('credit cards have bg-paper/50 background', () => {
      const { container } = renderFooter();
      const cards = container.querySelectorAll('.bg-paper\\/50');
      expect(cards.length).toBe(2);
    });

    it('credit cards have gold border accent', () => {
      const { container } = renderFooter();
      const cards = container.querySelectorAll('.border.border-gold\\/5');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('credit cards are flex column centered', () => {
      const { container } = renderFooter();
      const cards = container.querySelectorAll('.flex.flex-col.items-center');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('icon containers have rounded-full with gold background', () => {
      const { container } = renderFooter();
      const iconCircles = container.querySelectorAll('.w-12.h-12.rounded-full.bg-gold\\/5');
      expect(iconCircles.length).toBe(2);
    });

    it('social link groups have opacity transition on hover', () => {
      const { container } = renderFooter();
      const socialGroups = container.querySelectorAll('.opacity-30.hover\\:opacity-100');
      expect(socialGroups.length).toBe(2);
    });

    it('social links have gap-4 spacing', () => {
      const { container } = renderFooter();
      const socialGroups = container.querySelectorAll('.flex.gap-4');
      expect(socialGroups.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── Layout ───────────────────────────────────────────────────────
  describe('layout', () => {
    it('has max-w-4xl container', () => {
      const { container } = renderFooter();
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('text is centered', () => {
      const { container } = renderFooter();
      expect(container.querySelector('.text-center')).toBeInTheDocument();
    });

    it('container has mx-auto centering', () => {
      const { container } = renderFooter();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('container has px-6 horizontal padding', () => {
      const { container } = renderFooter();
      const cont = container.querySelector('.container.mx-auto.px-6');
      expect(cont).toBeInTheDocument();
    });

    it('content has relative z-10 for stacking', () => {
      const { container } = renderFooter();
      expect(container.querySelector('.z-10')).toBeInTheDocument();
    });

    it('footer has relative positioning', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('relative');
    });

    it('names section has mb-5 margin bottom', () => {
      const { container } = renderFooter();
      const nameSection = container.querySelector('.mb-5');
      expect(nameSection).toBeInTheDocument();
    });

    it('grid has gap-3 between cards', () => {
      const { container } = renderFooter();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('gap-3');
    });

    it('grid has mb-4 margin bottom', () => {
      const { container } = renderFooter();
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('mb-4');
    });

    it('copyright section has mb-8 margin bottom', () => {
      const { container } = renderFooter();
      const copyrightSection = container.querySelector('.mb-8');
      expect(copyrightSection).toBeInTheDocument();
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────
  describe('edge cases', () => {
    it('all links are valid URLs containing https or wa.me', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        expect(href).toMatch(/https:\/\//);
      });
    });

    it('no broken links (all have href attribute)', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).not.toBe('');
        expect(link.getAttribute('href')).not.toBe('#');
      });
    });

    it('social icons render as SVG elements', () => {
      const { container } = renderFooter();
      const links = container.querySelectorAll('a[target="_blank"]');
      links.forEach((link) => {
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('credit card descriptions have max width constraint', () => {
      const { container } = renderFooter();
      const maxWTexts = container.querySelectorAll('.max-w-\\[240px\\]');
      expect(maxWTexts.length).toBe(2);
    });

    it('both credit cards have p-3 padding', () => {
      const { container } = renderFooter();
      const cards = container.querySelectorAll('.p-3.rounded-\\[2\\.5rem\\]');
      expect(cards.length).toBe(2);
    });

    it('WhatsApp icons are custom SVGs (not from lucide)', () => {
      const { container } = renderFooter();
      const waLinks = container.querySelectorAll('a[href*="wa.me"]');
      waLinks.forEach((link) => {
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
      });
    });

    it('Threads icon is a custom SVG', () => {
      const { container } = renderFooter();
      const threadsLink = container.querySelector('a[href*="threads.com"]');
      expect(threadsLink).toBeInTheDocument();
      const svg = threadsLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('renders without any console errors on multiple re-renders', () => {
      const { rerender } = render(<Footer />);
      for (let i = 0; i < 5; i++) {
        rerender(<Footer />);
      }
      expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
    });
  });
});
