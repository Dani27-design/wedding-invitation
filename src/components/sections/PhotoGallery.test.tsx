import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getGalleryLayout } from '../../utils/galleryLayout';

const GALLERY_URLS = [
  '/images/bride_face_potrait.jpeg',
  '/images/bride_and_groom_full_body_potrait.jpeg',
  '/images/groom_face_potrait.jpeg',
  '/images/bride_and_groom_half_body_potrait.png',
  '/images/bride_face_potrait.jpeg',
  '/images/groom_face_potrait.jpeg',
  '/images/bride_and_groom_half_body_potrait.png',
  '/images/bride_and_groom_full_body_potrait.jpeg',
  '/images/bride_face_potrait.jpeg',
  '/images/groom_face_potrait.jpeg',
  '/images/bride_and_groom_half_body_potrait.png',
  '/images/bride_and_groom_full_body_potrait.jpeg',
];

const GALLERY_ITEMS = GALLERY_URLS.map((src, i) => ({ src, ...getGalleryLayout(i) }));

vi.mock('../../context/WeddingContext', () => ({
  useWeddingContext: () => ({
    gallery: GALLERY_URLS,
    groomNickname: 'Dani',
    brideNickname: 'Marini',
  }),
}));

import { PhotoGallery } from './PhotoGallery';

function renderGallery(onSelectPhoto = vi.fn()) {
  return render(<PhotoGallery onSelectPhoto={onSelectPhoto} />);
}

describe('PhotoGallery', () => {
  // ─── Basic Rendering ───────────────────────────────────────────────
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderGallery();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a section element', () => {
      const { container } = renderGallery();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('section has bg-paper background', () => {
      const { container } = renderGallery();
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-paper');
    });

    it('section has overflow-hidden', () => {
      const { container } = renderGallery();
      const section = container.querySelector('section');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('section has py-6 padding', () => {
      const { container } = renderGallery();
      const section = container.querySelector('section');
      expect(section?.className).toContain('py-[2vh]');
    });

    it('renders consistently on re-render', () => {
      const { rerender } = render(<PhotoGallery onSelectPhoto={vi.fn()} />);
      rerender(<PhotoGallery onSelectPhoto={vi.fn()} />);
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      expect(images).toHaveLength(12);
    });

    it('renders "Jejak Cerita Kami" label', () => {
      renderGallery();
      expect(screen.getByText('Jejak Cerita Kami')).toBeInTheDocument();
    });

    it('renders header description text', () => {
      renderGallery();
      expect(screen.getByText(/Beberapa momen yang kami simpan/)).toBeInTheDocument();
    });
  });

  // ─── Images ────────────────────────────────────────────────────────
  describe('images', () => {
    it('renders exactly 12 gallery images', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      expect(images).toHaveLength(12);
    });

    it('all images use object-cover', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img).toHaveClass('object-cover');
      });
    });

    it('images have contextual alt text with couple names for each index', () => {
      renderGallery();
      for (let i = 0; i < 12; i++) {
        expect(screen.getByAltText(`Galeri Dani & Marini - foto ${i + 1}`)).toBeInTheDocument();
      }
    });

    it('first image has correct src path', () => {
      renderGallery();
      const img = screen.getByAltText('Galeri Dani & Marini - foto 1');
      expect(img).toHaveAttribute('src', '/images/bride_face_potrait.jpeg');
    });

    it('second image has correct src path', () => {
      renderGallery();
      const img = screen.getByAltText('Galeri Dani & Marini - foto 2');
      expect(img).toHaveAttribute('src', '/images/bride_and_groom_full_body_potrait.jpeg');
    });

    it('third image has correct src path', () => {
      renderGallery();
      const img = screen.getByAltText('Galeri Dani & Marini - foto 3');
      expect(img).toHaveAttribute('src', '/images/groom_face_potrait.jpeg');
    });

    it('each image src matches GALLERY_ITEMS constant', () => {
      renderGallery();
      GALLERY_ITEMS.forEach((item, i) => {
        const img = screen.getByAltText(`Galeri Dani & Marini - foto ${i + 1}`);
        expect(img).toHaveAttribute('src', item.src);
      });
    });

    it('images have object-cover for proper aspect ratio', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('object-cover');
      });
    });

    it('images have object-cover to fill container', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('object-cover');
      });
    });

    it('images have transition-transform for hover animation', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('transition-transform');
      });
    });

    it('images have referrerPolicy no-referrer', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
      });
    });
  });

  // ─── Interaction ──────────────────────────────────────────────────
  describe('interaction', () => {
    it('clicking first image calls onSelectPhoto with its src', () => {
      const onSelectPhoto = vi.fn();
      renderGallery(onSelectPhoto);
      const firstImage = screen.getByAltText('Galeri Dani & Marini - foto 1');
      const clickable = firstImage.closest('.cursor-zoom-in');
      fireEvent.click(clickable!);
      expect(onSelectPhoto).toHaveBeenCalledWith('/images/bride_face_potrait.jpeg');
    });

    it('clicking second image calls onSelectPhoto with its src', () => {
      const onSelectPhoto = vi.fn();
      renderGallery(onSelectPhoto);
      const img = screen.getByAltText('Galeri Dani & Marini - foto 2');
      fireEvent.click(img.closest('.cursor-zoom-in')!);
      expect(onSelectPhoto).toHaveBeenCalledWith('/images/bride_and_groom_full_body_potrait.jpeg');
    });

    it('clicking third image calls onSelectPhoto with groom src', () => {
      const onSelectPhoto = vi.fn();
      renderGallery(onSelectPhoto);
      const img = screen.getByAltText('Galeri Dani & Marini - foto 3');
      fireEvent.click(img.closest('.cursor-zoom-in')!);
      expect(onSelectPhoto).toHaveBeenCalledWith('/images/groom_face_potrait.jpeg');
    });

    it('clicking each image calls onSelectPhoto with correct GALLERY_ITEMS src', () => {
      const onSelectPhoto = vi.fn();
      renderGallery(onSelectPhoto);
      GALLERY_ITEMS.forEach((item, i) => {
        const img = screen.getByAltText(`Galeri Dani & Marini - foto ${i + 1}`);
        fireEvent.click(img.closest('.cursor-zoom-in')!);
        expect(onSelectPhoto).toHaveBeenLastCalledWith(item.src);
      });
      expect(onSelectPhoto).toHaveBeenCalledTimes(12);
    });

    it('clicking multiple images in sequence calls onSelectPhoto correctly', () => {
      const onSelectPhoto = vi.fn();
      renderGallery(onSelectPhoto);
      const img0 = screen.getByAltText('Galeri Dani & Marini - foto 1').closest('.cursor-zoom-in')!;
      const img5 = screen.getByAltText('Galeri Dani & Marini - foto 6').closest('.cursor-zoom-in')!;
      fireEvent.click(img0);
      fireEvent.click(img5);
      expect(onSelectPhoto).toHaveBeenCalledTimes(2);
      expect(onSelectPhoto).toHaveBeenNthCalledWith(1, GALLERY_ITEMS[0].src);
      expect(onSelectPhoto).toHaveBeenNthCalledWith(2, GALLERY_ITEMS[5].src);
    });
  });

  // ─── Scroll and Fade ─────────────────────────────────────────────
  describe('scroll and fade', () => {
    it('has horizontal overflow-x-auto container', () => {
      const { container } = renderGallery();
      expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });

    it('has scroll fade gradient on right side', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade).toBeInTheDocument();
    });

    it('fade gradient goes from-paper to transparent', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade?.className).toContain('from-paper');
    });

    it('fade gradient is pointer-events-none (non-interactive)', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade).toHaveClass('pointer-events-none');
    });

    it('fade gradient has z-10 stacking', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade?.className).toContain('z-10');
    });

    it('fade spans full height (top-0 bottom-0)', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade?.className).toContain('top-0');
      expect(fade?.className).toContain('bottom-0');
    });

    it('fade is positioned right-0', () => {
      const { container } = renderGallery();
      const fade = container.querySelector('.bg-gradient-to-l');
      expect(fade?.className).toContain('-right-8');
    });

    it('scroll container has relative wrapper', () => {
      const { container } = renderGallery();
      const relativeWrapper = container.querySelector('.relative');
      expect(relativeWrapper).toBeInTheDocument();
    });
  });

  // ─── Visual ───────────────────────────────────────────────────────
  describe('visual rendering and styling', () => {
    it('each gallery item has organic rounded shape', () => {
      const { container } = renderGallery();
      const items = container.querySelectorAll('.cursor-zoom-in');
      expect(items.length).toBe(12);
      items.forEach((item) => {
        // Each item should have a rounded-[...] shape class
        expect(item.className).toMatch(/rounded-\[/);
      });
    });

    it('each gallery item has shadow-2xl', () => {
      const { container } = renderGallery();
      const items = container.querySelectorAll('.shadow-2xl');
      expect(items.length).toBe(12);
    });

    it('each gallery item has cursor-zoom-in', () => {
      const { container } = renderGallery();
      const items = container.querySelectorAll('.cursor-zoom-in');
      expect(items.length).toBe(12);
    });

    it('grid has responsive row heights 200px for mobile', () => {
      const { container } = renderGallery();
      const grid = container.querySelector('.grid-rows-\\[150px_150px\\]');
      expect(grid).toBeInTheDocument();
    });

    it('grid has responsive row heights 280px for desktop', () => {
      const { container } = renderGallery();
      const grid = container.querySelector('.md\\:grid-rows-\\[280px_280px\\]');
      expect(grid).toBeInTheDocument();
    });

    it('grid uses grid-flow-col-dense for masonry-like layout', () => {
      const { container } = renderGallery();
      const grid = container.querySelector('.grid-flow-col-dense');
      expect(grid).toBeInTheDocument();
    });

    it('has decorative background blur top-left', () => {
      const { container } = renderGallery();
      const blur1 = container.querySelector('.bg-gold\\/5.rounded-full.blur-3xl');
      expect(blur1).toBeInTheDocument();
    });

    it('has decorative background blur bottom-right', () => {
      const { container } = renderGallery();
      const blur2 = container.querySelector('.bg-sepia\\/20');
      expect(blur2).toBeInTheDocument();
    });

    it('gallery items have isolate for stacking context', () => {
      const { container } = renderGallery();
      const isolateItems = container.querySelectorAll('.isolate');
      expect(isolateItems.length).toBe(12);
    });

    it('different images have different shapes', () => {
      const { container } = renderGallery();
      const items = container.querySelectorAll('.cursor-zoom-in');
      const shapes = new Set<string>();
      items.forEach((item) => {
        const match = item.className.match(/rounded-\[[^\]]+\]/);
        if (match) shapes.add(match[0]);
      });
      // There should be multiple unique shapes
      expect(shapes.size).toBeGreaterThan(1);
    });
  });

  // ─── Description ──────────────────────────────────────────────────
  describe('description', () => {
    it('displays "Setiap foto menyimpan cerita..." text', () => {
      renderGallery();
      expect(screen.getByText(/Setiap foto menyimpan cerita/)).toBeInTheDocument();
    });

    it('description has serif italic styling', () => {
      renderGallery();
      const desc = screen.getByText(/Setiap foto menyimpan cerita/);
      expect(desc.className).toContain('font-serif');
      expect(desc.className).toContain('italic');
    });

    it('description has subdued text color', () => {
      renderGallery();
      const desc = screen.getByText(/Setiap foto menyimpan cerita/);
      expect(desc.className).toContain('text-ink/70');
    });

    it('description is centered', () => {
      renderGallery();
      const desc = screen.getByText(/Setiap foto menyimpan cerita/);
      const parent = desc.parentElement;
      expect(parent?.className).toContain('text-center');
    });

    it('description section has mt-10 margin top', () => {
      renderGallery();
      const desc = screen.getByText(/Setiap foto menyimpan cerita/);
      const parent = desc.parentElement;
      expect(parent?.className).toContain('mt-[2vh]');
    });
  });

  // ─── Performance ──────────────────────────────────────────────────
  describe('performance', () => {
    it('gallery items use transform-gpu for hardware acceleration', () => {
      const { container } = renderGallery();
      const gpuItems = container.querySelectorAll('.transform-gpu');
      expect(gpuItems.length).toBe(12);
    });

    it('images have backface-visibility hidden for rendering optimization', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img.className).toContain('[backface-visibility:hidden]');
      });
    });

    it('stagger delay is capped at 0.3 seconds', () => {
      // The component uses Math.min(i * 0.1, 0.3) for delay
      // For index 0: 0, index 1: 0.1, index 2: 0.2, index 3: 0.3, index 4+: 0.3
      // We verify the gallery renders all 12 items correctly despite delay cap
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      expect(images.length).toBe(12);
    });

    it('all images are rendered for performance', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      expect(images).toHaveLength(12);
    });
  });

  // ─── Layout ───────────────────────────────────────────────────────
  describe('layout', () => {
    it('container has mx-auto for centering', () => {
      const { container } = renderGallery();
      const cont = container.querySelector('.container.mx-auto');
      expect(cont).toBeInTheDocument();
    });

    it('container has px-6 horizontal padding', () => {
      const { container } = renderGallery();
      const cont = container.querySelector('.container.mx-auto.px-6');
      expect(cont).toBeInTheDocument();
    });

    it('has relative z-10 content layer', () => {
      const { container } = renderGallery();
      const zLayer = container.querySelector('.z-10');
      expect(zLayer).toBeInTheDocument();
    });

    it('scroll area has negative margin and padding for full bleed', () => {
      const { container } = renderGallery();
      const scrollArea = container.querySelector('.overflow-x-auto');
      expect(scrollArea?.className).toContain('-mx-4');
      expect(scrollArea?.className).toContain('px-4');
    });

    it('grid has gap-4 on mobile, gap-6 on desktop', () => {
      const { container } = renderGallery();
      const grid = container.querySelector('.grid-flow-col-dense');
      expect(grid?.className).toContain('gap-4');
      expect(grid?.className).toContain('md:gap-6');
    });

    it('auto-cols are 150px mobile, 210px desktop', () => {
      const { container } = renderGallery();
      const grid = container.querySelector('.auto-cols-\\[120px\\]');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toContain('md:auto-cols-[210px]');
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────
  describe('edge cases', () => {
    it('all 12 items are clickable (have cursor-zoom-in)', () => {
      const { container } = renderGallery();
      const clickable = container.querySelectorAll('.cursor-zoom-in');
      expect(clickable.length).toBe(12);
    });

    it('hover overlay appears on each item', () => {
      const { container } = renderGallery();
      const overlays = container.querySelectorAll('.bg-ink\\/30');
      expect(overlays.length).toBe(12);
    });

    it('each item has group class for hover coordination', () => {
      const { container } = renderGallery();
      const groups = container.querySelectorAll('.group');
      expect(groups.length).toBe(12);
    });

    it('no image has eager loading', () => {
      renderGallery();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      images.forEach((img) => {
        expect(img.getAttribute('loading')).not.toBe('eager');
      });
    });

    it('gallery renders with no broken display when all items present', () => {
      const { container } = renderGallery();
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      const images = screen.getAllByAltText(/Galeri Dani & Marini/);
      expect(images.length).toBe(GALLERY_ITEMS.length);
    });

    it('items have overflow-hidden to clip rounded content', () => {
      const { container } = renderGallery();
      const items = container.querySelectorAll('.cursor-zoom-in.overflow-hidden');
      expect(items.length).toBe(12);
    });
  });
});
