import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoupleForm } from './CoupleForm';
import { WeddingDocument } from '../../types/firestore';

vi.mock('../../utils/compressImage', () => ({
  compressImage: vi.fn().mockResolvedValue({ file: new File([''], 'compressed.jpg'), wasCompressed: false, originalSize: 1000, compressedSize: 1000 }),
  formatFileSize: vi.fn((s: number) => `${s}B`),
}));

vi.mock('./CompressionModal', () => ({
  CompressionModal: () => null,
}));

const mockData: Partial<WeddingDocument> = {
  groomNickname: 'Dani',
  groomName: 'Dani Chusyaini',
  groomParents: 'Putra Bapak Ahmad',
  groomPhoto: 'https://example.com/groom.jpg',
  groomSocialLinks: [{ label: 'Instagram', url: 'https://instagram.com/dani' }],
  brideNickname: 'Marini',
  brideName: 'Marini Safitri',
  brideParents: 'Putri Bapak Budi',
  bridePhoto: 'https://example.com/bride.jpg',
  brideSocialLinks: [],
};

describe('CoupleForm', () => {
  let onSave: ReturnType<typeof vi.fn>;
  let onDirty: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn();
    onDirty = vi.fn();
  });

  // ---------------------------------------------------------------------------
  // 1. Basic rendering
  // ---------------------------------------------------------------------------
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a form element', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('renders without console errors', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<CoupleForm data={null} onSave={onSave} />);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Card-based layout
  // ---------------------------------------------------------------------------
  describe('card layout', () => {
    it('renders groom section description', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      expect(screen.getByText('Informasi Pengantin Pria')).toBeInTheDocument();
    });

    it('renders bride section description', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      expect(screen.getByText('Informasi Pengantin Wanita')).toBeInTheDocument();
    });

    it('renders cards with left accent border', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      const accents = container.querySelectorAll('.border-l-4');
      expect(accents.length).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Field labels
  // ---------------------------------------------------------------------------
  describe('field labels', () => {
    it('renders persistent labels for nickname fields', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const labels = screen.getAllByText(/Nama Panggilan/);
      expect(labels.length).toBe(2);
    });

    it('renders persistent labels for full name fields', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const labels = screen.getAllByText(/Nama Lengkap \+ Gelar/);
      expect(labels.length).toBe(2);
    });

    it('renders persistent labels for parents fields', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const labels = screen.getAllByText(/Putra\/Putri dari/);
      expect(labels.length).toBe(2);
    });

    it('renders required indicator (*) on nickname fields', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      const requiredMarks = container.querySelectorAll('.text-red-400');
      expect(requiredMarks.length).toBeGreaterThanOrEqual(6);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Data population
  // ---------------------------------------------------------------------------
  describe('data population', () => {
    it('populates groom nickname from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Dani')).toBeInTheDocument();
    });

    it('populates groom full name from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Dani Chusyaini')).toBeInTheDocument();
    });

    it('populates groom parents from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Putra Bapak Ahmad')).toBeInTheDocument();
    });

    it('populates bride nickname from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Marini')).toBeInTheDocument();
    });

    it('populates bride full name from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Marini Safitri')).toBeInTheDocument();
    });

    it('populates bride parents from data', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('Putri Bapak Budi')).toBeInTheDocument();
    });

    it('renders groom photo preview', () => {
      const { container } = render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      const imgs = container.querySelectorAll('img');
      const groomImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/groom.jpg');
      expect(groomImg).toBeTruthy();
    });

    it('renders bride photo preview', () => {
      const { container } = render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      const imgs = container.querySelectorAll('img');
      const brideImg = Array.from(imgs).find(img => img.getAttribute('src') === 'https://example.com/bride.jpg');
      expect(brideImg).toBeTruthy();
    });

    it('renders existing social links', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByDisplayValue('https://instagram.com/dani')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Empty state (null data)
  // ---------------------------------------------------------------------------
  describe('empty state', () => {
    it('renders empty inputs when data is null', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect((input as HTMLInputElement).value).toBe('');
      });
    });

    it('renders upload placeholder when no photo', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      const imgs = container.querySelectorAll('img');
      expect(imgs.length).toBe(0);
    });

    it('renders "Ubah Foto" buttons', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const buttons = screen.getAllByText('Ubah Foto');
      expect(buttons.length).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Dirty tracking
  // ---------------------------------------------------------------------------
  describe('dirty tracking', () => {
    it('calls onDirty when nickname changes', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} onDirty={onDirty} />);
      fireEvent.change(screen.getByDisplayValue('Dani'), { target: { value: 'Daniel' } });
      expect(onDirty).toHaveBeenCalled();
    });

    it('calls onDirty when full name changes', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} onDirty={onDirty} />);
      fireEvent.change(screen.getByDisplayValue('Dani Chusyaini'), { target: { value: 'Dani C.' } });
      expect(onDirty).toHaveBeenCalled();
    });

    it('calls onDirty when parents changes', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} onDirty={onDirty} />);
      fireEvent.change(screen.getByDisplayValue('Putra Bapak Ahmad'), { target: { value: 'Putra Bapak Ali' } });
      expect(onDirty).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Social links
  // ---------------------------------------------------------------------------
  describe('social links', () => {
    it('renders "Tambah Tautan" button for both sides', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const addButtons = screen.getAllByText(/Tambah Tautan/);
      expect(addButtons.length).toBe(2);
    });

    it('adds a social link when "Tambah Tautan" is clicked', () => {
      render(<CoupleForm data={null} onSave={onSave} onDirty={onDirty} />);
      const addButtons = screen.getAllByText(/Tambah Tautan/);
      fireEvent.click(addButtons[0]);
      expect(screen.getByText('Pilih Platform')).toBeInTheDocument();
      expect(onDirty).toHaveBeenCalled();
    });

    it('renders delete button for existing social link', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      expect(screen.getByLabelText('Hapus tautan')).toBeInTheDocument();
    });

    it('removes a social link when delete is clicked', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} onDirty={onDirty} />);
      fireEvent.click(screen.getByLabelText('Hapus tautan'));
      expect(screen.queryByDisplayValue('https://instagram.com/dani')).toBeNull();
      expect(onDirty).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Submit button
  // ---------------------------------------------------------------------------
  describe('submit button', () => {
    it('renders submit button with "Simpan & Lanjutkan" text', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      expect(screen.getByText('Simpan & Lanjutkan')).toBeInTheDocument();
    });

    it('shows "Menyimpan..." when isSaving is true', () => {
      render(<CoupleForm data={null} onSave={onSave} isSaving />);
      expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    });

    it('disables submit button when isSaving', () => {
      render(<CoupleForm data={null} onSave={onSave} isSaving />);
      expect(screen.getByText('Menyimpan...')).toBeDisabled();
    });

    it('calls onSave on form submit', () => {
      render(<CoupleForm data={mockData as WeddingDocument} onSave={onSave} />);
      fireEvent.submit(screen.getByText('Simpan & Lanjutkan').closest('form')!);
      expect(onSave).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Photo upload
  // ---------------------------------------------------------------------------
  describe('photo upload', () => {
    it('renders file inputs for both groom and bride', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      const fileInputs = container.querySelectorAll('input[type="file"]');
      // 2 per side (one on avatar, one on "Ubah Foto" button)
      expect(fileInputs.length).toBe(4);
    });

    it('shows error for oversized file', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      const { container } = render(<CoupleForm data={null} onSave={onSave} />);
      const fileInput = container.querySelectorAll('input[type="file"]')[0];
      const bigFile = new File(['x'.repeat(26 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
      Object.defineProperty(bigFile, 'size', { value: 26 * 1024 * 1024 });
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(screen.getAllByText('Ukuran foto maksimal 25MB').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Validation
  // ---------------------------------------------------------------------------
  describe('validation', () => {
    it('shows error for invalid social link URL', async () => {
      const data = {
        ...mockData,
        groomSocialLinks: [{ label: 'Instagram', url: 'not-a-url' }],
      } as WeddingDocument;
      render(<CoupleForm data={data} onSave={onSave} />);
      fireEvent.submit(screen.getByText('Simpan & Lanjutkan').closest('form')!);
      expect(await screen.findByText(/tidak valid/)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('shows error for invalid WhatsApp number', async () => {
      const data = {
        ...mockData,
        groomSocialLinks: [{ label: 'WhatsApp', url: 'abc' }],
      } as WeddingDocument;
      render(<CoupleForm data={data} onSave={onSave} />);
      fireEvent.submit(screen.getByText('Simpan & Lanjutkan').closest('form')!);
      expect(await screen.findByText(/tidak valid/)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Progress bar
  // ---------------------------------------------------------------------------
  describe('progress bar', () => {
    it('renders progress bar when step and totalSteps are provided', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={0} totalSteps={9} />);
      const bar = container.querySelector('.rounded-full.transition-all');
      expect(bar).toBeInTheDocument();
    });

    it('shows correct step text', () => {
      render(<CoupleForm data={null} onSave={onSave} step={0} totalSteps={9} />);
      expect(screen.getByText('1 dari 9')).toBeInTheDocument();
    });

    it('shows correct step text for step 4', () => {
      render(<CoupleForm data={null} onSave={onSave} step={4} totalSteps={9} />);
      expect(screen.getByText('5 dari 9')).toBeInTheDocument();
    });

    it('calculates correct width percentage', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={2} totalSteps={9} />);
      const bar = container.querySelector('.rounded-full.transition-all') as HTMLElement;
      expect(bar.style.width).toBe('33%');
    });

    it('uses red color for early progress (<=25%)', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={0} totalSteps={9} />);
      const bar = container.querySelector('.bg-red-400');
      expect(bar).toBeInTheDocument();
    });

    it('uses orange color for mid-low progress (<=50%)', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={3} totalSteps={9} />);
      const bar = container.querySelector('.bg-orange-400');
      expect(bar).toBeInTheDocument();
    });

    it('uses yellow color for mid-high progress (<=75%)', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={5} totalSteps={9} />);
      const bar = container.querySelector('.bg-yellow-400');
      expect(bar).toBeInTheDocument();
    });

    it('uses green color for high progress (>75%)', () => {
      const { container } = render(<CoupleForm data={null} onSave={onSave} step={8} totalSteps={9} />);
      const bar = container.querySelector('.bg-green-500');
      expect(bar).toBeInTheDocument();
    });

    it('does not render progress bar when step is not provided', () => {
      render(<CoupleForm data={null} onSave={onSave} />);
      expect(screen.queryByText(/^\d+ dari \d+$/)).toBeNull();
    });

    it('does not render progress bar when totalSteps is 0', () => {
      render(<CoupleForm data={null} onSave={onSave} step={0} totalSteps={0} />);
      expect(screen.queryByText(/^\d+ dari \d+$/)).toBeNull();
    });
  });
});
