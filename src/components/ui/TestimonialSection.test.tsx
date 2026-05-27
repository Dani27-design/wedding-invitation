import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestimonialSection } from './TestimonialSection';

// Mock firebase/firestore
const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  where: vi.fn(),
  documentId: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
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

const makeWeddingBatchDoc = (slug: string, overrides = {}) => ({
  id: slug,
  data: () => ({
    groomNickname: 'Dani',
    brideNickname: 'Marini',
    groomPhoto: 'https://example.com/groom.jpg',
    bridePhoto: 'https://example.com/bride.jpg',
    ...overrides,
  }),
});

/** Helper: setup mockGetDocs to return testimonials on 1st call, wedding batch on 2nd call */
function setupMocks(testimonialDocs: ReturnType<typeof makeTestimonialDoc>[], weddingDocs?: ReturnType<typeof makeWeddingBatchDoc>[]) {
  let callCount = 0;
  mockGetDocs.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.resolve({ docs: testimonialDocs, empty: testimonialDocs.length === 0 });
    }
    // 2nd call: wedding batch query
    const defaultWeddings = weddingDocs ?? testimonialDocs.map(t => makeWeddingBatchDoc(t.data().weddingSlug));
    return Promise.resolve({ docs: defaultWeddings });
  });
}

describe('TestimonialSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Loading & empty states
  // ---------------------------------------------------------------------------
  describe('loading and empty states', () => {
    it('renders skeleton while loading', () => {
      mockGetDocs.mockReturnValue(new Promise(() => {})); // never resolves
      const { container } = render(<TestimonialSection />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-busy', 'true');
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('renders nothing when no testimonials exist', async () => {
      mockGetDocs.mockResolvedValue({ docs: [], empty: true });
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('renders nothing when wedding docs not found', async () => {
      setupMocks([makeTestimonialDoc('1')], []);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('renders nothing on fetch error and logs error', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetDocs.mockRejectedValue(new Error('Network error'));
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
      expect(spy).toHaveBeenCalledWith('[Testimonials] Load error:', 'Network error');
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Section heading
  // ---------------------------------------------------------------------------
  describe('section heading', () => {
    beforeEach(() => {
      setupMocks([makeTestimonialDoc('1')]);
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
      setupMocks([makeTestimonialDoc('1')]);
    });

    it('displays the couple name', async () => {
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
    });

    it('renders groom photo with descriptive alt text', async () => {
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        const imgs = container.querySelectorAll('img');
        const groomImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/groom.jpg');
        expect(groomImg).toBeTruthy();
        expect(groomImg!.getAttribute('alt')).toBe('Dani & Marini');
      });
    });

    it('renders bride photo with descriptive alt text', async () => {
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        const imgs = container.querySelectorAll('img');
        const brideImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/bride.jpg');
        expect(brideImg).toBeTruthy();
        expect(brideImg!.getAttribute('alt')).toBe('Dani & Marini');
      });
    });

    it('renders placeholder when groom photo is empty', async () => {
      setupMocks(
        [makeTestimonialDoc('1')],
        [makeWeddingBatchDoc('wedding-1', { groomPhoto: '' })],
      );
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const images = container.querySelectorAll('img');
      const groomImg = Array.from(images).find(img => img.getAttribute('src') === 'https://example.com/groom.jpg');
      expect(groomImg).toBeUndefined();
    });

    it('renders placeholder when bride photo is empty', async () => {
      setupMocks(
        [makeTestimonialDoc('1')],
        [makeWeddingBatchDoc('wedding-1', { bridePhoto: '' })],
      );
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
      setupMocks([makeTestimonialDoc('1', { rating: 4 })]);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(5);
    });

    it('renders correct number of filled stars for rating 3', async () => {
      setupMocks([makeTestimonialDoc('1', { rating: 3 })]);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const filledStars = container.querySelectorAll('.fill-yellow-400');
      expect(filledStars.length).toBe(3);
    });

    it('renders 5 filled stars for rating 5', async () => {
      setupMocks([makeTestimonialDoc('1', { rating: 5 })]);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Dani & Marini')).toBeInTheDocument();
      });
      const filledStars = container.querySelectorAll('.fill-yellow-400');
      expect(filledStars.length).toBe(5);
    });

    it('renders 0 filled stars for rating 0', async () => {
      setupMocks([makeTestimonialDoc('1', { rating: 0 })]);
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
      setupMocks([makeTestimonialDoc('1')]);
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
      setupMocks([makeTestimonialDoc('1', { message: 'Undangannya sangat indah!' })]);
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Undangannya sangat indah!')).toBeInTheDocument();
      });
    });

    it('renders decorative quote marks', async () => {
      setupMocks([makeTestimonialDoc('1')]);
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
      setupMocks([
        makeTestimonialDoc('1', { message: 'First review' }),
        makeTestimonialDoc('2', { message: 'Second review' }),
      ]);
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('First review')).toBeInTheDocument();
        expect(screen.getByText('Second review')).toBeInTheDocument();
      });
    });

    it('renders different couple names from different weddings', async () => {
      setupMocks(
        [makeTestimonialDoc('1'), makeTestimonialDoc('2')],
        [
          makeWeddingBatchDoc('wedding-1', { groomNickname: 'Andi', brideNickname: 'Sari' }),
          makeWeddingBatchDoc('wedding-2', { groomNickname: 'Budi', brideNickname: 'Rina' }),
        ],
      );
      render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Andi & Sari')).toBeInTheDocument();
        expect(screen.getByText('Budi & Rina')).toBeInTheDocument();
      });
    });

    it('uses grid layout when 3 or more testimonials exist', async () => {
      setupMocks([
        makeTestimonialDoc('1', { message: 'Review A' }),
        makeTestimonialDoc('2', { message: 'Review B' }),
        makeTestimonialDoc('3', { message: 'Review C' }),
      ]);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Review A')).toBeInTheDocument();
      });
      const grid = container.querySelector('.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('does not use grid layout when fewer than 3 testimonials', async () => {
      setupMocks([makeTestimonialDoc('1', { message: 'Only one' })]);
      const { container } = render(<TestimonialSection />);
      await waitFor(() => {
        expect(screen.getByText('Only one')).toBeInTheDocument();
      });
      const grid = container.querySelector('.lg\\:grid-cols-3');
      expect(grid).toBeNull();
    });

    it('deduplicates wedding queries for same slug', async () => {
      setupMocks(
        [
          makeTestimonialDoc('1', { weddingSlug: 'same-wedding' }),
          makeTestimonialDoc('2', { weddingSlug: 'same-wedding' }),
        ],
        [makeWeddingBatchDoc('same-wedding')],
      );
      render(<TestimonialSection />);
      await waitFor(() => {
        const names = screen.getAllByText('Dani & Marini');
        expect(names.length).toBe(2);
      });
      // getDocs called exactly 2 times: 1 for testimonials, 1 for weddings batch
      expect(mockGetDocs).toHaveBeenCalledTimes(2);
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

      resolve!({ docs: [makeTestimonialDoc('1')], empty: false });
      await new Promise(r => setTimeout(r, 50));
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
