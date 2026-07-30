import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { isTwibbonAspectRatioValid, MediaForm } from './MediaForm';

describe('MediaForm twibbon upload guidance', () => {
  it('accepts 9:16 twibbon dimensions', () => {
    expect(isTwibbonAspectRatioValid(1080, 1920)).toBe(true);
    expect(isTwibbonAspectRatioValid(900, 1600)).toBe(true);
  });

  it('rejects non-9:16 twibbon dimensions', () => {
    expect(isTwibbonAspectRatioValid(1000, 1000)).toBe(false);
    expect(isTwibbonAspectRatioValid(1920, 1080)).toBe(false);
    expect(isTwibbonAspectRatioValid(0, 1920)).toBe(false);
  });

  it('shows the expected twibbon ratio guidance', () => {
    render(<MediaForm data={null} onSave={vi.fn()} />);

    expect(screen.getByText('Gunakan PNG transparan atau JPG rasio 9:16. Rekomendasi 1080x1920.')).toBeInTheDocument();
    expect(document.querySelector('input[accept="image/png,image/jpeg"]')).toBeInTheDocument();
  });
});
