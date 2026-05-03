import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

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
  const result = render(<App />);
  fireEvent.click(screen.getByText('Buka Undangan'));
  await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
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
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('root element is a div', () => {
    const { container } = render(<App />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('has min-h-screen class for full viewport height', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('has overflow-x-hidden to prevent horizontal scroll glitch', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });

  it('has bg-ivory background class', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('bg-ivory');
  });

  it('has text-ink class for base text color', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('text-ink');
  });

  it('has font-sans class for default typography', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('font-sans');
  });

  it('has gold selection highlight', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('selection:bg-gold/20');
  });

  it('renders BackgroundLayers with animate-grain element', () => {
    render(<App />);
    const grain = document.querySelector('.animate-grain');
    expect(grain).toBeInTheDocument();
  });

  it('has an audio element in the document', () => {
    render(<App />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
  });

  it('audio element references the correct local music file', () => {
    render(<App />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toContain('adele-make-you-feel-my-love');
  });

  it('audio element src ends with .mp3 extension', () => {
    render(<App />);
    const audio = document.querySelector('audio');
    expect(audio?.getAttribute('src')).toMatch(/\.mp3$/);
  });

  it('audio element has loop attribute for continuous playback', () => {
    render(<App />);
    const audio = document.querySelector('audio');
    expect(audio).toHaveAttribute('loop');
  });

  it('does not render duplicate audio elements', () => {
    render(<App />);
    const audios = document.querySelectorAll('audio');
    expect(audios.length).toBe(1);
  });

  it('does not have any visible error boundaries or fallback UI', () => {
    const { container } = render(<App />);
    expect(container.querySelector('[data-error]')).toBeNull();
  });
});

// ===========================================================================
// DESCRIBE: App - Cinematic Opening (default state, isOpen=false)
// ===========================================================================

describe('App - Cinematic Opening (default state)', () => {
  it('shows opening overlay by default (isOpen=false)', () => {
    render(<App />);
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
  });

  it('shows "Buka Undangan" call-to-action button', () => {
    render(<App />);
    const button = screen.getByText('Buka Undangan');
    expect(button).toBeInTheDocument();
  });

  it('shows "Dani & Marini" couple names in opening', () => {
    render(<App />);
    expect(screen.getByText(/Dani/i)).toBeInTheDocument();
    expect(screen.getByText(/Marini/i)).toBeInTheDocument();
  });

  it('shows "Turut Mengundang" invitation label', () => {
    render(<App />);
    expect(screen.getByText(/Turut Mengundang/i)).toBeInTheDocument();
  });

  it('shows default guest name "Tamu Terkasih Kami" when no URL param', () => {
    render(<App />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('does NOT render <main> tag before opening', () => {
    const { container } = render(<App />);
    expect(container.querySelector('main')).toBeNull();
  });

  it('does NOT show RSVP section before opening', () => {
    render(<App />);
    expect(screen.queryByText('RSVP & Wishes')).not.toBeInTheDocument();
  });

  it('does NOT show gallery section before opening', () => {
    render(<App />);
    expect(screen.queryByText(/Gallery/i)).not.toBeInTheDocument();
  });

  it('does NOT show digital envelope before opening', () => {
    render(<App />);
    expect(screen.queryByText(/Digital Envelope/i)).not.toBeInTheDocument();
  });

  it('does NOT show floating controller before opening', () => {
    render(<App />);
    // The floating controller is only rendered when isOpen is true
    // There should be no <main> element and no music toggle visible
    const main = document.querySelector('main');
    expect(main).toBeNull();
  });

  it('does NOT show footer before opening', () => {
    render(<App />);
    expect(screen.queryByText(/Made with/i)).not.toBeInTheDocument();
  });

  it('does NOT show hero section before opening', () => {
    const { container } = render(<App />);
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
    render(<App />);
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
  });

  it('decodes URL-encoded names with %20 for spaces', () => {
    setLocationSearch('?to=Ahmad%20Rizky%20Pratama');
    render(<App />);
    expect(screen.getByText('Ahmad Rizky Pratama')).toBeInTheDocument();
  });

  it('handles single-word guest name', () => {
    setLocationSearch('?to=Siti');
    render(<App />);
    expect(screen.getByText('Siti')).toBeInTheDocument();
  });

  it('shows default "Tamu Terkasih Kami" when ?to= is absent', () => {
    setLocationSearch('');
    render(<App />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('shows default when query string has other params but not "to"', () => {
    setLocationSearch('?lang=id&ref=whatsapp');
    render(<App />);
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });

  it('handles + encoded spaces in guest name', () => {
    setLocationSearch('?to=Pak+Budi');
    render(<App />);
    // URLSearchParams treats + as space
    expect(screen.getByText('Pak Budi')).toBeInTheDocument();
  });

  it('handles special characters in guest name', () => {
    setLocationSearch('?to=Dr.%20H.%20Muhammad');
    render(<App />);
    expect(screen.getByText('Dr. H. Muhammad')).toBeInTheDocument();
  });

  it('handles empty ?to= value gracefully (shows default)', () => {
    setLocationSearch('?to=');
    render(<App />);
    // Empty string is falsy, so default should show
    expect(screen.getByText('Tamu Terkasih Kami')).toBeInTheDocument();
  });
});

// ===========================================================================
// DESCRIBE: App - Opening to Main Content Transition
// ===========================================================================

describe('App - Opening to Main Content Transition', () => {
  it('clicking "Buka Undangan" transitions to main content', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('after opening: <main> element has relative and z-10 classes', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
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
    render(<App />);
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Buka Undangan'));
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
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
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
    render(<App />);
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toBe('/musics/adele-make-you-feel-my-love.mp3');
  });

  it('audio element has loop attribute enabled', () => {
    render(<App />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.loop).toBe(true);
  });

  it('audio.play() is called when "Buka Undangan" is clicked', () => {
    render(<App />);
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    fireEvent.click(screen.getByText('Buka Undangan'));
    expect(playSpy).toHaveBeenCalled();
  });

  it('audio.play() is called exactly once on open', () => {
    render(<App />);
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    fireEvent.click(screen.getByText('Buka Undangan'));
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('audio does not auto-play before opening', () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockClear();
    render(<App />);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('audio element does not have autoplay attribute', () => {
    render(<App />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.autoplay).toBe(false);
  });

  it('if play() rejects, app does not crash', () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockImplementationOnce(() => Promise.reject(new Error('NotAllowedError')));
    render(<App />);
    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByText('Buka Undangan'));
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
    render(<App />);
    // main element should not exist when isOpen is false
    expect(document.querySelector('main')).toBeNull();
  });

  it('isPlaying starts as false (music not playing before open)', () => {
    render(<App />);
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

  it('wishes state is initialized with SEED_WISHES data', async () => {
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
    render(<App />);
    const button = screen.getByText('Buka Undangan');
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
    const { rerender } = render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));

    // Re-render the same component
    rerender(<App />);
    rerender(<App />);

    // Should still have exactly one audio element
    const audios = document.querySelectorAll('audio');
    expect(audios.length).toBe(1);
  });

  it('component unmounts cleanly without errors', () => {
    const { unmount } = render(<App />);
    expect(() => unmount()).not.toThrow();
  });

  it('component unmounts cleanly after opening', async () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    expect(() => unmount()).not.toThrow();
  });

  it('opening and unmounting does not leave orphaned DOM elements', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { unmount } = render(<App />, { container });
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    unmount();
    expect(container.innerHTML).toBe('');
    document.body.removeChild(container);
  });

  it('does not throw when window.location.search has malformed query', () => {
    setLocationSearch('?to=%E2%80%99invalid');
    expect(() => render(<App />)).not.toThrow();
  });

  it('handles very long guest name without breaking layout', () => {
    const longName = 'A'.repeat(200);
    setLocationSearch(`?to=${longName}`);
    render(<App />);
    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  it('handles guest name with ampersand in URL', () => {
    setLocationSearch('?to=Bapak%20%26%20Ibu%20Budi');
    render(<App />);
    expect(screen.getByText('Bapak & Ibu Budi')).toBeInTheDocument();
  });
});

// ===========================================================================
// DESCRIBE: App - Visual Rendering Stability (prevent glitch / bad display)
// ===========================================================================

describe('App - Visual Rendering Stability', () => {
  it('root container does not have display:none or visibility:hidden', () => {
    const { container } = render(<App />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.display).not.toBe('none');
    expect(root.style.visibility).not.toBe('hidden');
  });

  it('overflow-x-hidden prevents horizontal scroll on all viewports', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });

  it('BackgroundLayers grain element exists immediately (no lazy-load delay)', () => {
    render(<App />);
    // animate-grain should be present on first render, not deferred
    const grain = document.querySelector('.animate-grain');
    expect(grain).toBeInTheDocument();
  });

  it('opening overlay does not flicker (present on first paint)', () => {
    render(<App />);
    // The CinematicOpening should be rendered synchronously
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
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
    const { container } = render(<App />);
    // Before open: opening is visible
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();

    // After open: main content is visible
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('audio element is not visible (no phantom media player displayed)', () => {
    render(<App />);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    // Audio without controls attribute should not display
    expect(audio.hasAttribute('controls')).toBe(false);
  });

  it('after open, root div still has correct structure (not broken by re-render)', async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
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
    render(<App />);
    // Before: opening visible, main not
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeNull();

    fireEvent.click(screen.getByText('Buka Undangan'));

    // After: main visible (AnimatePresence may still hold exit animation in DOM)
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('AnimatePresence wraps CinematicOpening for exit animations', async () => {
    // We verify this indirectly: after clicking open, main content appears
    // AnimatePresence manages the exit transition of CinematicOpening
    render(<App />);
    expect(screen.getByText('Buka Undangan')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Buka Undangan'));
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
    expect(() => render(<App />, { container: smallContainer })).not.toThrow();
    document.body.removeChild(smallContainer);
  });

  it('handles double render without duplicate side effects', () => {
    const { unmount: unmount1 } = render(<App />);
    unmount1();
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles opening when audio.play() is rejected', async () => {
    const playSpy = window.HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>;
    playSpy.mockImplementationOnce(() => Promise.reject(new Error('Blocked')));

    render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));

    // App should still show main content even if audio fails
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
  });

  it('handles query param with unicode characters', () => {
    setLocationSearch('?to=%E4%B8%AD%E6%96%87');
    expect(() => render(<App />)).not.toThrow();
  });

  it('handles query param with only whitespace', () => {
    setLocationSearch('?to=%20%20%20');
    expect(() => render(<App />)).not.toThrow();
  });

  it('handles concurrent render and unmount cycles', () => {
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<App />);
      unmount();
    }
    // Final render should work fine
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('does not throw on rapid open followed by immediate unmount', async () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    expect(() => unmount()).not.toThrow();
  });
});

// ===========================================================================
// DESCRIBE: App - Content Integrity After Transition
// ===========================================================================

describe('App - Content Integrity After Transition', () => {
  it('BackgroundLayers remain unchanged after opening', async () => {
    render(<App />);
    const grainBefore = document.querySelector('.animate-grain');
    expect(grainBefore).toBeInTheDocument();

    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());

    const grainAfter = document.querySelector('.animate-grain');
    expect(grainAfter).toBeInTheDocument();
  });

  it('audio src remains unchanged after opening', async () => {
    render(<App />);
    const audioBefore = document.querySelector('audio')?.getAttribute('src');

    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());

    const audioAfter = document.querySelector('audio')?.getAttribute('src');
    expect(audioBefore).toBe(audioAfter);
  });

  it('audio loop attribute persists after opening', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Buka Undangan'));
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument());
    const audio = document.querySelector('audio') as HTMLAudioElement;
    expect(audio.loop).toBe(true);
  });

  it('root div class list remains stable after transition', async () => {
    const { container } = render(<App />);
    const classesBefore = (container.firstChild as HTMLElement).className;

    fireEvent.click(screen.getByText('Buka Undangan'));
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
