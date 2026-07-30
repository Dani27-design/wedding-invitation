import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Guest, WeddingDocument } from '@/types/firestore';

const guestLibMock = vi.hoisted(() => ({
  addGuest: vi.fn(),
  addGuestsBatch: vi.fn(),
  deleteGuest: vi.fn(),
  getGuestCounts: vi.fn(),
  getGuestPage: vi.fn(),
  getGuests: vi.fn(),
  markInvitationSent: vi.fn(),
  markInvitationUnsent: vi.fn(),
  updateGuest: vi.fn(),
}));

vi.mock('@/lib/guests', () => ({
  addGuest: (...args: unknown[]) => guestLibMock.addGuest(...args),
  addGuestsBatch: (...args: unknown[]) => guestLibMock.addGuestsBatch(...args),
  deleteGuest: (...args: unknown[]) => guestLibMock.deleteGuest(...args),
  getGuestCounts: (...args: unknown[]) => guestLibMock.getGuestCounts(...args),
  getGuestPage: (...args: unknown[]) => guestLibMock.getGuestPage(...args),
  getGuests: (...args: unknown[]) => guestLibMock.getGuests(...args),
  markInvitationSent: (...args: unknown[]) => guestLibMock.markInvitationSent(...args),
  markInvitationUnsent: (...args: unknown[]) => guestLibMock.markInvitationUnsent(...args),
  updateGuest: (...args: unknown[]) => guestLibMock.updateGuest(...args),
}));

vi.mock('./GuestImportModal', () => ({
  GuestImportModal: () => null,
}));

vi.mock('./GuestQRModal', () => ({
  GuestQRModal: () => null,
}));

vi.mock('./GuestQRPrintView', () => ({
  GuestQRPrintView: () => null,
}));

vi.mock('./ConfirmDeleteModal', () => ({
  ConfirmDeleteModal: () => null,
}));

import { GuestListTab } from './GuestListTab';

function timestamp(date = new Date('2026-08-01T10:00:00Z')) {
  return { toDate: () => date } as Guest['createdAt'];
}

function createGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'guest-1',
    name: 'Budi Santoso',
    phone: '6281234567890',
    address: '',
    category: 'pria',
    attendance: false,
    attendanceAt: null,
    invitationSentAt: null,
    invitationSentVia: null,
    createdAt: timestamp(),
    ...overrides,
  };
}

const wedding = {
  greetingTemplate: 'Halo {nama}, buka undangan {pengantin}: {link}',
  groomNickname: 'Dani',
  brideNickname: 'Marini',
} as WeddingDocument;

function mockGuestPage(guests: Guest[]) {
  guestLibMock.getGuestPage.mockResolvedValue({
    guests,
    lastDoc: null,
    hasMore: false,
  });
  guestLibMock.getGuests.mockResolvedValue(guests);
  guestLibMock.getGuestCounts.mockResolvedValue({ pria: guests.filter((g) => g.category === 'pria').length, wanita: guests.filter((g) => g.category === 'wanita').length });
}

describe('GuestListTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    guestLibMock.markInvitationSent.mockResolvedValue(undefined);
    guestLibMock.markInvitationUnsent.mockResolvedValue(undefined);
  });

  it('shows an active WhatsApp button when the guest has a phone number', async () => {
    mockGuestPage([createGuest()]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Budi Santoso');
    const link = screen.getByRole('link', { name: 'Kirim WhatsApp' });

    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/6281234567890?text='));
    expect(decodeURIComponent(link.getAttribute('href')!.split('text=')[1])).toBe(
      'Halo Budi Santoso, buka undangan Dani & Marini: https://marinikah.vercel.app/dani-marini?to=Budi%20Santoso',
    );
  });

  it('shows a disabled WhatsApp action when the guest phone number is missing', async () => {
    mockGuestPage([createGuest({ phone: '' })]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Budi Santoso');

    expect(screen.queryByRole('link', { name: 'Kirim WhatsApp' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nomor HP belum diisi' })).toBeDisabled();
  });

  it('shows the full guest name without truncation styling', async () => {
    const longName = 'Mbak Dianti dan Mas Arfan Amx Keluarga Besar';
    mockGuestPage([createGuest({ name: longName })]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    const name = await screen.findByText(longName);
    expect(name.className).toContain('break-words');
    expect(name.className).not.toContain('truncate');
  });

  it('groups import export and print actions inside the tools menu', async () => {
    mockGuestPage([createGuest()]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Budi Santoso');
    expect(screen.queryByText('Daftar Tamu')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Cari tamu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tambah tamu' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tools tamu' }));

    expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print QR/i })).toBeInTheDocument();
  });

  it('marks an invitation as sent from the guest row', async () => {
    mockGuestPage([createGuest()]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Budi Santoso');
    fireEvent.click(screen.getByRole('button', { name: 'Tandai undangan terkirim' }));

    await waitFor(() => {
      expect(guestLibMock.markInvitationSent).toHaveBeenCalledWith('dani-marini', 'guest-1', 'manual');
    });
  });

  it('shows sent status and allows the admin to clear it', async () => {
    mockGuestPage([createGuest({
      invitationSentAt: timestamp(),
      invitationSentVia: 'manual',
    })]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByRole('button', { name: 'Batalkan tanda terkirim' });
    fireEvent.click(screen.getByRole('button', { name: 'Batalkan tanda terkirim' }));

    await waitFor(() => {
      expect(guestLibMock.markInvitationUnsent).toHaveBeenCalledWith('dani-marini', 'guest-1');
    });
  });

  it('keeps secondary guest actions available from the guest action menu', async () => {
    mockGuestPage([createGuest()]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Budi Santoso');
    fireEvent.click(screen.getByRole('button', { name: 'Aksi tamu Budi Santoso' }));

    expect(screen.getByRole('button', { name: 'QR Code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit tamu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hapus tamu' })).toBeInTheDocument();
  });

  it('filters guests by unsent invitation status', async () => {
    const sentGuest = createGuest({
      id: 'guest-sent',
      name: 'Tamu Terkirim',
      invitationSentAt: timestamp(),
      invitationSentVia: 'manual',
    });
    const unsentGuest = createGuest({
      id: 'guest-unsent',
      name: 'Tamu Belum',
      invitationSentAt: null,
      invitationSentVia: null,
    });
    mockGuestPage([sentGuest, unsentGuest]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Tamu Terkirim');
    fireEvent.click(screen.getByRole('button', { name: 'Filter status kirim' }));
    fireEvent.click(screen.getByRole('button', { name: 'Belum Dikirim' }));

    await waitFor(() => {
      expect(screen.getByText('Tamu Belum')).toBeInTheDocument();
      expect(screen.queryByText('Tamu Terkirim')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Filter status kirim' })).toHaveTextContent('Belum Dikirim');
  });

  it('keeps active filters when page size changes', async () => {
    const sentGuest = createGuest({
      id: 'guest-sent',
      name: 'Tamu Terkirim',
      invitationSentAt: timestamp(),
      invitationSentVia: 'manual',
    });
    const unsentGuest = createGuest({
      id: 'guest-unsent',
      name: 'Tamu Belum',
      invitationSentAt: null,
      invitationSentVia: null,
    });
    mockGuestPage([sentGuest, unsentGuest]);

    render(<GuestListTab slug="dani-marini" wedding={wedding} />);

    await screen.findByText('Tamu Terkirim');
    fireEvent.click(screen.getByRole('button', { name: 'Filter status kirim' }));
    fireEvent.click(screen.getByRole('button', { name: 'Belum Dikirim' }));

    await waitFor(() => {
      expect(screen.getByText('Tamu Belum')).toBeInTheDocument();
      expect(screen.queryByText('Tamu Terkirim')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Jumlah per halaman' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));

    await waitFor(() => {
      expect(screen.getByText('5 / hal')).toBeInTheDocument();
      expect(screen.getByText('Tamu Belum')).toBeInTheDocument();
      expect(screen.queryByText('Tamu Terkirim')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Filter status kirim' })).toHaveTextContent('Belum Dikirim');
  });
});
