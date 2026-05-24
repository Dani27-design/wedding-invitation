import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestimonialSection } from './TestimonialSection';

// Mock firebase/firestore
const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  doc: vi.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

const makeTestimonialDoc = (id: string, overrides = {}) => ({
  id,
  data: () => ({
    weddingSlug: `wedding-${id}`,
    rating: 5,
    message: `Testimonial message ${id}`,
    createdAt: { toDate: () => new Date() },
    ...overrides,
  }),
});

const makeWeddingDoc = (overrides = {}) => ({
  exists: () => true,
  data: () => ({
    groomNickname: 'Dani',
    brideNickname: 'Marini',
    groomPhoto: 'https://example.com/groom.jpg',
    bridePhoto: 'https://example.com/bride.jpg',
    ...overrides,
  }),
});

describe('TestimonialSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Loading & empty states
  // ---------------------------------------------------------------------------
  describe('loading and empty states', () => {
    it('renders nothing while loading', () => {
      mockGetDocs.mockReturnValue(new Promise(() => {})); // never resolves
      const { container } = render(<TestimonialSection />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when no testimonials exist', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('renders nothing when wedding doc does not exist', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1')] });
      mockGetDoc.mockResolvedValue({ exists: () => false });
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('renders nothing on fetch error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Network error'));
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Section heading
  // ---------------------------------------------------------------------------
  describe('section heading', () => {
    beforeEach(() => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1')] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
    });

    it('renders the section heading "Testimoni"', async () => {
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Testimoni')).toBeInTheDocument();
      });
    });

    it('renders the subheading', async () => {
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Cerita dari pasangan kami')).toBeInTheDocument();
      });
    });

    it('renders a section element', async () => {
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.querySelector('section')).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Card content — couple info inline
  // ---------------------------------------------------------------------------
  describe('card couple info', () => {
    beforeEach(() => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1')] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
    });

    it('displays the couple name', async () => {
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
    });

    it('renders groom photo as img element', async () => {
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        const imgs = container.querySelectorAll('img');
        const groomImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/groom.jpg');
        expect(groomImg).toBeTruthy();
      });
    });

    it('renders bride photo as img element', async () => {
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        const imgs = container.querySelectorAll('img');
        const brideImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/bride.jpg');
        expect(brideImg).toBeTruthy();
      });
    });

    it('renders placeholder when groom photo is empty', async () => {
      mockGetDoc.mockResolvedValue(makeWeddingDoc({ groomPhoto: '' }));
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const images = container.querySelectorAll('img');
      const groomImg = Array.from(images).find(img => img.getAttribute('src') === 'https://example.com/groom.jpg');
      expect(groomImg).toBeUndefined();
    });

    it('renders placeholder when bride photo is empty', async () => {
      mockGetDoc.mockResolvedValue(makeWeddingDoc({ bridePhoto: '' }));
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const images = container.querySelectorAll('img');
      const brideImg = Array.from(images).find(img => img.getAttribute('src') === 'https://example.com/bride.jpg');
      expect(brideImg).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Rating stars
  // ---------------------------------------------------------------------------
  describe('rating stars', () => {
    it('renders 5 star elements per testimonial', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1', { rating: 4 })] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const svgs = container.querySelectorAll('svg');
      // Stars are SVG elements rendered by lucide-react
      expect(svgs.length).toBeGreaterThanOrEqual(5);
    });

    it('renders correct number of filled stars for rating 3', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1', { rating: 3 })] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const filledStars = container.querySelectorAll('.fill-yellow-400');
      expect(filledStars.length).toBe(3);
    });

    it('renders 5 filled stars for rating 5', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1', { rating: 5 })] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const filledStars = container.querySelectorAll('.fill-yellow-400');
      expect(filledStars.length).toBe(5);
    });

    it('renders 0 filled stars for rating 0', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1', { rating: 0 })] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const filledStars = container.querySelectorAll('.fill-yellow-400');
      expect(filledStars.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Divider
  // ---------------------------------------------------------------------------
  describe('divider', () => {
    it('renders a divider between couple info and quote', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1')] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const divider = container.querySelector('.border-t');
      expect(divider).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Quote / message
  // ---------------------------------------------------------------------------
  describe('testimonial message', () => {
    it('displays the testimonial message text', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1', { message: 'Undangannya sangat indah!' })] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Undangannya sangat indah!')).toBeInTheDocument();
      });
    });

    it('renders decorative quote marks', async () => {
      mockGetDocs.mockResolvedValue({ docs: [makeTestimonialDoc('1')] });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      render(<TestimonialSection />);
      await waitFor(() => {
        const quotes = screen.getAllByText('\u201C');
        expect(quotes.length).toBe(2);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Multiple testimonials
  // ---------------------------------------------------------------------------
  describe('multiple testimonials', () => {
    it('renders multiple cards', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          makeTestimonialDoc('1', { message: 'First review' }),
          makeTestimonialDoc('2', { message: 'Second review' }),
        ],
      });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('First review')).toBeInTheDocument();
        expect(screen.getByText('Second review')).toBeInTheDocument();
      });
    });

    it('renders different couple names from different weddings', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          makeTestimonialDoc('1'),
          makeTestimonialDoc('2'),
        ],
      });
      let callCount = 0;
      mockGetDoc.mockImplementation(() => {
        callCount++;
        return callCount === 1
          ? makeWeddingDoc({ groomNickname: 'Andi', brideNickname: 'Sari' })
          : makeWeddingDoc({ groomNickname: 'Budi', brideNickname: 'Rina' });
      });
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Andi & Sari')).toBeInTheDocument();
        expect(screen.getByText('Budi & Rina')).toBeInTheDocument();
      });
    });

    it('uses grid layout when 3 or more testimonials exist', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          makeTestimonialDoc('1', { message: 'Review A' }),
          makeTestimonialDoc('2', { message: 'Review B' }),
          makeTestimonialDoc('3', { message: 'Review C' }),
        ],
      });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Review A')).toBeInTheDocument();
      });
      const grid = container.querySelector('.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('does not use grid layout when fewer than 3 testimonials', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [makeTestimonialDoc('1', { message: 'Only one' })],
      });
      mockGetDoc.mockResolvedValue(makeWeddingDoc());
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Only one')).toBeInTheDocument();
      });
      const grid = container.querySelector('.lg\\:grid-cols-3');
      expect(grid).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Cleanup on unmount
  // ---------------------------------------------------------------------------
  describe('cleanup', () => {
    it('does not update state after unmount', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let resolve: (value: unknown) => void;
      const promise = new Promise(r => { resolve = r; });
      mockGetDocs.mockReturnValue(promise);

      const { unmount } = render(<TestimonialSection />);
      unmount();

      resolve!({ docs: [makeTestimonialDoc('1')] });
      // Should not produce "setState on unmounted component" warning
      await new Promise(r => setTimeout(r, 50));
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
