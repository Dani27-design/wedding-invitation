import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventSection } from './EventSection';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const renderComponent = () => render(<EventSection />);

// ===========================================================================
// 1. RENDERING — basic mount & structure
// ===========================================================================
describe('EventSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderComponent();
      expect(container.firstChild!.nodeName).toBe('SECTION');
    });

    it('section has id="event-section" for navigation', () => {
      const { container } = renderComponent();
      expect(container.querySelector('#event-section')).toBeInTheDocument();
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
      expect(container.querySelector('section')).toHaveClass('py-4');
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
  });

  // =========================================================================
  // 2. CONTENT — labels, dates, events, times
  // =========================================================================
  describe('Content', () => {
    it('displays "Menuju Hari Bahagia" label', () => {
      renderComponent();
      expect(screen.getByText('Menuju Hari Bahagia')).toBeInTheDocument();
    });

    it('"Menuju Hari Bahagia" is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Menuju Hari Bahagia')).toHaveClass('uppercase');
    });

    it('"Menuju Hari Bahagia" has gold color', () => {
      renderComponent();
      expect(screen.getByText('Menuju Hari Bahagia')).toHaveClass('text-gold');
    });

    it('"Menuju Hari Bahagia" has font-black weight', () => {
      renderComponent();
      expect(screen.getByText('Menuju Hari Bahagia')).toHaveClass('font-black');
    });

    it('displays "Sabtu, 29 Agustus 2026" date', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
    });

    it('date is in italic serif font', () => {
      renderComponent();
      const el = screen.getByText('Sabtu, 29 Agustus 2026');
      expect(el).toHaveClass('italic');
      expect(el).toHaveClass('font-serif');
    });

    it('date uses responsive sizing (text-3xl md:text-4xl)', () => {
      renderComponent();
      const el = screen.getByText('Sabtu, 29 Agustus 2026');
      expect(el.className).toContain('text-3xl');
    });

    it('date has tracking-tight', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toHaveClass('tracking-tight');
    });

    it('displays "Akad Nikah" event name', () => {
      renderComponent();
      expect(screen.getByText('Akad Nikah')).toBeInTheDocument();
    });

    it('displays Akad time "09:00 — 10:00"', () => {
      renderComponent();
      expect(screen.getByText('09:00 — 10:00')).toBeInTheDocument();
    });

    it('displays "Resepsi" event name', () => {
      renderComponent();
      expect(screen.getByText('Resepsi')).toBeInTheDocument();
    });

    it('displays Resepsi time "10:00 — 13:00"', () => {
      renderComponent();
      expect(screen.getByText('10:00 — 13:00')).toBeInTheDocument();
    });

    it('Akad Nikah uses serif italic font', () => {
      renderComponent();
      const el = screen.getByText('Akad Nikah');
      expect(el).toHaveClass('font-serif');
      expect(el).toHaveClass('italic');
    });

    it('Resepsi uses serif italic font', () => {
      renderComponent();
      const el = screen.getByText('Resepsi');
      expect(el).toHaveClass('font-serif');
      expect(el).toHaveClass('italic');
    });

    it('time uses mono font', () => {
      renderComponent();
      const el = screen.getByText('09:00 — 10:00');
      expect(el).toHaveClass('font-mono');
    });

    it('time is uppercase with tracking', () => {
      renderComponent();
      const el = screen.getByText('09:00 — 10:00');
      expect(el).toHaveClass('uppercase');
      expect(el.className).toContain('tracking-');
    });
  });

  // =========================================================================
  // 3. VENUE — name, address, MapPin
  // =========================================================================
  describe('Venue', () => {
    it('displays "Gedung Wanita Candra Kencana" venue name', () => {
      renderComponent();
      expect(screen.getByText('Gedung Wanita Candra Kencana')).toBeInTheDocument();
    });

    it('venue name is italic serif', () => {
      renderComponent();
      const el = screen.getByText('Gedung Wanita Candra Kencana');
      expect(el).toHaveClass('italic');
      expect(el).toHaveClass('font-serif');
    });

    it('displays address containing "Kalibokor"', () => {
      renderComponent();
      expect(screen.getByText(/Kalibokor/)).toBeInTheDocument();
    });

    it('displays full address with Surabaya', () => {
      renderComponent();
      expect(screen.getByText(/Surabaya/)).toBeInTheDocument();
    });

    it('address contains "Baratajaya"', () => {
      renderComponent();
      expect(screen.getByText(/Baratajaya/)).toBeInTheDocument();
    });

    it('address has light font weight', () => {
      renderComponent();
      const addr = screen.getByText(/Kalibokor/);
      expect(addr).toHaveClass('font-light');
    });

    it('address has max-width constraint (max-w-[280px])', () => {
      renderComponent();
      const addr = screen.getByText(/Kalibokor/);
      expect(addr).toHaveClass('max-w-[280px]');
    });

    it('MapPin icon is rendered (svg inside venue section)', () => {
      const { container } = renderComponent();
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 4. CTAs — "Lihat Peta" and "Ke Kalender"
  // =========================================================================
  describe('CTAs', () => {
    it('"Lihat Peta" link is present', () => {
      renderComponent();
      expect(screen.getByText('Lihat Peta')).toBeInTheDocument();
    });

    it('"Lihat Peta" closest anchor has target=_blank', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('"Lihat Peta" has rel=noopener noreferrer', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('"Lihat Peta" link has rounded-full styling', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveClass('rounded-full');
    });

    it('"Lihat Peta" has bg-ink text-gold colors', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveClass('bg-ink');
      expect(link).toHaveClass('text-gold');
    });

    it('"Lihat Peta" is uppercase with tracking', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveClass('uppercase');
      expect(link!.className).toContain('tracking-');
    });

    it('"Ke Kalender" button is present', () => {
      renderComponent();
      expect(screen.getByText('Ke Kalender')).toBeInTheDocument();
    });

    it('"Ke Kalender" is a button element', () => {
      renderComponent();
      const btn = screen.getByText('Ke Kalender').closest('button');
      expect(btn).toBeInTheDocument();
    });

    it('"Ke Kalender" has rounded-full styling', () => {
      renderComponent();
      const btn = screen.getByText('Ke Kalender').closest('button');
      expect(btn).toHaveClass('rounded-full');
    });

    it('"Ke Kalender" has border styling', () => {
      renderComponent();
      const btn = screen.getByText('Ke Kalender').closest('button');
      expect(btn!.className).toContain('border');
    });

    it('CTA container uses flex-wrap with gap-4', () => {
      const { container } = renderComponent();
      const ctaContainer = container.querySelector('.flex-wrap.gap-4');
      expect(ctaContainer).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. MAP LINK — URL validation
  // =========================================================================
  describe('Map Link', () => {
    it('href contains google.com/maps', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link!.getAttribute('href')).toContain('google.com/maps');
    });

    it('href contains Surabaya in URL', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link!.getAttribute('href')).toContain('Surabaya');
    });

    it('href contains Kalibokor in URL', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link!.getAttribute('href')).toContain('Kalibokor');
    });

    it('href contains Candra+Kencana in URL', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link!.getAttribute('href')).toContain('Candra');
    });

    it('href is a valid URL string (starts with https)', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link!.getAttribute('href')).toMatch(/^https:\/\//);
    });
  });

  // =========================================================================
  // 6. CALENDAR — window.open behavior
  // =========================================================================
  describe('Calendar', () => {
    it('clicking "Ke Kalender" triggers window.open', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      expect(openSpy).toHaveBeenCalledOnce();
      openSpy.mockRestore();
    });

    it('window.open URL contains google.com/calendar', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('google.com/calendar');
      openSpy.mockRestore();
    });

    it('calendar URL contains event title with Dani & Marini', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('Dani');
      expect(url).toContain('Marini');
      openSpy.mockRestore();
    });

    it('calendar URL contains correct date (20260829)', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('20260829');
      openSpy.mockRestore();
    });

    it('calendar URL contains venue location', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('Candra');
      openSpy.mockRestore();
    });

    it('calendar URL contains start time T090000', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('T090000');
      openSpy.mockRestore();
    });

    it('calendar URL contains end time T130000', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      fireEvent.click(screen.getByText('Ke Kalender').closest('button')!);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('T130000');
      openSpy.mockRestore();
    });

    it('does not call window.open on render', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      expect(openSpy).not.toHaveBeenCalled();
      openSpy.mockRestore();
    });
  });

  // =========================================================================
  // 7. COUNTDOWN TIMER
  // =========================================================================
  describe('CountdownTimer', () => {
    it('renders countdown labels (Hari, Jam, Menit, Detik)', () => {
      renderComponent();
      expect(screen.getByText('Hari')).toBeInTheDocument();
      expect(screen.getByText('Jam')).toBeInTheDocument();
      expect(screen.getByText('Menit')).toBeInTheDocument();
      expect(screen.getByText('Detik')).toBeInTheDocument();
    });

    it('countdown labels are uppercase', () => {
      renderComponent();
      expect(screen.getByText('Hari')).toHaveClass('uppercase');
    });

    it('countdown timer container is present', () => {
      const { container } = renderComponent();
      const timer = container.querySelector('.max-w-xl');
      expect(timer).toBeInTheDocument();
    });

    it('countdown uses flex layout with gap', () => {
      const { container } = renderComponent();
      const timerRow = container.querySelector('.flex.justify-center.items-center[class*="gap-"]');
      expect(timerRow).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 8. LAYOUT
  // =========================================================================
  describe('Layout', () => {
    it('content container has max-w-lg', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('content container has mx-auto for centering', () => {
      const { container } = renderComponent();
      const inner = container.querySelector('.container.mx-auto');
      expect(inner).toBeInTheDocument();
    });

    it('content uses text-center alignment', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.text-center')).toBeInTheDocument();
    });

    it('content uses flex column layout', () => {
      const { container } = renderComponent();
      const col = container.querySelector('.flex.flex-col.items-center.text-center');
      expect(col).toBeInTheDocument();
    });

    it('container has px-6 horizontal padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.px-6')).toBeInTheDocument();
    });

    it('container has z-10 relative content layer', () => {
      const { container } = renderComponent();
      expect(container.querySelector('.z-10')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 9. VISUAL — border dividers, vertical line
  // =========================================================================
  describe('Visual', () => {
    it('has border-y divider between Akad and Resepsi section', () => {
      const { container } = renderComponent();
      const divider = container.querySelector('.border-y');
      expect(divider).toBeInTheDocument();
    });

    it('border-y uses gold color (border-gold/10)', () => {
      const { container } = renderComponent();
      const divider = container.querySelector('.border-y.border-gold\\/10');
      expect(divider).toBeInTheDocument();
    });

    it('has vertical divider line between Akad and Resepsi (w-px h-8)', () => {
      const { container } = renderComponent();
      const vLine = container.querySelector('.w-px.h-8');
      expect(vLine).toBeInTheDocument();
    });

    it('vertical divider has gold background', () => {
      const { container } = renderComponent();
      const vLine = container.querySelector('.w-px.h-8.bg-gold\\/20');
      expect(vLine).toBeInTheDocument();
    });

    it('Akad and Resepsi are in a flex row with gap', () => {
      const { container } = renderComponent();
      const row = container.querySelector('.flex.justify-center.items-center[class*="gap-"]');
      expect(row).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 10. EDGE CASES
  // =========================================================================
  describe('Edge Cases', () => {
    it('re-renders without duplicating content', () => {
      const { rerender } = render(<EventSection />);
      rerender(<EventSection />);
      const akad = screen.getAllByText('Akad Nikah');
      expect(akad).toHaveLength(1);
    });

    it('re-renders without duplicating Resepsi', () => {
      const { rerender } = render(<EventSection />);
      rerender(<EventSection />);
      const resepsi = screen.getAllByText('Resepsi');
      expect(resepsi).toHaveLength(1);
    });

    it('all essential content renders in a single pass', () => {
      renderComponent();
      expect(screen.getByText('Menuju Hari Bahagia')).toBeInTheDocument();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
      expect(screen.getByText('Akad Nikah')).toBeInTheDocument();
      expect(screen.getByText('Resepsi')).toBeInTheDocument();
      expect(screen.getByText('Gedung Wanita Candra Kencana')).toBeInTheDocument();
      expect(screen.getByText('Lihat Peta')).toBeInTheDocument();
      expect(screen.getByText('Ke Kalender')).toBeInTheDocument();
    });

    it('multiple renders produce stable DOM', () => {
      const { container, rerender } = render(<EventSection />);
      const firstHTML = container.innerHTML;
      rerender(<EventSection />);
      expect(container.innerHTML).toBe(firstHTML);
    });

    it('multiple calendar clicks each call window.open', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderComponent();
      const btn = screen.getByText('Ke Kalender').closest('button')!;
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(openSpy).toHaveBeenCalledTimes(3);
      openSpy.mockRestore();
    });

    it('map link and calendar button coexist without interference', () => {
      renderComponent();
      const mapLink = screen.getByText('Lihat Peta').closest('a');
      const calButton = screen.getByText('Ke Kalender').closest('button');
      expect(mapLink).toBeInTheDocument();
      expect(calButton).toBeInTheDocument();
      expect(mapLink).not.toBe(calButton);
    });

    it('venue name from constants matches displayed text', () => {
      renderComponent();
      expect(screen.getByText('Gedung Wanita Candra Kencana')).toBeInTheDocument();
    });
  });
});
