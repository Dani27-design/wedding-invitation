import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

vi.mock('@/components/ui/TestimonialSection', () => ({
  TestimonialSection: () => <section data-testid="testimonial-section" />,
}));

describe('LandingPage', () => {
  it('renders the feature group headings', () => {
    render(<LandingPage />);

    expect(screen.getByText('Pengalaman Tamu')).toBeInTheDocument();
    expect(screen.getByText('Pengelolaan Undangan')).toBeInTheDocument();
  });

  it('uses mobile marquee tracks for feature groups', () => {
    const { container } = render(<LandingPage />);

    const guestTrack = container.querySelector('[data-feature-marquee="Pengalaman Tamu"]');
    const adminTrack = container.querySelector('[data-feature-marquee="Pengelolaan Undangan"]');

    expect(guestTrack).toBeInTheDocument();
    expect(guestTrack?.className).toContain('animate-feature-marquee-left');
    expect(adminTrack).toBeInTheDocument();
    expect(adminTrack?.className).toContain('animate-feature-marquee-right');
  });

  it('hides duplicated mobile marquee content from assistive technology', () => {
    const { container } = render(<LandingPage />);
    const duplicateSets = container.querySelectorAll('[data-feature-marquee-duplicate="true"]');

    expect(duplicateSets).toHaveLength(2);
    duplicateSets.forEach((set) => {
      expect(set).toHaveAttribute('aria-hidden', 'true');
    });
    expect(duplicateSets[0]).toHaveTextContent('Musik latar yang menyatu dengan suasana');
    expect(duplicateSets[1]).toHaveTextContent('Kelola data pasangan dan galeri foto');
  });

  it('keeps the desktop feature grids available from the small breakpoint upward', () => {
    const { container } = render(<LandingPage />);
    const desktopGrids = container.querySelectorAll('.hidden.sm\\:grid');

    expect(desktopGrids).toHaveLength(2);
    desktopGrids.forEach((grid) => {
      expect(grid.className).toContain('sm:grid-cols-4');
      expect(grid.className).toContain('lg:grid-cols-6');
    });
  });
});
