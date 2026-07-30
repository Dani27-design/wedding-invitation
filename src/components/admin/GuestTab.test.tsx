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
  it('renders descriptive variables as atomic editor chips', () => {
    const { container } = render(<GuestTab data={createWedding({ greetingTemplate: 'Halo {nama}\nBuka {link}' })} slug="dani-marini" onSave={vi.fn()} />);

    expect(screen.getByText('Pesan Undangan WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Sisipkan Data Otomatis')).toBeInTheDocument();
    expect(screen.getByText('Nama Contoh untuk Preview')).toBeInTheDocument();
    expect(screen.getByText(/Nama tamu asli tetap diambil dari menu Tamu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: Mas Raju')).toBeInTheDocument();
    expect(screen.queryByText('Nama Tamu Default')).not.toBeInTheDocument();
    const editor = screen.getByRole('textbox', { name: 'Template pesan undangan' });
    expect(editor).toHaveTextContent('Halo Nama tamu');
    expect(editor).toHaveTextContent('Buka Link undangan');

    const nameToken = container.querySelector('[data-variable-key="nama tamu"]');
    const linkToken = container.querySelector('[data-variable-key="link undangan"]');
    expect(nameToken).toBeInTheDocument();
    expect(nameToken).toHaveTextContent('Nama tamu');
    expect(nameToken).toHaveAttribute('contenteditable', 'false');
    expect(nameToken?.className).toContain('rounded-full');
    expect(nameToken?.className).toContain('bg-gold/10');
    expect(linkToken).toBeInTheDocument();
  });

  it('uses native contenteditable text rendering for caret precision', () => {
    const { container } = render(<GuestTab data={createWedding({ greetingTemplate: 'Halo {nama tamu}' })} slug="dani-marini" onSave={vi.fn()} />);

    const editor = screen.getByRole('textbox', { name: 'Template pesan undangan' });
    expect(editor.className).toContain('text-ink');
    expect(editor.className).not.toContain('text-transparent');

    expect(container.querySelector('[data-lexical-editor="true"]')).toBe(editor);
    expect(container.querySelector('[data-variable-key="nama tamu"]')).toHaveAttribute('contenteditable', 'false');
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
    const { container } = render(<GuestTab data={createWedding()} slug="dani-marini" onSave={onSave} />);

    fireEvent.click(screen.getByText('Akad Nikah'));
    fireEvent.click(screen.getByRole('button', { name: 'Nama Akad Nikah' }));
    await waitFor(() => {
      expect(container.querySelector('[data-variable-key="nama acara 1"]')).toBeInTheDocument();
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0][0].greetingTemplate).toContain('{nama acara 1}');
  });

  it('inserts a variable once without duplicating template text', async () => {
    const onSave = vi.fn();
    const { container } = render(<GuestTab data={createWedding()} slug="dani-marini" onSave={onSave} />);

    const editor = screen.getByRole('textbox', { name: 'Template pesan undangan' });
    fireEvent.focus(editor);
    fireEvent.click(screen.getByRole('button', { name: 'Nama tamu' }));
    await waitFor(() => {
      expect(container.querySelectorAll('[data-variable-key="nama tamu"]').length).toBe(2);
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });

    const saved = onSave.mock.calls[0][0].greetingTemplate as string;
    expect(saved.match(/\{nama tamu\}/g)?.length).toBe(2);
    expect(saved).not.toContain('NAMA TAMU');
  });

  it('shows a preview using wedding and ceremony data', () => {
    render(<GuestTab data={createWedding()} slug="dani-marini" onSave={vi.fn()} />);

    const previewToggle = screen.getByText('Lihat Contoh Pesan');
    const sampleNameHeading = screen.getByText('Nama Contoh untuk Preview');
    expect(previewToggle.compareDocumentPosition(sampleNameHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(previewToggle);

    expect(screen.getByText('Contoh untuk: Mas Raju')).toBeInTheDocument();
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
      expect(screen.getByText(/Ada format data otomatis yang rusak/i)).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('blocks saving when the template editor content is empty', async () => {
    const onSave = vi.fn();
    render(<GuestTab data={createWedding({ greetingTemplate: '' })} slug="dani-marini" onSave={onSave} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Simpan & Lanjutkan' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Data wajib belum dimasukkan/i)).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });
});
