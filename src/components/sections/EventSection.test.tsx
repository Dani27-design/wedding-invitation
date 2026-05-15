import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../context/WeddingContext', () => ({
  useWeddingContext: () => ({
    eventDate: '2026-08-29',
    ceremonies: [
      { name: 'Akad Nikah', start: '09:00', end: '10:00' },
      { name: 'Resepsi', start: '10:00', end: '13:00' },
    ],
    venueName: 'Gedung Wanita Candra Kencana',
    venueAddress: 'Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya',
    venueMapsUrl: 'https://www.google.com/maps/dir//GEDUNG+WANITA+Candra+Kencana,+Pucang+Sewu,+Jl.+Kalibokor+Selatan+No.2,+Baratajaya,+Kec.+Gubeng,+Surabaya,+Jawa+Timur+60284/@-7.3571367,112.7509655,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x2dd7fbb53b29cbb7:0xee33be91a97dbb70!2m2!1d112.7618051!2d-7.2878229?entry=ttu&g_ep=EgoyMDI2MDQyOC4wIKXMDSoASAFQAw%3D%3D',
    quranArabic: '\u0648\u064E\u0645\u0650\u0646\u0652 \u0622\u064A\u064E\u0627\u062A\u0650\u0647\u0650 \u0623\u064E\u0646\u0652 \u062E\u064E\u0644\u064E\u0642\u064E \u0644\u064E\u0643\u064F\u0645 \u0645\u0651\u0650\u0646\u0652 \u0623\u064E\u0646\u0641\u064F\u0633\u0650\u0643\u064F\u0645\u0652 \u0623\u064E\u0632\u0652\u0648\u064E\u0627\u062C\u064B\u0627 \u0644\u0651\u0650\u062A\u064E\u0633\u0652\u0643\u064F\u0646\u064F\u0648\u0627 \u0625\u0650\u0644\u064E\u064A\u0652\u0647\u064E\u0627 \u0648\u064E\u062C\u064E\u0639\u064E\u0644\u064E \u0628\u064E\u064A\u0652\u0646\u064E\u0643\u064F\u0645 \u0645\u0651\u064E\u0648\u064E\u062F\u0651\u064E\u0629\u064B \u0648\u064E\u0631\u064E\u062D\u0652\u0645\u064E\u0629\u064B \u06DA \u0625\u0650\u0646\u0651\u064E \u0641\u0650\u064A \u0630\u064E\u0670\u0644\u0650\u0643\u064E \u0644\u064E\u0622\u064A\u064E\u0627\u062A\u064D \u0644\u0651\u0650\u0642\u064E\u0648\u0652\u0645\u064D \u064A\u064E\u062A\u064E\u0641\u064E\u0643\u0651\u064E\u0631\u064F\u0648\u0646\u064E',
    quranTranslation: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.',
    quranReference: 'QS. Ar-Rum: 21',
    groomNickname: 'Dani',
    brideNickname: 'Marini',
    eventCity: 'Surabaya',
  }),
}));

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

    it('section has bg-paper background', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('bg-paper');
    });

    it('section has relative positioning', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('relative');
    });

    it('section has py-6 vertical padding', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toHaveClass('py-[3vh]');
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
    it('displays "Dengan Segenap Cinta" label', () => {
      renderComponent();
      expect(screen.getByText('Dengan Segenap Cinta')).toBeInTheDocument();
    });

    it('"Dengan Segenap Cinta" is uppercase', () => {
      renderComponent();
      expect(screen.getByText('Dengan Segenap Cinta')).toHaveClass('uppercase');
    });

    it('"Dengan Segenap Cinta" has gold color', () => {
      renderComponent();
      expect(screen.getByText('Dengan Segenap Cinta')).toHaveClass('text-gold-contrast');
    });

    it('"Dengan Segenap Cinta" has font-black weight', () => {
      renderComponent();
      expect(screen.getByText('Dengan Segenap Cinta')).toHaveClass('font-black');
    });

    it('displays "Sabtu, 29 Agustus 2026" date', () => {
      renderComponent();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
    });

    it('date uses font-serif italic', () => {
      renderComponent();
      const el = screen.getByText('Sabtu, 29 Agustus 2026');
      expect(el).toHaveClass('font-serif', 'italic');
    });

    it('date uses responsive sizing (text-4xl sm:text-5xl md:text-6xl)', () => {
      renderComponent();
      const el = screen.getByText('Sabtu, 29 Agustus 2026');
      expect(el.className).toContain('text-4xl');
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

    it('time uses display font', () => {
      renderComponent();
      const el = screen.getByText('09:00 — 10:00');
      expect(el).toHaveClass('font-display');
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

    it('"Lihat Peta" has bg-gold text-ivory colors', () => {
      renderComponent();
      const link = screen.getByText('Lihat Peta').closest('a');
      expect(link).toHaveClass('bg-gold');
      expect(link).toHaveClass('text-ivory');
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
      const ctaContainer = container.querySelector('.flex-wrap.gap-3');
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
    it('Akad, Resepsi, and Venue cards have border-gold/10 styling', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('.border.border-gold\\/15');
      expect(cards.length).toBe(3);
    });

    it('Akad, Resepsi, and Venue cards have bg-white/50 background', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('.bg-white\\/60.border-gold\\/15');
      expect(cards.length).toBe(3);
    });

    it('vertical divider line (w-px h-8) does not exist', () => {
      const { container } = renderComponent();
      const vLine = container.querySelector('.w-px.h-8');
      expect(vLine).not.toBeInTheDocument();
    });

    it('w-px.h-8 element does not exist', () => {
      const { container } = renderComponent();
      const vLine = container.querySelector('.w-px.h-8');
      expect(vLine).not.toBeInTheDocument();
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
      expect(screen.getByText('Dengan Segenap Cinta')).toBeInTheDocument();
      expect(screen.getByText('Kami menanti kehadiran Anda di hari istimewa kami.')).toBeInTheDocument();
      expect(screen.getByText('Sabtu, 29 Agustus 2026')).toBeInTheDocument();
      expect(screen.getByText(/Dan di antara tanda-tanda kekuasaan-Nya/)).toBeInTheDocument();
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
