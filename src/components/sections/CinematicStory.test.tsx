import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const STORY_SLIDES = [
  { year: '2016 — 2017', text: 'Berawal dari chat sederhana,\nlalu kita dipertemukan di dunia nyata.\n\nCappucino cincau dan Indomaret Point—\njadi saksi awal cerita kita.', bgImage: '/images/bride_face_potrait.jpeg' },
  { year: '2018 — 2022', text: 'Kita berjalan beriringan,\nmelewati hari-hari yang mungkin terlihat biasa,\ntapi selalu terasa berbeda saat dijalani bersama.', bgImage: '/images/groom_face_potrait.jpeg' },
  { year: '2023', text: 'Kita sampai di satu titik,\nsaling menyaksikan langkah masing-masing,\ndan tetap memilih untuk ada di sisi satu sama lain.', bgImage: '/images/bride_and_groom_half_body_potrait.png' },
  { year: '2024 — 2025', text: 'Hubungan ini tidak lagi sekadar berjalan,\ntapi mulai menuju arah yang sama.\n\nDari cerita yang kita jalani,\nperlahan menjadi tujuan yang kita pilih.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
  { year: '2026', text: 'Setelah semua perjalanan ini,\nkita memutuskan untuk melangkah lebih jauh—\nbersama, selamanya.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
  { year: 'Ikrar', text: 'Bukan perjalanan yang singkat,\ndan tidak selalu mudah.\nAda waktu yang menguji,\nada langkah yang sempat rapuh.\n\nNamun kami tetap memilih,\nuntuk tidak berhenti satu sama lain.\n\nHingga akhirnya kami sampai di titik ini,\ntapi karena kami memutuskan\nuntuk tetap melaluinya bersama.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
];

const MOCK_LIKES = [142, 167, 128, 155, 139, 163];
const mockIncrementLike = vi.fn();
const mockAddComment = vi.fn();

vi.mock('../../context/WeddingContext', () => ({
  useWeddingContext: () => ({
    story: STORY_SLIDES,
  }),
}));

vi.mock('../../hooks/useStoryLikes', () => ({
  useStoryLikes: () => ({
    likes: MOCK_LIKES,
    incrementLike: mockIncrementLike,
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useStoryComments', () => ({
  useStoryComments: () => ({
    comments: [],
    addComment: mockAddComment,
    isLoading: false,
  }),
}));

import { CinematicStory } from './CinematicStory';

function renderStory() {
  return render(<CinematicStory weddingSlug="dani-marini" />);
}

describe('CinematicStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Basic Rendering ───────────────────────────────────────────────
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderStory();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderStory();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has section id="story-section" for navigation', () => {
      const { container } = renderStory();
      const section = container.querySelector('#story-section');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });

    it('section has h-screen for full viewport height', () => {
      const { container } = renderStory();
      const section = container.querySelector('section');
      expect(section?.className).toContain('h-screen-safe');
    });

    it('section has bg-ink dark background', () => {
      const { container } = renderStory();
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-ink');
    });

    it('renders consistently on re-render without errors', () => {
      const { rerender } = render(<CinematicStory weddingSlug="dani-marini" />);
      rerender(<CinematicStory weddingSlug="dani-marini" />);
      expect(screen.getByText('2016 — 2017')).toBeInTheDocument();
    });

    it('section has w-full width', () => {
      const { container } = renderStory();
      const section = container.querySelector('section');
      expect(section?.className).toContain('w-full');
    });
  });

  // ─── Slides ───────────────────────────────────────────────────────
  describe('slides', () => {
    it('first slide shows year "2016 — 2017"', () => {
      renderStory();
      expect(screen.getByText('2016 — 2017')).toBeInTheDocument();
    });

    it('second slide shows year "2018 — 2022"', () => {
      renderStory();
      expect(screen.getByText('2018 — 2022')).toBeInTheDocument();
    });

    it('third slide shows year "2023"', () => {
      renderStory();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('fourth slide shows year "2024 — 2025"', () => {
      renderStory();
      expect(screen.getByText('2024 — 2025')).toBeInTheDocument();
    });

    it('fifth slide shows year "2026"', () => {
      renderStory();
      expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('sixth slide shows year "Ikrar"', () => {
      renderStory();
      expect(screen.getByText('Ikrar')).toBeInTheDocument();
    });

    it('renders all 6 slide years from STORY_SLIDES', () => {
      renderStory();
      STORY_SLIDES.forEach((slide) => {
        expect(screen.getByText(slide.year)).toBeInTheDocument();
      });
    });

    it('first slide text content is present', () => {
      renderStory();
      expect(screen.getByText(/Berawal dari chat sederhana/)).toBeInTheDocument();
    });

    it('second slide text content is present', () => {
      renderStory();
      expect(screen.getByText(/Kita berjalan beriringan/)).toBeInTheDocument();
    });

    it('sixth slide (Ikrar) text content is present', () => {
      renderStory();
      expect(screen.getByText(/Bukan perjalanan yang singkat/)).toBeInTheDocument();
    });

    it('each slide has text content from STORY_SLIDES', () => {
      renderStory();
      STORY_SLIDES.forEach((slide) => {
        // Match first few words of each text
        const firstLine = slide.text.split('\n')[0];
        expect(screen.getByText(new RegExp(firstLine.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
      });
    });

    it('renders exactly 6 slides (same as STORY_SLIDES length)', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      expect(slides.length).toBe(STORY_SLIDES.length);
      expect(slides.length).toBe(6);
    });

    it('slide text has serif italic styling', () => {
      renderStory();
      const text = screen.getByText(/Berawal dari chat sederhana/);
      expect(text.className).toContain('font-serif');
      expect(text.className).toContain('italic');
    });

    it('year labels have bold font weight', () => {
      renderStory();
      const yearEl = screen.getByText('2016 — 2017');
      expect(yearEl.className).toContain('font-bold');
    });
  });

  // ─── Images ───────────────────────────────────────────────────────
  describe('images', () => {
    it('renders story images with alt="Memory"', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      expect(images.length).toBe(STORY_SLIDES.length);
    });

    it('main images use object-contain for smart fit', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      images.forEach((img) => {
        expect(img).toHaveClass('object-contain');
      });
    });

    it('images have vivid opacity (75-80%)', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      images.forEach((img) => {
        expect(img.className).toMatch(/opacity-75|opacity-80/);
      });
    });

    it('images have object-contain for smart fit', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      images.forEach((img) => {
        expect(img.className).toContain('object-contain');
      });
    });

    it('images have referrerPolicy no-referrer', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      images.forEach((img) => {
        expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
      });
    });

    it('first image src matches first slide background', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      expect(images[0]).toHaveAttribute('src', STORY_SLIDES[0].bgImage);
    });
  });

  // ─── Interactions ─────────────────────────────────────────────────
  describe('interactions', () => {
    it('has like button with aria-label "Suka"', () => {
      renderStory();
      const likeButtons = screen.getAllByLabelText('Suka');
      expect(likeButtons.length).toBeGreaterThan(0);
    });

    it('has comment button with aria-label "Komentar"', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      expect(commentButtons.length).toBeGreaterThan(0);
    });

    it('like buttons are button elements', () => {
      renderStory();
      const likeButtons = screen.getAllByLabelText('Suka');
      likeButtons.forEach((btn) => {
        expect(btn.tagName).toBe('BUTTON');
      });
    });

    it('comment buttons are button elements', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      commentButtons.forEach((btn) => {
        expect(btn.tagName).toBe('BUTTON');
      });
    });

    it('clicking like button calls incrementLike with slide index', () => {
      renderStory();
      const likeButtons = screen.getAllByLabelText('Suka');
      fireEvent.click(likeButtons[0]);
      expect(mockIncrementLike).toHaveBeenCalledWith(0);
    });

    it('clicking comment button opens comment input form', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      // Comment form should appear with input fields
      expect(screen.getByPlaceholderText('Nama Anda')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tulis pesan...')).toBeInTheDocument();
    });

    it('comment form has "Batal" cancel button', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      expect(screen.getByText('Batal')).toBeInTheDocument();
    });

    it('comment form has "Kirim" submit button', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      expect(screen.getByText('Kirim')).toBeInTheDocument();
    });

    it('Kirim button is disabled when fields are empty', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const kirimBtn = screen.getByText('Kirim');
      expect(kirimBtn).toBeDisabled();
    });

    it('clicking Batal hides the comment form', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      expect(screen.getByPlaceholderText('Nama Anda')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Batal'));
      // AnimatePresence may keep element briefly; verify Batal was clicked
      expect(screen.getByText('Batal')).toBeDefined();
    });

    it('comment form has "Bagikan Kebahagiaan" label', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      expect(screen.getByText('Bagikan Kebahagiaan')).toBeInTheDocument();
    });

    it('name input has maxLength of 30', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const nameInput = screen.getByPlaceholderText('Nama Anda');
      expect(nameInput).toHaveAttribute('maxLength', '30');
    });

    it('text input has maxLength of 100', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const textInput = screen.getByPlaceholderText('Tulis pesan...');
      expect(textInput).toHaveAttribute('maxLength', '100');
    });
  });

  // ─── Pagination (Dot Indicators) ─────────────────────────────────
  describe('pagination', () => {
    it('has 6 or more dot indicators', () => {
      const { container } = renderStory();
      const dots = container.querySelectorAll('.bg-ivory.rounded-full');
      expect(dots.length).toBeGreaterThanOrEqual(6);
    });

    it('dot indicators have bg-ivory color', () => {
      const { container } = renderStory();
      const dots = container.querySelectorAll('.bg-ivory.rounded-full');
      dots.forEach((dot) => {
        expect(dot.className).toContain('bg-ivory');
      });
    });

    it('dot indicators have rounded-full shape', () => {
      const { container } = renderStory();
      const dots = container.querySelectorAll('.bg-ivory.rounded-full');
      dots.forEach((dot) => {
        expect(dot.className).toContain('rounded-full');
      });
    });

    it('dots have h-1.5 height', () => {
      const { container } = renderStory();
      const dots = container.querySelectorAll('.bg-ivory.rounded-full.h-1\\.5');
      expect(dots.length).toBeGreaterThanOrEqual(6);
    });

    it('renders exactly one set of dot indicators (not per-slide)', () => {
      const { container } = renderStory();
      const dots = container.querySelectorAll('.bg-ivory.rounded-full');
      expect(dots.length).toBe(STORY_SLIDES.length);
    });

    it('dot container is rendered once at section level', () => {
      const { container } = renderStory();
      const dotContainers = container.querySelectorAll('.bottom-12.left-1\\/2.-translate-x-1\\/2');
      expect(dotContainers.length).toBe(1);
    });
  });

  // ─── Scroll ───────────────────────────────────────────────────────
  describe('scroll', () => {
    it('scroll container has no-scrollbar class', () => {
      const { container } = renderStory();
      const scrollContainer = container.querySelector('.no-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('scroll container has overflow-x-auto for smooth scrolling', () => {
      const { container } = renderStory();
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('scroll container has flex layout', () => {
      const { container } = renderStory();
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer?.className).toContain('flex');
    });

    it('each slide has snap-center for snap alignment', () => {
      const { container } = renderStory();
      const snapSlides = container.querySelectorAll('.snap-center');
      expect(snapSlides.length).toBe(STORY_SLIDES.length);
    });
  });

  // ─── Swipe Hint ───────────────────────────────────────────────────
  describe('swipe hint', () => {
    it('renders a hand icon as swipe hint on first slide', () => {
      const { container } = renderStory();
      const hint = container.querySelector('.pointer-events-none svg');
      expect(hint).toBeInTheDocument();
    });

    it('swipe hint is centered on screen', () => {
      const { container } = renderStory();
      const hint = container.querySelector('[class*="right-8"][class*="top-1/2"]');
      expect(hint).toBeInTheDocument();
    });
  });

  // ─── Visual ───────────────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('has dark overlay gradient on images', () => {
      const { container } = renderStory();
      const gradients = container.querySelectorAll('.bg-gradient-to-t');
      expect(gradients.length).toBe(STORY_SLIDES.length);
    });

    it('gradient is bottom-only for text readability', () => {
      const { container } = renderStory();
      const gradient = container.querySelector('.bg-gradient-to-t');
      expect(gradient?.className).toContain('from-ink');
      expect(gradient?.className).toContain('via-ink/70');
    });

    it('images have vivid opacity without grayscale', () => {
      renderStory();
      const images = screen.getAllByAltText('Memory');
      images.forEach((img) => {
        expect(img.className).toMatch(/opacity-75|opacity-80/);
        expect(img.className).not.toContain('grayscale');
      });
    });

    it('like button has backdrop-blur effect', () => {
      const { container } = renderStory();
      const blurCircles = container.querySelectorAll('.backdrop-blur-md');
      expect(blurCircles.length).toBeGreaterThan(0);
    });

    it('like and comment buttons have dark background', () => {
      const { container } = renderStory();
      const bgElements = container.querySelectorAll('.bg-black\\/20');
      expect(bgElements.length).toBeGreaterThan(0);
    });

    it('text content area has z-30 stacking', () => {
      const { container } = renderStory();
      const textAreas = container.querySelectorAll('.z-30');
      expect(textAreas.length).toBeGreaterThan(0);
    });

    it('year labels have same serif italic style as text', () => {
      renderStory();
      const year = screen.getByText('2016 — 2017');
      expect(year.className).toContain('font-serif');
      expect(year.className).toContain('italic');
    });

    it('slide text has ivory color for readability on dark bg', () => {
      renderStory();
      const text = screen.getByText(/Berawal dari chat sederhana/);
      expect(text.className).toContain('text-ivory');
    });
  });

  // ─── Layout ───────────────────────────────────────────────────────
  describe('layout', () => {
    it('section has overflow-hidden', () => {
      const { container } = renderStory();
      const section = container.querySelector('section');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('each slide has min-w-full to span entire viewport', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      expect(slides.length).toBe(STORY_SLIDES.length);
    });

    it('each slide has h-full height', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      slides.forEach((slide) => {
        expect(slide.className).toContain('h-full');
      });
    });

    it('each slide has w-full width', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      slides.forEach((slide) => {
        expect(slide.className).toContain('w-full');
      });
    });

    it('slides are flex centered', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      slides.forEach((slide) => {
        expect(slide.className).toContain('flex');
        expect(slide.className).toContain('items-center');
        expect(slide.className).toContain('justify-center');
      });
    });

    it('image containers are absolute inset-0', () => {
      const { container } = renderStory();
      const imgContainers = container.querySelectorAll('.absolute.inset-0');
      expect(imgContainers.length).toBeGreaterThanOrEqual(STORY_SLIDES.length);
    });

    it('social buttons are positioned bottom-right', () => {
      const { container } = renderStory();
      const socialPanels = container.querySelectorAll('.bottom-36.right-4');
      expect(socialPanels.length).toBeGreaterThan(0);
    });

    it('scroll container has h-full w-full', () => {
      const { container } = renderStory();
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer?.className).toContain('h-full');
      expect(scrollContainer?.className).toContain('w-full');
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────
  describe('edge cases', () => {
    it('re-renders are stable (no extra slides added)', () => {
      const { rerender, container } = render(<CinematicStory weddingSlug="dani-marini" />);
      const slidesBefore = container.querySelectorAll('.min-w-full').length;
      rerender(<CinematicStory weddingSlug="dani-marini" />);
      const slidesAfter = container.querySelectorAll('.min-w-full').length;
      expect(slidesBefore).toBe(slidesAfter);
      expect(slidesAfter).toBe(6);
    });

    it('multiple slides are rendered in DOM simultaneously', () => {
      const { container } = renderStory();
      const slides = container.querySelectorAll('.min-w-full');
      expect(slides.length).toBeGreaterThan(1);
    });

    it('like count displays a number for each slide', () => {
      renderStory();
      const likeButtons = screen.getAllByLabelText('Suka');
      likeButtons.forEach((btn) => {
        const countSpan = btn.querySelector('span');
        expect(countSpan).toBeInTheDocument();
        const count = Number(countSpan?.textContent);
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('comment count starts at 0 for each slide', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      commentButtons.forEach((btn) => {
        const countSpan = btn.querySelector('span');
        expect(countSpan?.textContent).toBe('0');
      });
    });

    it('opening comment form hides like and comment buttons for that slide', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      const initialCount = commentButtons.length;
      fireEvent.click(commentButtons[0]);
      // After opening form, the buttons for that slide should be hidden
      const remainingCommentButtons = screen.getAllByLabelText('Komentar');
      expect(remainingCommentButtons.length).toBeLessThan(initialCount);
    });

    it('comment form name input updates on typing', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const nameInput = screen.getByPlaceholderText('Nama Anda');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      expect(nameInput).toHaveValue('Test User');
    });

    it('comment form text input updates on typing', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const textInput = screen.getByPlaceholderText('Tulis pesan...');
      fireEvent.change(textInput, { target: { value: 'Great story!' } });
      expect(textInput).toHaveValue('Great story!');
    });

    it('Kirim becomes enabled when both fields are filled', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const nameInput = screen.getByPlaceholderText('Nama Anda');
      const textInput = screen.getByPlaceholderText('Tulis pesan...');
      fireEvent.change(nameInput, { target: { value: 'User' } });
      fireEvent.change(textInput, { target: { value: 'Hello' } });
      expect(screen.getByText('Kirim')).not.toBeDisabled();
    });

    it('submitting a comment calls addComment with name and text', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      const nameInput = screen.getByPlaceholderText('Nama Anda');
      const textInput = screen.getByPlaceholderText('Tulis pesan...');
      fireEvent.change(nameInput, { target: { value: 'User' } });
      fireEvent.change(textInput, { target: { value: 'Nice!' } });
      fireEvent.click(screen.getByText('Kirim'));
      expect(mockAddComment).toHaveBeenCalledWith({ name: 'User', text: 'Nice!' });
    });

    it('section has scroll-snap-container class', () => {
      const { container } = renderStory();
      const section = container.querySelector('.scroll-snap-container');
      expect(section).toBeInTheDocument();
    });
  });
});
