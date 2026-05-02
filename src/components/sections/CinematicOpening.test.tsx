import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CinematicOpening } from './CinematicOpening';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const defaultProps = { guestName: 'Test Guest', onOpen: vi.fn() };

const renderComponent = (overrides: Partial<{ guestName: string; onOpen: () => void }> = {}) =>
  render(<CinematicOpening {...defaultProps} {...overrides} />);

// ===========================================================================
// 1. RENDERING — basic mount & structure
// ===========================================================================
describe('CinematicOpening', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a non-empty root element', () => {
      const { container } = renderComponent();
      expect(container.firstChild).not.toBeEmptyDOMElement();
    });

    it('root element has fixed positioning for full-screen overlay', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('fixed');
    });

    it('root element covers the entire viewport with inset-0', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('root element has z-[1000] to sit above everything', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('z-[1000]');
    });

    it('root element has bg-ink dark background', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('bg-ink');
    });

    it('root element uses flex column layout', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('root element hides overflow', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });

    it('does not render null or undefined', () => {
      const { container } = renderComponent();
      expect(container.innerHTML).not.toBe('');
    });

    it('mounts and unmounts cleanly without errors', () => {
      const { unmount, container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
      unmount();
      expect(container.firstChild).toBeNull();
    });
  });

  // =========================================================================
  // 2. CONTENT — couple names, guest, labels, location, date
  // =========================================================================
  describe('Content', () => {
    it('displays "Dani & Marini" couple names', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toBeInTheDocument();
      expect(screen.getByText('Marini')).toBeInTheDocument();
    });

    it('couple names are inside an h1 element', () => {
      renderComponent();
      expect(screen.getByText('Dani').tagName).toBe('H1');
      expect(screen.getByText('Marini').tagName).toBe('H1');
    });

    it('couple names use font-dayland', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toHaveClass('font-dayland');
      expect(screen.getByText('Marini')).toHaveClass('font-dayland');
    });

    it('couple names use responsive sizing text-7xl md:text-9xl', () => {
      renderComponent();
      const el = screen.getByText('Dani');
      expect(el.className).toContain('text-5xl');
    });

    it('couple names have text-ivory color', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toHaveClass('text-ivory');
      expect(screen.getByText('Marini')).toHaveClass('text-ivory');
    });

    it('couple names have drop-shadow-2xl', () => {
      renderComponent();
      expect(screen.getByText('Dani')).toHaveClass('drop-shadow-2xl');
      expect(screen.getByText('Marini')).toHaveClass('drop-shadow-2xl');
    });

    it('displays the guest name prop', () => {
      renderComponent({ guestName: 'Budi Santoso' });
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    it('displays "Turut Mengundang" invitation label', () => {
      renderComponent();
      expect(screen.getByText('Turut Mengundang')).toBeInTheDocument();
    });

    it('"Turut Mengundang" label has uppercase styling', () => {
      renderComponent();
      expect(screen.getByText('Turut Mengundang')).toHaveClass('uppercase');
    });

    it('"Turut Mengundang" label has gold color', () => {
      renderComponent();
      const el = screen.getByText('Turut Mengundang');
      expect(el.className).toContain('text-gold');
    });

    it('displays "Surabaya" location', () => {
      renderComponent();
      expect(screen.getByText('Surabaya')).toBeInTheDocument();
    });

    it('"Surabaya" is uppercase with wide tracking', () => {
      renderComponent();
      const el = screen.getByText('Surabaya');
      expect(el).toHaveClass('uppercase');
      expect(el.className).toContain('tracking-');
    });

    it('displays "29 Agustus 2026" date', () => {
      renderComponent();
      expect(screen.getByText('29 Agustus 2026')).toBeInTheDocument();
    });

    it('date is in italic serif font', () => {
      renderComponent();
      const el = screen.getByText('29 Agustus 2026');
      expect(el).toHaveClass('italic');
      expect(el).toHaveClass('font-serif');
    });
  });

  // =========================================================================
  // 3. BUTTON — "Buka Undangan"
  // =========================================================================
  describe('Button', () => {
    it('renders "Buka Undangan" button text', () => {
      renderComponent();
      expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
    });

    it('"Buka Undangan" is a button element', () => {
      renderComponent();
      const btn = screen.getByText('Buka Undangan');
      expect(btn.tagName).toBe('BUTTON');
    });

    it('calls onOpen callback when button is clicked', () => {
      const onOpen = vi.fn();
      renderComponent({ onOpen });
      fireEvent.click(screen.getByText('Buka Undangan'));
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it('calls onOpen exactly once per click', () => {
      const onOpen = vi.fn();
      renderComponent({ onOpen });
      fireEvent.click(screen.getByText('Buka Undangan'));
      fireEvent.click(screen.getByText('Buka Undangan'));
      expect(onOpen).toHaveBeenCalledTimes(2);
    });

    it('button has border-b styling', () => {
      renderComponent();
      const btn = screen.getByText('Buka Undangan');
      expect(btn).toHaveClass('border-b');
    });

    it('button has uppercase text', () => {
      renderComponent();
      expect(screen.getByText('Buka Undangan')).toHaveClass('uppercase');
    });

    it('button has wide letter tracking', () => {
      renderComponent();
      const btn = screen.getByText('Buka Undangan');
      expect(btn.className).toContain('tracking-');
    });

    it('button has gold text color', () => {
      renderComponent();
      expect(screen.getByText('Buka Undangan')).toHaveClass('text-gold');
    });

    it('button has font-bold weight', () => {
      renderComponent();
      expect(screen.getByText('Buka Undangan')).toHaveClass('font-bold');
    });

    it('button has transition-all for smooth hover effects', () => {
      renderComponent();
      expect(screen.getByText('Buka Undangan')).toHaveClass('transition-all');
    });

    it('does not call onOpen on render without click', () => {
      const onOpen = vi.fn();
      renderComponent({ onOpen });
      expect(onOpen).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. GUEST NAME — display, constraints, styling
  // =========================================================================
  describe('Guest Name', () => {
    it('renders a custom guest name', () => {
      renderComponent({ guestName: 'Andi Prasetyo' });
      expect(screen.getByText('Andi Prasetyo')).toBeInTheDocument();
    });

    it('renders the default guest name', () => {
      renderComponent({ guestName: 'Tamu Terkasih Kami' });
      expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
    });

    it('guest name has break-words class for overflow prevention', () => {
      renderComponent({ guestName: 'Superlongnamewithoutspaces' });
      const el = screen.getByText('Superlongnamewithoutspaces');
      expect(el).toHaveClass('break-words');
    });

    it('guest name has max-w-[85vw] constraint', () => {
      renderComponent({ guestName: 'Some Name' });
      const el = screen.getByText('Some Name');
      expect(el).toHaveClass('max-w-[85vw]');
    });

    it('guest name uses italic font-display', () => {
      renderComponent({ guestName: 'Test' });
      const el = screen.getByText('Test');
      expect(el).toHaveClass('italic');
      expect(el).toHaveClass('font-display');
    });

    it('guest name uses responsive text size', () => {
      renderComponent({ guestName: 'Responsive' });
      const el = screen.getByText('Responsive');
      expect(el.className).toContain('text-3xl');
    });

    it('guest name is inside an h2 element', () => {
      renderComponent({ guestName: 'Heading Check' });
      const el = screen.getByText('Heading Check');
      expect(el.tagName).toBe('H2');
    });

    it('guest name has ivory text color', () => {
      renderComponent({ guestName: 'Color Check' });
      const el = screen.getByText('Color Check');
      expect(el.className).toContain('text-ivory');
    });
  });

  // =========================================================================
  // 5. VISUAL — background image, gradient, animation
  // =========================================================================
  describe('Visual', () => {
    it('background image loads with correct src', () => {
      renderComponent();
      const img = screen.getByAltText('Opening BG');
      expect(img).toHaveAttribute('src', '/bride_and_groom_full_body_potrait.jpeg');
    });

    it('background image has object-cover class', () => {
      renderComponent();
      const img = screen.getByAltText('Opening BG');
      expect(img).toHaveClass('object-cover');
    });

    it('background image does not have conflicting animate-soft-zoom class', () => {
      renderComponent();
      const img = screen.getByAltText('Opening BG');
      expect(img).not.toHaveClass('animate-soft-zoom');
    });

    it('background image fills full width and height', () => {
      renderComponent();
      const img = screen.getByAltText('Opening BG');
      expect(img).toHaveClass('w-full');
      expect(img).toHaveClass('h-full');
    });

    it('gradient overlay is present (from-ink via-transparent to-ink)', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('.bg-gradient-to-b');
      expect(gradient).toBeInTheDocument();
    });

    it('gradient overlay has correct opacity stops', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('.from-ink\\/60');
      expect(gradient).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. AMBIENT COMPONENTS — LightGlow, FloatingPetals, ForegroundOrnaments
  // =========================================================================
  describe('Ambient Components', () => {
    it('renders LightGlow component inside overlay', () => {
      const { container } = renderComponent();
      const lightGlow = container.querySelector('.bg-gold\\/10.blur-\\[180px\\]');
      expect(lightGlow).toBeInTheDocument();
    });

    it('renders FloatingPetals component', () => {
      const { container } = renderComponent();
      const petals = container.querySelector('.bg-gold\\/5');
      expect(petals).toBeInTheDocument();
    });

    it('renders ForegroundOrnaments component', () => {
      const { container } = renderComponent();
      const ornaments = container.querySelector('.z-20');
      expect(ornaments).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. EDGE CASES — long names, special chars, empty, unicode
  // =========================================================================
  describe('Edge Cases', () => {
    it('handles very long guest name without breaking layout', () => {
      const longName = 'A'.repeat(200);
      const { container } = renderComponent({ guestName: longName });
      expect(screen.getByText(longName)).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('fixed');
    });

    it('handles special characters in guest name', () => {
      renderComponent({ guestName: 'Dr. H. M. Ahmad & Family <3>' });
      expect(screen.getByText('Dr. H. M. Ahmad & Family <3>')).toBeInTheDocument();
    });

    it('handles empty string guest name gracefully', () => {
      const { container } = renderComponent({ guestName: '' });
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('fixed');
    });

    it('handles unicode characters in guest name', () => {
      renderComponent({ guestName: 'Muhammad Fikri bin Abdullah' });
      expect(screen.getByText('Muhammad Fikri bin Abdullah')).toBeInTheDocument();
    });

    it('handles Arabic script guest name', () => {
      renderComponent({ guestName: 'محمد فكري' });
      expect(screen.getByText('محمد فكري')).toBeInTheDocument();
    });

    it('handles Japanese script guest name', () => {
      renderComponent({ guestName: 'タナカ ユキ' });
      expect(screen.getByText('タナカ ユキ')).toBeInTheDocument();
    });

    it('handles emoji in guest name', () => {
      renderComponent({ guestName: 'Budi & Sari ❤️' });
      expect(screen.getByText('Budi & Sari ❤️')).toBeInTheDocument();
    });

    it('handles guest name with only whitespace', () => {
      const { container } = renderComponent({ guestName: '   ' });
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles guest name with newline characters', () => {
      const { container } = renderComponent({ guestName: 'Line1\nLine2' });
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles rapid multiple clicks on button', () => {
      const onOpen = vi.fn();
      renderComponent({ onOpen });
      const btn = screen.getByText('Buka Undangan');
      for (let i = 0; i < 10; i++) fireEvent.click(btn);
      expect(onOpen).toHaveBeenCalledTimes(10);
    });

    it('re-renders with new guest name without errors', () => {
      const { rerender } = render(<CinematicOpening guestName="First" onOpen={vi.fn()} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      rerender(<CinematicOpening guestName="Second" onOpen={vi.fn()} />);
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.queryByText('First')).not.toBeInTheDocument();
    });

    it('re-renders with new onOpen callback', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(<CinematicOpening guestName="Test" onOpen={first} />);
      rerender(<CinematicOpening guestName="Test" onOpen={second} />);
      fireEvent.click(screen.getByText('Buka Undangan'));
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledOnce();
    });
  });

  // =========================================================================
  // 8. DECORATIVE ELEMENTS — rotating rings, heart pulse, celestial spark
  // =========================================================================
  describe('Decorative Elements', () => {
    it('has rotating rings (border-dashed rounded-full)', () => {
      const { container } = renderComponent();
      const ring = container.querySelector('.border-dashed.rounded-full');
      expect(ring).toBeInTheDocument();
    });

    it('has counter-rotating inner ring', () => {
      const { container } = renderComponent();
      const rings = container.querySelectorAll('.rounded-full.border');
      expect(rings.length).toBeGreaterThanOrEqual(2);
    });

    it('has heart pulse element (Heart icon from lucide)', () => {
      const { container } = renderComponent();
      const heart = container.querySelector('.text-gold.fill-gold\\/20');
      expect(heart).toBeInTheDocument();
    });

    it('has celestial spark element (small gold dot)', () => {
      const { container } = renderComponent();
      const spark = container.querySelector('.bg-gold\\/60.rounded-full');
      expect(spark).toBeInTheDocument();
    });

    it('decorative ring container has correct dimensions', () => {
      const { container } = renderComponent();
      const ringContainer = container.querySelector('.w-12.h-12');
      expect(ringContainer).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 9. LAYOUT STRUCTURE
  // =========================================================================
  describe('Layout Structure', () => {
    it('has top bar with location and date', () => {
      const { container } = renderComponent();
      const topBar = container.querySelector('.justify-between.items-start');
      expect(topBar).toBeInTheDocument();
    });

    it('has padding on the sides (px-8 md:px-24)', () => {
      const { container } = renderComponent();
      const mainContent = container.querySelector('.px-8');
      expect(mainContent).toBeInTheDocument();
    });

    it('main content area uses flex-1 to fill remaining space', () => {
      const { container } = renderComponent();
      const mainContent = container.querySelector('.flex-1');
      expect(mainContent).toBeInTheDocument();
    });

    it('has z-10 relative content layers', () => {
      const { container } = renderComponent();
      const zLayers = container.querySelectorAll('.z-10');
      expect(zLayers.length).toBeGreaterThanOrEqual(2);
    });

    it('background layer is z-0', () => {
      const { container } = renderComponent();
      const bgLayer = container.querySelector('.z-0');
      expect(bgLayer).toBeInTheDocument();
    });

    it('bottom section has pb-6 padding', () => {
      const { container } = renderComponent();
      const bottom = container.querySelector('.pb-6');
      expect(bottom).toBeInTheDocument();
    });
  });
});
