import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { WeddingDocument } from '@/types/firestore';
import { GuestTab } from './GuestTab';

function createWedding(overrides: Partial<WeddingDocument> = {}): WeddingDocument {
  return {
    adminIds: [],
    status: 'draft',
    createdAt: {} as WeddingDocument['createdAt'],
    updatedAt: {} as WeddingDocument['updatedAt'],
    groomNickname: 'Dani',
    groomName: 'Daniansyah C.',
    groomParents: 'Putra Bapak Ahmad dan Ibu Aminah',
    groomPhoto: '',
    groomSocialLinks: [],
    brideNickname: 'Marini',
    brideName: 'Siti Nur Marini',
    brideParents: 'Putri Bapak Budi dan Ibu Sari',
    bridePhoto: '',
    brideSocialLinks: [],
    defaultGuest: 'Mas Raju',
    eventDate: '2026-09-18',
    eventCity: 'Surabaya',
    ceremonies: [{
      name: 'Akad Nikah',
      date: '2026-09-18',
      start: '08:00',
      end: '09:00',
      venueName: 'Masjid Agung',
      venueAddress: 'Jl. Bahagia No. 1',
      venueMapsUrl: 'https://maps.example/akad',
    }],
    story: [],
    gallery: [],
    giftAccounts: [],
    musicUrl: '',
    twibbonOverlay: '',
    heroImage: '',
    openingImage: '',
    quranArabic: '',
    quranTranslation: '',
    quranReference: '',
    theme: {
      template: 'classic',
      colors: { accent: '#b8944d', background: '#fff', text: '#222', surface: '#fff', button: '#b8944d' },
      fonts: { heading: '', body: '', decorative: '', script: '' },
    },
    credits: [],
    footerText: '',
    greetingTemplate: [
      '{nama tamu}',
      '{link undangan}',
      '{nama pengantin pria}',
      '{nama pengantin wanita}',
      '{orang tua pengantin pria}',
      '{orang tua pengantin wanita}',
      '{tanggal acara 1}',
      '{lokasi acara 1}',
    ].join('\n'),
    ...overrides,
  };
}

describe('GuestTab', () => {
  it('renders descriptive variables as atomic editor tokens', () => {
    render(<GuestTab data={createWedding({ greetingTemplate: 'Halo {nama}\nBuka {link}' })} slug="dani-marini" onSave={vi.fn()} />);

    const editor = screen.getByRole('textbox', { name: 'Template pesan undangan' });
    expect(editor.querySelector('[data-variable-key="nama tamu"]')).toBeInTheDocument();
    expect(editor.querySelector('[data-variable-key="link undangan"]')).toBeInTheDocument();
    expect(editor.querySelector('[data-variable-key="nama"]')).not.toBeInTheDocument();
  });

  it('saves a valid template with descriptive placeholders', () => {
    const onSave = vi.fn();
    render(<GuestTab data={createWedding()} slug="dani-marini" onSave={onSave} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      defaultGuest: 'Mas Raju',
      greetingTemplate: expect.stringContaining('{nama tamu}'),
    }));
    expect(onSave.mock.calls[0][0].greetingTemplate).toContain('{link undangan}');
  });

  it('inserts dynamic ceremony variables from the variable picker', async () => {
    const onSave = vi.fn();
    render(<GuestTab data={createWedding()} slug="dani-marini" onSave={onSave} />);

    fireEvent.click(screen.getByText('Akad Nikah'));
    fireEvent.click(screen.getByRole('button', { name: 'Nama Akad Nikah' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0][0].greetingTemplate).toContain('{nama acara 1}');
  });

  it('shows a preview using wedding and ceremony data', () => {
    render(<GuestTab data={createWedding()} slug="dani-marini" onSave={vi.fn()} />);

    fireEvent.click(screen.getByText('Contoh Pesan dari Tab Tamu'));

    expect(screen.getByText('Untuk: Mas Raju')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Daniansyah C.'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Siti Nur Marini'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('18 September 2026'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Masjid Agung'))).toBeInTheDocument();
  });

  it('blocks saving when a placeholder is broken', async () => {
    const onSave = vi.fn();
    render(<GuestTab data={createWedding({ greetingTemplate: 'Halo {namaa' })} slug="dani-marini" onSave={onSave} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Placeholder belum utuh/i)).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });
});
