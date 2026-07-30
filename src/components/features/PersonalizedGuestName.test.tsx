import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigationMock = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => navigationMock.searchParams,
}));

import { PersonalizedGuestName } from './PersonalizedGuestName';

describe('PersonalizedGuestName', () => {
  afterEach(() => {
    navigationMock.searchParams = new URLSearchParams();
  });

  it('publishes a personalized guest name from the to query parameter', async () => {
    const onGuestNameChange = vi.fn();
    navigationMock.searchParams = new URLSearchParams('to=Mbak%20Dianti%20dan%20Mas%20Raju');

    render(
      <PersonalizedGuestName
        fallbackGuestName="Tamu Spesial Kami"
        onGuestNameChange={onGuestNameChange}
      />,
    );

    await waitFor(() => {
      expect(onGuestNameChange).toHaveBeenCalledWith('Mbak Dianti dan Mas Raju');
    });
  });

  it('keeps the fallback guest name when the to query parameter is missing', async () => {
    const onGuestNameChange = vi.fn();

    render(
      <PersonalizedGuestName
        fallbackGuestName="Tamu Spesial Kami"
        onGuestNameChange={onGuestNameChange}
      />,
    );

    await waitFor(() => {
      expect(onGuestNameChange).toHaveBeenCalledWith('Tamu Spesial Kami');
    });
  });
});
