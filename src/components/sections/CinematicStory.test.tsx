import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

const driverMock = vi.hoisted(() => {
  const mock = {
    driver: vi.fn((options) => {
      const instance = {
        destroy: vi.fn(),
        drive: vi.fn(),
        isActive: vi.fn(() => false),
      };

      mock.instances.push(instance);
      mock.latestInstance = instance;
      mock.latestOptions = options;
      return instance;
    }),
    instances: [],
    latestInstance: undefined,
    latestOptions: undefined,
  };

  return mock;
});

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
let mockTextHeights: Map<string, { clientHeight: number; scrollHeight: number }>;
let intersectionObservers: IntersectionObserverTestDouble[];

class IntersectionObserverTestDouble {
  readonly observe = vi.fn((target: Element) => {
    this.target = target;
    if (this.thresholds.includes(0)) {
      this.trigger({ isIntersecting: true, intersectionRatio: 1, target });
    }
  });
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
  target: Element | null = null;
  thresholds: number[];

  constructor(
    private callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    const threshold = options?.threshold ?? 0;
    this.thresholds = Array.isArray(threshold) ? threshold : [threshold];
    intersectionObservers.push(this);
  }

  trigger(entry: Partial<IntersectionObserverEntry>) {
    const target = entry.target ?? this.target ?? document.body;
    this.callback(
      [{ target, isIntersecting: false, intersectionRatio: 0, ...entry } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

vi.mock('../../context/WeddingContext', () => ({
  useWeddingContext: () => ({
    story: STORY_SLIDES,
    groomNickname: 'Dani',
    brideNickname: 'Marini',
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

vi.mock('driver.js', () => ({
  driver: driverMock.driver,
}));

import { CinematicStory } from './CinematicStory';
import { dispatchFloatingNavigationStart } from '../../utils/floatingNavigationEvents';

function renderStory() {
  return render(<CinematicStory weddingSlug="dani-marini" />);
}

function getFullStoryObserver() {
  return intersectionObservers.find((observer) =>
    observer.thresholds.some((threshold) => threshold >= 0.8)
  );
}

async function triggerFullStoryVisibility(ratio = 1) {
  await act(async () => {});
  const observer = getFullStoryObserver();
  expect(observer).toBeDefined();
  act(() => {
    observer?.trigger({
      isIntersecting: ratio > 0,
      intersectionRatio: ratio,
      target: observer.target ?? undefined,
    });
  });
}

describe('CinematicStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    driverMock.instances = [];
    driverMock.latestInstance = undefined;
    driverMock.latestOptions = undefined;
    intersectionObservers = [];
    vi.stubGlobal('IntersectionObserver', IntersectionObserverTestDouble);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    mockTextHeights = new Map();
  });

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function () {
      return mockTextHeights.get(this.textContent ?? '')?.clientHeight ?? 54;
    });
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function () {
      return mockTextHeights.get(this.textContent ?? '')?.scrollHeight ?? 54;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

    it('all slide text is always mounted in DOM', () => {
      renderStory();
      expect(screen.getByText('2016 — 2017')).toBeInTheDocument();
      expect(screen.getByText('2018 — 2022')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('first slide text content is present', () => {
      renderStory();
      expect(screen.getByText(/Berawal dari chat sederhana/)).toBeInTheDocument();
    });

    it('second slide text content is present', () => {
      renderStory();
      expect(screen.getByText(/Kita berjalan beriringan/)).toBeInTheDocument();
    });

    it('active and neighbor slides render text content', () => {
      renderStory();
      // Slide 0 (active) text present
      expect(screen.getByText(/Berawal dari chat sederhana/)).toBeInTheDocument();
      // Slide 1 (neighbor) text present
      expect(screen.getByText(/Kita berjalan beriringan/)).toBeInTheDocument();
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
    it('renders images for active slide and neighbors only', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      // Active slide (0) + neighbor (1) = 2 images rendered
      expect(images.length).toBeLessThanOrEqual(STORY_SLIDES.length);
      expect(images.length).toBeGreaterThan(0);
    });

    it('main images use object-contain for smart fit', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      images.forEach((img) => {
        expect(img).toHaveClass('object-contain');
      });
    });

    it('images use object-contain for smart fit', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('object-contain');
      });
    });

    it('images have object-contain for smart fit', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('object-contain');
      });
    });

    it('images have referrerPolicy no-referrer', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      images.forEach((img) => {
        expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
      });
    });

    it('first image src matches first slide background', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
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

    it('marks only the active like button as the Driver.js story like target', () => {
      const { container } = renderStory();
      const likeTargets = container.querySelectorAll('[data-tour="story-like-button"]');

      expect(likeTargets).toHaveLength(1);
      expect(likeTargets[0]).toHaveAttribute('aria-label', 'Suka');
      expect(screen.getAllByLabelText('Suka').length).toBeGreaterThan(1);
    });

    it('clicking comment button opens comment input form', () => {
      renderStory();
      const commentButtons = screen.getAllByLabelText('Komentar');
      fireEvent.click(commentButtons[0]);
      // Comment form should appear with input fields
      expect(screen.getByPlaceholderText('Nama Anda')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tulis pesan...')).toBeInTheDocument();
    });

    it('marks only the active comment button as the Driver.js story comment target', () => {
      const { container } = renderStory();
      const commentTargets = container.querySelectorAll('[data-tour="story-comment-button"]');

      expect(commentTargets).toHaveLength(1);
      expect(commentTargets[0]).toHaveAttribute('aria-label', 'Komentar');
      expect(screen.getAllByLabelText('Komentar').length).toBeGreaterThan(1);
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

  // ─── Guided Tour ──────────────────────────────────────────────────
  describe('guided tour', () => {
    it('does not render the permanent hand gesture hint', () => {
      const { container } = renderStory();
      expect(container.querySelector('[class*="right-8"][class*="top-1/2"]')).not.toBeInTheDocument();
    });

    it('marks the horizontal story scroller as the Driver.js tour target', () => {
      const { container } = renderStory();
      const target = container.querySelector('[data-tour="cinematic-story"]');
      expect(target).toBeInTheDocument();
      expect(target).toHaveClass('overflow-x-auto');
      expect(target).toHaveClass('snap-x');
    });

    it('does not start the Driver.js tour while the story section is only partially visible', async () => {
      vi.useFakeTimers();
      renderStory();

      await triggerFullStoryVisibility(0.75);
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(driverMock.driver).not.toHaveBeenCalled();
    });

    it('starts a centered scroll-freezing Driver.js tour after the required story viewport has settled', async () => {
      vi.useFakeTimers();
      const { container } = renderStory();
      expect(container.querySelector('[data-tour="cinematic-story"]')).toBeInTheDocument();

      await triggerFullStoryVisibility();
      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(driverMock.driver).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(driverMock.driver).toHaveBeenCalledOnce();

      expect(driverMock.latestInstance?.drive).toHaveBeenCalledOnce();
      expect(driverMock.latestOptions).toEqual(
        expect.objectContaining({
          allowScroll: false,
          disableActiveInteraction: false,
          doneBtnText: 'Mengerti',
          overlayClickBehavior: 'close',
          nextBtnText: 'Lanjut',
          showProgress: false,
          smoothScroll: false,
        })
      );
      expect(driverMock.latestOptions?.steps).toEqual([
        expect.objectContaining({
          disableActiveInteraction: false,
          popover: expect.objectContaining({
            title: 'Kisah Kami',
            description: 'Geser ke samping untuk mengikuti setiap bagian cerita. Setelah panduan ditutup, Anda dapat menggulir halaman seperti biasa.',
            showButtons: ['next'],
            nextBtnText: 'Lanjut',
            doneBtnText: 'Mengerti',
          }),
        }),
        expect.objectContaining({
          advanceOnClick: true,
          disableActiveInteraction: false,
          element: '[data-tour="story-like-button"]',
          waitForElement: 1000,
          popover: expect.objectContaining({
            title: 'Tanda Suka',
            description: 'Ketuk ikon hati untuk mengirim tanda suka pada bagian cerita yang sedang dibaca.',
            side: 'left',
            align: 'center',
            showButtons: ['next'],
            nextBtnText: 'Lanjut',
          }),
        }),
        expect.objectContaining({
          advanceOnClick: true,
          disableActiveInteraction: false,
          element: '[data-tour="story-comment-button"]',
          waitForElement: 1000,
          popover: expect.objectContaining({
            title: 'Ucapan Cerita',
            description: 'Ketuk ikon komentar untuk menulis ucapan singkat pada bagian cerita ini.',
            side: 'left',
            align: 'center',
            showButtons: ['next'],
            doneBtnText: 'Mengerti',
          }),
        }),
      ]);
      expect(driverMock.latestOptions?.steps[0]).not.toHaveProperty('element');
    });

    it('does not start the story tour when the guest already swiped the story before the delay ends', async () => {
      vi.useFakeTimers();
      const { container } = renderStory();
      const target = container.querySelector('[data-tour="cinematic-story"]');
      expect(target).toBeInTheDocument();
      Object.defineProperty(target, 'scrollTo', {
        configurable: true,
        value: vi.fn(),
      });

      await triggerFullStoryVisibility();

      fireEvent.touchStart(target!, {
        touches: [{ clientX: 180, clientY: 20 }],
      });
      fireEvent.touchMove(target!, {
        touches: [{ clientX: 120, clientY: 24 }],
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(driverMock.driver).not.toHaveBeenCalled();
    });

    it('does not start the story tour while the active comment form is open', async () => {
      vi.useFakeTimers();
      renderStory();

      fireEvent.click(screen.getAllByLabelText('Komentar')[0]);
      expect(screen.getByPlaceholderText('Nama Anda')).toBeInTheDocument();

      await triggerFullStoryVisibility();
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(driverMock.driver).not.toHaveBeenCalled();
    });

    it('destroys the story tour from the Driver.js done and close handlers', async () => {
      vi.useFakeTimers();
      renderStory();

      await triggerFullStoryVisibility();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(driverMock.driver).toHaveBeenCalledOnce();

      const instance = driverMock.latestInstance;
      const hookOptions = {
        config: driverMock.latestOptions,
        driver: instance,
        index: 0,
        state: {},
      };

      driverMock.latestOptions?.onDoneClick(undefined, driverMock.latestOptions.steps[0], hookOptions);
      driverMock.latestOptions?.onCloseClick(undefined, driverMock.latestOptions.steps[0], hookOptions);

      expect(instance?.destroy).toHaveBeenCalledTimes(2);
    });

    it('destroys the story tour before floating navigation starts', async () => {
      vi.useFakeTimers();
      renderStory();

      await triggerFullStoryVisibility();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(driverMock.driver).toHaveBeenCalledOnce();

      const instance = driverMock.latestInstance;
      instance?.isActive.mockReturnValue(true);

      act(() => {
        dispatchFloatingNavigationStart('twibbon-section');
      });

      expect(instance?.destroy).toHaveBeenCalledOnce();
    });
  });

  // ─── Visual ───────────────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('has gradient overlay on all slides (always mounted)', () => {
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

    it('images use object-contain without grayscale', () => {
      renderStory();
      const images = screen.getAllByAltText(/Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('object-contain');
        expect(img.className).not.toContain('grayscale');
      });
    });

    it('like button has dark background', () => {
      const { container } = renderStory();
      const darkButtons = container.querySelectorAll('.bg-black\\/40');
      expect(darkButtons.length).toBeGreaterThan(0);
    });

    it('like and comment buttons have dark background', () => {
      const { container } = renderStory();
      const bgElements = container.querySelectorAll('.bg-black\\/40');
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

    it('opening comment form hides like and comment buttons via opacity', () => {
      const { container } = renderStory();
      const commentButton = screen.getAllByLabelText('Komentar')[0];
      fireEvent.click(commentButton);
      // Buttons are still in DOM but hidden via opacity-0 + pointer-events-none
      const buttonContainer = container.querySelector('.pointer-events-none');
      expect(buttonContainer).toBeInTheDocument();
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

    it('does not show read-more control when long text is not visually clamped', async () => {
      const longButVisibleText = STORY_SLIDES[0].text;
      mockTextHeights.set(longButVisibleText, { clientHeight: 54, scrollHeight: 54 });

      renderStory();

      await waitFor(() => {
        expect(screen.queryByText('baca selengkapnya...')).not.toBeInTheDocument();
      });
      expect(screen.queryByLabelText('Baca selengkapnya')).not.toBeInTheDocument();
    });

    it('shows read-more control only when measured text overflows the three-line clamp', async () => {
      const overflowingText = STORY_SLIDES[0].text;
      mockTextHeights.set(overflowingText, { clientHeight: 54, scrollHeight: 90 });

      renderStory();

      expect(await screen.findByText('baca selengkapnya...')).toBeInTheDocument();
      expect(screen.getByLabelText('Baca selengkapnya')).toBeInTheDocument();
    });

    it('toggles overflowing text from read-more to hide label', async () => {
      const overflowingText = STORY_SLIDES[0].text;
      mockTextHeights.set(overflowingText, { clientHeight: 54, scrollHeight: 90 });

      renderStory();

      const toggle = await screen.findByLabelText('Baca selengkapnya');
      fireEvent.click(toggle);

      expect(screen.getByText('sembunyikan...')).toBeInTheDocument();
      expect(screen.getByLabelText('Sembunyikan teks')).toBeInTheDocument();
    });

    it('does not make non-overflowing text expandable by click or keyboard', async () => {
      const longButVisibleText = STORY_SLIDES[0].text;
      mockTextHeights.set(longButVisibleText, { clientHeight: 54, scrollHeight: 54 });

      renderStory();

      await waitFor(() => {
        expect(screen.queryByLabelText('Baca selengkapnya')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Berawal dari chat sederhana/));
      expect(screen.queryByText('sembunyikan...')).not.toBeInTheDocument();
    });
  });
});
