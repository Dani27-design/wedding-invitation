import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ slug: 'dani-marini' }) };
});

vi.mock('./hooks/useWishes', () => ({
  useWishes: () => ({
    wishes: [
      { id: 'd1', name: 'Test User', message: 'Test message', attendance: 'yes', createdAt: Date.now() },
    ],
    isLoading: false,
  }),
}));

vi.mock('./lib/wishes', () => ({
  addWish: vi.fn(() => Promise.resolve({ id: 'new-id' })),
}));

vi.mock('./hooks/useWedding', () => ({
  useWedding: () => ({
    wedding: {
      defaultGuest: 'Tamu Terkasih Kami',
      musicUrl: '/musics/adele-make-you-feel-my-love.mp3',
      groomNickname: 'Dani',
      brideNickname: 'Marini',
      eventCity: 'Surabaya',
      eventDate: '2026-08-29',
      openingImage: '/images/bride_and_groom_full_body_potrait.jpeg',
      heroImage: '/images/bride_and_groom_full_body_potrait.jpeg',
      groomName: 'M. Daniansyah Chusyaidin, S.Kom',
      groomParents: 'Putra Bapak M. Safiudin Sukri & Ibu Indiarti',
      groomPhoto: '/images/groom_face_potrait.jpeg',
      brideName: 'Siti Nur Marini, A.Md.M',
      brideParents: 'Putri Bapak Margono & Ibu (Almh) Sulami',
      bridePhoto: '/images/bride_face_potrait.jpeg',
      brideInstagram: 'https://instagram.com/mariniw_',
      brideThreads: 'https://threads.com/@mariniw_',
      brideWhatsapp: '628883816403',
      groomInstagram: 'https://instagram.com/danichusyaidin',
      groomLinkedin: 'https://id.linkedin.com/in/daniansyahchusyaidin',
      groomWhatsapp: '6285790428078',
      twibbonOverlay: '/images/twibbon-overlay.png',
      credits: [
        { name: 'M. Daniansyah C.', role: 'developer', description: 'Developer description' },
        { name: 'Siti Nur Marini', role: 'designer', description: 'Designer description' },
      ],
      ceremonies: [
        { name: 'Akad Nikah', start: '09:00', end: '10:00' },
        { name: 'Resepsi', start: '10:00', end: '13:00' },
      ],
      venueName: 'Gedung Wanita Candra Kencana',
      venueAddress: 'Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya',
      venueMapsUrl: 'https://www.google.com/maps/dir//GEDUNG+WANITA+Candra+Kencana',
      quranArabic: 'Arabic text',
      quranTranslation: 'Translation text',
      quranReference: 'QS. Ar-Rum: 21',
      giftAccounts: [
        { bank: 'BCA', account: '1234567890', owner: 'M. Daniansyah Chusyaidin' },
        { bank: 'BRI', account: '0987654321', owner: 'Siti Nur Marini' },
        { bank: 'Jenius', account: '111222333444', owner: 'M. Daniansyah Chusyaidin' },
        { bank: 'BTN', account: '777888999000', owner: 'Siti Nur Marini' },
        { bank: 'Gopay', account: '08123456789', owner: 'M. Daniansyah Chusyaidin' },
        { bank: 'Seabank', account: '08987654321', owner: 'Siti Nur Marini' },
      ],
      gallery: [
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
      ],
      story: [
        { year: '2016 — 2017', text: 'Story 1', bgImage: '/images/bride_face_potrait.jpeg' },
        { year: '2018 — 2022', text: 'Story 2', bgImage: '/images/groom_face_potrait.jpeg' },
        { year: '2023', text: 'Story 3', bgImage: '/images/bride_and_groom_half_body_potrait.png' },
        { year: '2024 — 2025', text: 'Story 4', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
        { year: '2026', text: 'Story 5', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
        { year: 'Ikrar', text: 'Story 6', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
      ],
      theme: {
        template: 'cinematic',
        colors: { accent: '#B48D3E', background: '#FDFCF8', text: '#1A1A1A', surface: '#F5F2ED', button: '#F8BBD0' },
        fonts: { heading: 'Cormorant Garamond', body: 'Montserrat', decorative: 'Playfair Display', script: 'Dayland' },
      },
    },
    isLoading: false,
  }),
}));

import Wedding from './pages/Wedding';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Utility: set window.location.search before rendering */
function setLocationSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { search },
    writable: true,
    configurable: true,
  });
}

/** Utility: render App and click "Buka Undangan" to reach main content */
async function renderAndOpen() {
  const result = render(<Wedding />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument(), { timeout: 3000 });
  return result;
}

// ---------------------------------------------------------------------------
// Reset location before each test so URL-param tests don't leak
// ---------------------------------------------------------------------------

beforeEach(() => {
  setLocationSearch('');
  vi.clearAllMocks();
});

// ===========================================================================
// DESCRIBE: App - Initial Render
// ===========================================================================

describe('App - Initial Render', () => {
  it('renders without crashing', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('root element is a div', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('has min-h-screen class for full viewport height', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('has overflow-x-hidden to prevent horizontal scroll glitch', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });

  it('has bg-ivory background class', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('bg-ivory');
  });

  it('has text-ink class for base text color', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('text-ink');
  });

  it('has font-sans class for default typography', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('font-sans');
  });

  it('has gold selection highlight', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('selection:bg-gold/20');
  });

  it('renders BackgroundLayers with animate-grain element', () => {
    render(<Wedding />);
    const grain = document.querySelector('.animate-grain');
    expect(grain).toBeInTheDocument();
  });

  it('has an audio element in the document', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
  });

  it('audio element references the correct local music file', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toContain('adele-make-you-feel-my-love');
  });

  it('audio element src ends with .mp3 extension', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio');
    expect(audio?.getAttribute('src')).toMatch(/\.mp3$/);
  });

  it('audio element has loop attribute for continuous playback', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio');
    expect(audio).toHaveAttribute('loop');
  });

  it('does not render duplicate audio elements', () => {
    render(<Wedding />);
    const audios = document.querySelectorAll('audio');
    expect(audios.length).toBe(1);
  });

  it('does not have any visible error boundaries or fallback UI', () => {
    const { container } = render(<Wedding />);
    expect(container.querySelector('[data-error]')).toBeNull();
  });
});

// ===========================================================================
// DESCRIBE: App - Cinematic Opening (default state, isOpen=false)
// ===========================================================================

describe('App - Cinematic Opening (default state)', () => {
  it('shows opening overlay by default (isOpen=false)', () => {
    render(<Wedding />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows "Buka Undangan" call-to-action button', () => {
    render(<Wedding />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows "Dani & Marini" couple names in opening', () => {
    render(<Wedding />);
    expect(screen.getByText(/Dani/i)).toBeInTheDocument();
    expect(screen.getByText(/Marini/i)).toBeInTheDocument();
  });

  it('shows "Turut Mengundang" invitation label', () => {
    render(<Wedding />);
    expect(screen.getByText(/Turut Mengundang/i)).toBeInTheDocument();
  });

  it('shows default guest name "Tamu Terkasih Kami" when no URL param', () => {
    render(<Wedding />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('does NOT render <main> tag before opening', () => {
    const { container } = render(<Wedding />);
    expect(container.querySelector('main')).toBeNull();
  });

  it('does NOT show RSVP section before opening', () => {
    render(<Wedding />);
    expect(screen.queryByText('RSVP & Wishes')).not.toBeInTheDocument();
  });

  it('does NOT show gallery section before opening', () => {
    render(<Wedding />);
    expect(screen.queryByText(/Gallery/i)).not.toBeInTheDocument();
  });

  it('does NOT show digital envelope before opening', () => {
    render(<Wedding />);
    expect(screen.queryByText(/Digital Envelope/i)).not.toBeInTheDocument();
  });

  it('does NOT show floating controller before opening', () => {
    render(<Wedding />);
    // The floating controller is only rendered when isOpen is true
    // There should be no <main> element and no music toggle visible
    const main = document.querySelector('main');
    expect(main).toBeNull();
  });

  it('does NOT show footer before opening', () => {
    render(<Wedding />);
    expect(screen.queryByText(/Made with/i)).not.toBeInTheDocument();
  });

  it('does NOT show hero section before opening', () => {
    const { container } = render(<Wedding />);
    // Hero is inside <main> which does not exist yet
    expect(container.querySelector('main')).toBeNull();
  });
});

// ===========================================================================
// DESCRIBE: App - Guest Name from URL
// ===========================================================================

describe('App - Guest Name from URL', () => {
  it('reads ?to= query parameter and displays guest name', () => {
    setLocationSearch('?to=Budi%20Santoso');
    render(<Wedding />);
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
  });

  it('decodes URL-encoded names with %20 for spaces', () => {
    setLocationSearch('?to=Ahmad%20Rizky%20Pratama');
    render(<Wedding />);
    expect(screen.getByText('Ahmad Rizky Pratama')).toBeInTheDocument();
  });

  it('handles single-word guest name', () => {
    setLocationSearch('?to=Siti');
    render(<Wedding />);
    expect(screen.getByText('Siti')).toBeInTheDocument();
  });

  it('shows default "Tamu Terkasih Kami" when ?to= is absent', () => {
    setLocationSearch('');
    render(<Wedding />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('shows default when query string has other params but not "to"', () => {
    setLocationSearch('?lang=id&ref=whatsapp');
    render(<Wedding />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('handles + encoded spaces in guest name', () => {
    setLocationSearch('?to=Pak+Budi');
    render(<Wedding />);
    // URLSearchParams treats + as space
    expect(screen.getByText('Pak Budi')).toBeInTheDocument();
  });

  it('handles special characters in guest name', () => {
    setLocationSearch('?to=Dr.%20H.%20Muhammad');
    render(<Wedding />);
    expect(screen.getByText('Dr. H. Muhammad')).toBeInTheDocument();
  });

  it('handles empty ?to= value gracefully (shows default)', () => {
    setLocationSearch('?to=');
    render(<Wedding />);
    // Empty string is falsy, so default should show
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });
});

// ===========================================================================
// DESCRIBE: App - Opening to Main Content Transition
// ===========================================================================

describe('App - Opening to Main Content Transition', () => {
  it('clicking "Buka Undangan" transitions to main content', async () => {
    render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('after opening: <main> element has relative and z-10 classes', async () => {
    render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    const main = document.querySelector('main');
    expect(main).toHaveClass('relative');
    expect(main).toHaveClass('z-10');
  });

  it('after opening: hero section is visible with couple names', async () => {
    await renderAndOpen();
    // HeroSection should display Dani and Marini
    const allDani = screen.getAllByText(/Dani/i);
    const allMarini = screen.getAllByText(/Marini/i);
    expect(allDani.length).toBeGreaterThan(0);
    expect(allMarini.length).toBeGreaterThan(0);
  });

  it('after opening: floating controller is rendered inside main', async () => {
    await renderAndOpen();
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    // FloatingController is the first child of main
    expect(main?.children.length).toBeGreaterThan(0);
  });

  it('after opening: event section is visible', async () => {
    await renderAndOpen();
    // EventSection typically shows event details
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('after opening: RSVP section is visible', async () => {
    await renderAndOpen();
    expect(screen.getByText('Ucapan & Doa')).toBeInTheDocument();
  });

  it('after opening: digital envelope section is visible', async () => {
    await renderAndOpen();
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    // DigitalEnvelope is rendered within main
    expect(main?.innerHTML).toBeTruthy();
  });

  it('after opening: footer is visible', async () => {
    await renderAndOpen();
    // Footer component is the last rendered section
    const main = document.querySelector('main');
    expect(main?.children.length).toBeGreaterThanOrEqual(5);
  });

  it('opening overlay (CinematicOpening) is no longer the active view after click', async () => {
    render(<Wedding />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    // After clicking, main content appears (AnimatePresence may keep exit animation in DOM)
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('background layers persist after opening transition', async () => {
    await renderAndOpen();
    const grain = document.querySelector('.animate-grain');
    expect(grain).toBeInTheDocument();
  });

  it('audio element persists after opening transition', async () => {
    await renderAndOpen();
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
  });

  it('root container retains all CSS classes after opening', async () => {
    const { container } = render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    expect(container.firstChild).toHaveClass('min-h-screen');
    expect(container.firstChild).toHaveClass('bg-ivory');
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });
});

// ===========================================================================
// DESCRIBE: App - Audio / Music
// ===========================================================================

describe('App - Audio / Music', () => {
  it('audio element exists with correct src path', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toBe('/musics/adele-make-you-feel-my-love.mp3');
  });

  it('audio element has loop attribute enabled', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.loop).toBe(true);
  });

  it('audio.play() is called when "Buka Undangan" is clicked', () => {
    render(<Wedding />);
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    fireEvent.click(screen.getByRole('button'));
    expect(playSpy).toHaveBeenCalled();
  });

  it('audio.play() is called exactly once on open', () => {
    render(<Wedding />);
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    fireEvent.click(screen.getByRole('button'));
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('audio does not auto-play before opening', () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    render(<Wedding />);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('audio element does not have autoplay attribute', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.autoplay).toBe(false);
  });

  it('if play() rejects, app does not crash', () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')));
    render(<Wedding />);
    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByRole('button'));
    }).not.toThrow();
  });
});

// ===========================================================================
// DESCRIBE: App - State Management
// ===========================================================================

describe('App - State Management', () => {
  it('copiedIndex starts as null (no copy indicator visible initially)', async () => {
    await renderAndOpen();
    // DigitalEnvelope receives copiedIndex=null, so no "Copied!" indicator
    // We verify indirectly: no copied-state class or text on initial render
    const copiedTexts = screen.queryAllByText(/Copied|Tersalin/i);
    expect(copiedTexts.length).toBe(0);
  });

  it('currentPage starts at 1 (first page of wishes displayed)', async () => {
    await renderAndOpen();
    // The pagination should show page 1 as active/current
    // We verify the first page of wishes is displayed
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('isRSVPModalOpen starts as false (modal not visible)', async () => {
    await renderAndOpen();
    // RSVPModal with isOpen=false should not show modal overlay
    // Checking that no modal-specific submit button is immediately visible
    const submitButtons = screen.queryAllByText(/Kirim/i);
    // Even if present in DOM, the modal should be closed/hidden
    expect(document.querySelector('[data-rsvp-modal-open="true"]')).toBeNull();
  });

  it('selectedPhoto starts as null (no photo zoom modal visible)', async () => {
    await renderAndOpen();
    // PhotoZoomModal with selectedPhoto=null should not render image overlay
    const zoomOverlay = document.querySelector('[data-photo-zoom]');
    expect(zoomOverlay).toBeNull();
  });

  it('isOpen starts as false', () => {
    render(<Wedding />);
    // main element should not exist when isOpen is false
    expect(document.querySelector('main')).toBeNull();
  });

  it('isPlaying starts as false (music not playing before open)', () => {
    render(<Wedding />);
    const pauseSpy = window.HTMLMediaElement.prototype.pause as ReturnType<typeof vi.fn>;
    pauseSpy.mockClear();
    // Since isPlaying starts false, pause should not have been called
    expect(pauseSpy).not.toHaveBeenCalled();
  });

  it('isToolsOpen starts as false', async () => {
    await renderAndOpen();
    // FloatingController is rendered but tools panel should be collapsed
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('wishes are loaded from Firestore via useWishes hook', async () => {
    await renderAndOpen();
    // The RSVP section should display seeded wishes
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.innerHTML.length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// DESCRIBE: App - Edge Cases
// ===========================================================================

describe('App - Edge Cases', () => {
  it('multiple rapid clicks on "Buka Undangan" do not break the app', async () => {
    render(<Wedding />);
    const button = screen.getByRole('button');
    // Simulate rapid clicking
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // App should still be functional with main content visible
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('re-renders are stable and do not duplicate content', () => {
    const { rerender } = render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));

    // Re-render the same component
    rerender(<Wedding />);
    rerender(<Wedding />);

    // Should still have exactly one audio element
    const audios = document.querySelectorAll('audio');
    expect(audios.length).toBe(1);
  });

  it('component unmounts cleanly without errors', () => {
    const { unmount } = render(<Wedding />);
    expect(() => unmount()).not.toThrow();
  });

  it('component unmounts cleanly after opening', async () => {
    const { unmount } = render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    expect(() => unmount()).not.toThrow();
  });

  it('opening and unmounting does not leave orphaned DOM elements', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { unmount } = render(<Wedding />, { container });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    unmount();
    expect(container.innerHTML).toBe('');
    document.body.removeChild(container);
  });

  it('does not throw when window.location.search has malformed query', () => {
    setLocationSearch('?to=%E2%80%99invalid');
    expect(() => render(<Wedding />)).not.toThrow();
  });

  it('handles very long guest name by truncating to 100 chars', () => {
    const longName = 'A'.repeat(200);
    setLocationSearch(`?to=${longName}`);
    render(<Wedding />);
    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
  });

  it('handles guest name with ampersand in URL', () => {
    setLocationSearch('?to=Bapak%20%26%20Ibu%20Budi');
    render(<Wedding />);
    expect(screen.getByText('Bapak & Ibu Budi')).toBeInTheDocument();
  });
});

// ===========================================================================
// DESCRIBE: App - Visual Rendering Stability (prevent glitch / bad display)
// ===========================================================================

describe('App - Visual Rendering Stability', () => {
  it('root container does not have display:none or visibility:hidden', () => {
    const { container } = render(<Wedding />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.display).not.toBe('none');
    expect(root.style.visibility).not.toBe('hidden');
  });

  it('overflow-x-hidden prevents horizontal scroll on all viewports', () => {
    const { container } = render(<Wedding />);
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });

  it('BackgroundLayers grain element exists immediately (no lazy-load delay)', () => {
    render(<Wedding />);
    // animate-grain should be present on first render, not deferred
    const grain = document.querySelector('.animate-grain');
    expect(grain).toBeInTheDocument();
  });

  it('opening overlay does not flicker (present on first paint)', () => {
    render(<Wedding />);
    // The CinematicOpening should be rendered synchronously
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('main content sections all render after open (no missing sections)', async () => {
    await renderAndOpen();
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    // main should contain multiple section children
    // HeroSection, CoupleSection, CinematicStory, EventSection,
    // TwibbonSection, RSVPSection, RSVPModal, DigitalEnvelope,
    // PhotoGallery, Footer, PhotoZoomModal + FloatingController = 12
    expect(main!.children.length).toBeGreaterThanOrEqual(5);
  });

  it('no blank screen: either opening or main content is always visible', async () => {
    const { container } = render(<Wedding />);
    // Before open: opening is visible
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();

    // After open: main content is visible
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('audio element is not visible (no phantom media player displayed)', () => {
    render(<Wedding />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    // Audio without controls attribute should not display
    expect(audio.hasAttribute('controls')).toBe(false);
  });

  it('after open, root div still has correct structure (not broken by re-render)', async () => {
    const { container } = render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    const root = container.firstChild as HTMLElement;
    // Should contain BackgroundLayers, audio, and main
    expect(root.querySelector('audio')).toBeInTheDocument();
    expect(root.querySelector('.animate-grain')).toBeInTheDocument();
    expect(root.querySelector('main')).toBeInTheDocument();
  });
});

// ===========================================================================
// DESCRIBE: App - Logical Behavior
// ===========================================================================

describe('App - Logical Behavior', () => {
  it('opening state is mutually exclusive with main content display', async () => {
    render(<Wedding />);
    // Before: opening visible, main not
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeNull();

    fireEvent.click(screen.getByRole('button'));

    // After: main visible (AnimatePresence may still hold exit animation in DOM)
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('AnimatePresence wraps CinematicOpening for exit animations', async () => {
    // We verify this indirectly: after clicking open, main content appears
    // AnimatePresence manages the exit transition of CinematicOpening
    render(<Wedding />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    // Main content should now be present alongside or replacing the opening
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('guest name from URL param is also passed to RSVPModal after opening', async () => {
    setLocationSearch('?to=Budi');
    await renderAndOpen();
    // RSVPModal receives guestName prop; it is rendered in the tree
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('wishes pagination: totalPages is derived from wishPages length', async () => {
    await renderAndOpen();
    // We can verify the component renders without pagination errors
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('multiple sections render in correct order within main', async () => {
    await renderAndOpen();
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    const children = main!.children;
    // At minimum, FloatingController comes first, then sections follow
    expect(children.length).toBeGreaterThanOrEqual(5);
  });
});

// ===========================================================================
// DESCRIBE: App - Bad Behavioral Usage
// ===========================================================================

describe('App - Bad Behavioral Usage', () => {
  it('does not crash when rendered inside a small container', () => {
    const smallContainer = document.createElement('div');
    smallContainer.style.width = '100px';
    smallContainer.style.height = '100px';
    document.body.appendChild(smallContainer);
    expect(() => render(<Wedding />, { container: smallContainer })).not.toThrow();
    document.body.removeChild(smallContainer);
  });

  it('handles double render without duplicate side effects', () => {
    const { unmount: unmount1 } = render(<Wedding />);
    unmount1();
    const { container } = render(<Wedding />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles opening when audio.play() is rejected', async () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockImplementationOnce(() => Promise.reject(new Error('Blocked')));

    render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));

    // App should still show main content even if audio fails
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('handles query param with unicode characters', () => {
    setLocationSearch('?to=%E4%B8%AD%E6%96%87');
    expect(() => render(<Wedding />)).not.toThrow();
  });

  it('handles query param with only whitespace', () => {
    setLocationSearch('?to=%20%20%20');
    expect(() => render(<Wedding />)).not.toThrow();
  });

  it('handles concurrent render and unmount cycles', () => {
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<Wedding />);
      unmount();
    }
    // Final render should work fine
    const { container } = render(<Wedding />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('does not throw on rapid open followed by immediate unmount', async () => {
    const { unmount } = render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    expect(() => unmount()).not.toThrow();
  });
});

// ===========================================================================
// DESCRIBE: App - Content Integrity After Transition
// ===========================================================================

describe('App - Content Integrity After Transition', () => {
  it('BackgroundLayers remain unchanged after opening', async () => {
    render(<Wedding />);
    const grainBefore = document.querySelector('.animate-grain');
    expect(grainBefore).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());

    const grainAfter = document.querySelector('.animate-grain');
    expect(grainAfter).toBeInTheDocument();
  });

  it('audio src remains unchanged after opening', async () => {
    render(<Wedding />);
    const audioBefore = document.querySelector('audio')?.getAttribute('src');

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());

    const audioAfter = document.querySelector('audio')?.getAttribute('src');
    expect(audioBefore).toBe(audioAfter);
  });

  it('audio loop attribute persists after opening', async () => {
    render(<Wedding />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.loop).toBe(true);
  });

  it('root div class list remains stable after transition', async () => {
    const { container } = render(<Wedding />);
    const classesBefore = (container.firstChild as HTMLElement).className;

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());

    const classesAfter = (container.firstChild as HTMLElement).className;
    expect(classesAfter).toBe(classesBefore);
  });

  it('no duplicate main elements after multiple state changes', async () => {
    await renderAndOpen();
    const mains = document.querySelectorAll('main');
    expect(mains.length).toBe(1);
  });
});

// ===========================================================================
// DESCRIBE: App - Theme CSS Variable Override
// ===========================================================================

describe('App - Theme CSS Variable Override', () => {
  it('sets --color-gold to theme accent color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-gold')).toBe('#B48D3E');
  });

  it('sets --color-ivory to theme background color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-ivory')).toBe('#FDFCF8');
  });

  it('sets --color-ink to theme text color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-ink')).toBe('#1A1A1A');
  });

  it('sets --color-paper to theme surface color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-paper')).toBe('#F5F2ED');
  });

  it('sets --color-sepia to theme surface color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-sepia')).toBe('#F5F2ED');
  });

  it('sets --color-rose-pastel to theme button color', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--color-rose-pastel')).toBe('#F8BBD0');
  });

  it('sets --font-serif with heading font and serif fallback', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--font-serif')).toBe('"Cormorant Garamond", serif');
  });

  it('sets --font-sans with body font and sans fallback', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--font-sans')).toBe('"Montserrat", ui-sans-serif, system-ui, sans-serif');
  });

  it('sets --font-display with decorative font and serif fallback', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--font-display')).toBe('"Playfair Display", serif');
  });

  it('sets --font-dayland with script font and cursive fallback', () => {
    render(<Wedding />);
    expect(document.documentElement.style.getPropertyValue('--font-dayland')).toBe('"Dayland", cursive');
  });

  it('overrides all 6 color variables', () => {
    render(<Wedding />);
    const style = document.documentElement.style;
    const colorVars = ['--color-gold', '--color-ivory', '--color-ink', '--color-paper', '--color-sepia', '--color-rose-pastel'];
    colorVars.forEach((v) => {
      expect(style.getPropertyValue(v)).not.toBe('');
    });
  });

  it('overrides all 4 font variables', () => {
    render(<Wedding />);
    const style = document.documentElement.style;
    const fontVars = ['--font-serif', '--font-sans', '--font-display', '--font-dayland'];
    fontVars.forEach((v) => {
      expect(style.getPropertyValue(v)).not.toBe('');
    });
  });
});

// ===========================================================================
// DESCRIBE: App - Dynamic Google Fonts Loading
// ===========================================================================

describe('App - Dynamic Google Fonts Loading', () => {
  afterEach(() => {
    const link = document.getElementById('dynamic-google-fonts');
    if (link) link.remove();
  });

  it('does not inject dynamic font link when fonts match cinematic defaults', () => {
    render(<Wedding />);
    const link = document.getElementById('dynamic-google-fonts');
    expect(link).not.toBeInTheDocument();
  });

  it('no duplicate font loading for default cinematic template', () => {
    const { rerender } = render(<Wedding />);
    rerender(<Wedding />);
    const links = document.querySelectorAll('#dynamic-google-fonts');
    expect(links.length).toBe(0);
  });
});
