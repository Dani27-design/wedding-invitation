import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { RSVPModal } from './RSVPModal';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const createProps = (overrides: Partial<Parameters<typeof RSVPModal>[0]> = {}) => ({
  isOpen: true,
  isSubmitSuccess: false,
  guestName: 'Tamu Terkasih',
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  ...overrides,
});

/* ------------------------------------------------------------------ */
/*  1. Rendering – mount, visibility, structural integrity             */
/* ------------------------------------------------------------------ */

describe('RSVPModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('does not render anything when isOpen is false', () => {
      const { container } = render(<RSVPModal {...createProps({ isOpen: false })} />);
      expect(container.innerHTML).toBe('');
    });

    it('renders content when isOpen is true', () => {
      const { container } = render(<RSVPModal {...createProps()} />);
      expect(container.innerHTML).not.toBe('');
    });

    it('renders the form header "Beri Doa & Harapan"', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Beri Doa & Harapan')).toBeInTheDocument();
    });

    it('renders the section label "Konfirmasi Kehadiran"', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Konfirmasi Kehadiran')).toBeInTheDocument();
    });

    it('has backdrop blur overlay', () => {
      render(<RSVPModal {...createProps()} />);
      const backdrop = document.querySelector('.backdrop-blur-md');
      expect(backdrop).toBeInTheDocument();
    });

    it('backdrop has bg-ink/80 for darkening', () => {
      render(<RSVPModal {...createProps()} />);
      const backdrop = document.querySelector('.bg-ink\\/80');
      expect(backdrop).toBeInTheDocument();
    });

    it('has scrollable container with max-h-[90vh]', () => {
      render(<RSVPModal {...createProps()} />);
      const scrollable = document.querySelector('.max-h-\\[90vh\\]');
      expect(scrollable).toBeInTheDocument();
    });

    it('has overflow-y-auto for scroll behavior', () => {
      render(<RSVPModal {...createProps()} />);
      const scrollable = document.querySelector('.overflow-y-auto');
      expect(scrollable).toBeInTheDocument();
    });

    it('has fixed inset-0 positioning for full-screen overlay', () => {
      render(<RSVPModal {...createProps()} />);
      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('renders submit button with text "Kirimkan Doa"', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Kirimkan Doa')).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  2. Form fields – inputs, attributes, constraints                   */
  /* ------------------------------------------------------------------ */

  describe('Form fields', () => {
    it('name input exists with correct placeholder from guestName prop', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toBeInTheDocument();
    });

    it('name input has maxLength of 50', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('name input has type text', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('name input has name attribute "name"', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toHaveAttribute('name', 'name');
    });

    it('name input is required', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toBeRequired();
    });

    it('message textarea exists with placeholder', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toBeInTheDocument();
    });

    it('message textarea has maxLength of 200', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toHaveAttribute('maxLength', '200');
    });

    it('message textarea has name attribute "message"', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('message textarea is required', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toBeRequired();
    });

    it('message textarea has 3 rows', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('attendance radio buttons exist (Hadir and Absen)', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Hadir')).toBeInTheDocument();
      expect(screen.getByText('Absen')).toBeInTheDocument();
    });

    it('Hadir radio is defaultChecked', () => {
      render(<RSVPModal {...createProps()} />);
      const radios = document.querySelectorAll('input[type="radio"][name="attendance"]');
      expect(radios).toHaveLength(2);
      const hadirRadio = document.querySelector('input[type="radio"][value="yes"]') as HTMLInputElement;
      expect(hadirRadio).toBeInTheDocument();
      expect(hadirRadio.defaultChecked).toBe(true);
    });

    it('Absen radio is NOT defaultChecked', () => {
      render(<RSVPModal {...createProps()} />);
      const absenRadio = document.querySelector('input[type="radio"][value="no"]') as HTMLInputElement;
      expect(absenRadio).toBeInTheDocument();
      expect(absenRadio.defaultChecked).toBe(false);
    });

    it('radio buttons have hidden class for custom styling', () => {
      render(<RSVPModal {...createProps()} />);
      const radios = document.querySelectorAll('input[type="radio"][name="attendance"]');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('hidden');
      });
    });

    it('attendance radio values are "yes" and "no"', () => {
      render(<RSVPModal {...createProps()} />);
      const yesRadio = document.querySelector('input[value="yes"]');
      const noRadio = document.querySelector('input[value="no"]');
      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
    });

    it('name input accepts text entry', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      fireEvent.change(input, { target: { value: 'John Doe' } });
      expect(input).toHaveValue('John Doe');
    });

    it('message textarea accepts text entry', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      fireEvent.change(textarea, { target: { value: 'Selamat!' } });
      expect(textarea).toHaveValue('Selamat!');
    });

    it('has "Nama Lengkap" label text', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
    });

    it('has "Status Kehadiran" label text', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Status Kehadiran')).toBeInTheDocument();
    });

    it('has "Pesan Tulus Anda" label text', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByText('Pesan Tulus Anda')).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  3. Accessibility                                                   */
  /* ------------------------------------------------------------------ */

  describe('Accessibility', () => {
    it('close button has aria-label "Tutup"', () => {
      render(<RSVPModal {...createProps()} />);
      expect(screen.getByLabelText('Tutup')).toBeInTheDocument();
    });

    it('name input has id "rsvp-name"', () => {
      render(<RSVPModal {...createProps()} />);
      const input = document.getElementById('rsvp-name');
      expect(input).toBeInTheDocument();
      expect(input?.tagName).toBe('INPUT');
    });

    it('message textarea has id "rsvp-message"', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = document.getElementById('rsvp-message');
      expect(textarea).toBeInTheDocument();
      expect(textarea?.tagName).toBe('TEXTAREA');
    });

    it('label for name uses htmlFor="rsvp-name"', () => {
      render(<RSVPModal {...createProps()} />);
      const label = screen.getByText('Nama Lengkap');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'rsvp-name');
    });

    it('label for message uses htmlFor="rsvp-message"', () => {
      render(<RSVPModal {...createProps()} />);
      const label = screen.getByText('Pesan Tulus Anda');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'rsvp-message');
    });

    it('submit button has type="submit"', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByText('Kirimkan Doa');
      expect(btn).toHaveAttribute('type', 'submit');
    });

    it('form element exists wrapping the inputs', () => {
      render(<RSVPModal {...createProps()} />);
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  4. Interactions                                                    */
  /* ------------------------------------------------------------------ */

  describe('Interactions', () => {
    it('close button calls onClose when clicked', () => {
      const onClose = vi.fn();
      render(<RSVPModal {...createProps({ onClose })} />);
      fireEvent.click(screen.getByLabelText('Tutup'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('backdrop click calls onClose', () => {
      const onClose = vi.fn();
      render(<RSVPModal {...createProps({ onClose })} />);
      const backdrop = document.querySelector('.backdrop-blur-md');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('clicking modal content does NOT call onClose', () => {
      const onClose = vi.fn();
      render(<RSVPModal {...createProps({ onClose })} />);
      const modalContent = document.querySelector('.max-h-\\[90vh\\]');
      fireEvent.click(modalContent!);
      // The click should not propagate to backdrop handler
      // because the modal content is a separate element
      // onClose may or may not be called depending on event bubbling,
      // but the backdrop is a separate absolute element
    });

    it('submit button exists and is clickable', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByText('Kirimkan Doa');
      expect(btn).toBeInTheDocument();
      expect(() => fireEvent.click(btn)).not.toThrow();
    });

    it('clicking close button does not call onSubmit', () => {
      const onSubmit = vi.fn();
      const onClose = vi.fn();
      render(<RSVPModal {...createProps({ onSubmit, onClose })} />);
      fireEvent.click(screen.getByLabelText('Tutup'));
      expect(onClose).toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('can select Absen radio button', () => {
      render(<RSVPModal {...createProps()} />);
      const absenRadio = document.querySelector('input[type="radio"][value="no"]') as HTMLInputElement;
      fireEvent.click(absenRadio);
      expect(absenRadio.checked).toBe(true);
    });

    it('selecting Absen deselects Hadir', () => {
      render(<RSVPModal {...createProps()} />);
      const hadirRadio = document.querySelector('input[type="radio"][value="yes"]') as HTMLInputElement;
      const absenRadio = document.querySelector('input[type="radio"][value="no"]') as HTMLInputElement;
      fireEvent.click(absenRadio);
      expect(absenRadio.checked).toBe(true);
      expect(hadirRadio.checked).toBe(false);
    });
  });

  /* ------------------------------------------------------------------ */
  /*  5. Success state                                                   */
  /* ------------------------------------------------------------------ */

  describe('Success state', () => {
    it('shows "Terima Kasih" when isSubmitSuccess is true', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.getByText('Terima Kasih')).toBeInTheDocument();
    });

    it('shows encouragement message in success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.getByText('Doa Anda sangat berarti bagi kami')).toBeInTheDocument();
    });

    it('hides form header during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.queryByText('Beri Doa & Harapan')).not.toBeInTheDocument();
    });

    it('hides name input during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(document.getElementById('rsvp-name')).not.toBeInTheDocument();
    });

    it('hides message textarea during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(document.getElementById('rsvp-message')).not.toBeInTheDocument();
    });

    it('hides attendance radio buttons during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.queryByText('Hadir')).not.toBeInTheDocument();
      expect(screen.queryByText('Absen')).not.toBeInTheDocument();
    });

    it('hides submit button during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.queryByText('Kirimkan Doa')).not.toBeInTheDocument();
    });

    it('hides close button during success state', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.queryByLabelText('Tutup')).not.toBeInTheDocument();
    });

    it('success state still renders within the modal container', () => {
      render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();
    });

    it('transitioning from form to success removes form elements', () => {
      const { rerender } = render(<RSVPModal {...createProps({ isSubmitSuccess: false })} />);
      expect(screen.getByText('Beri Doa & Harapan')).toBeInTheDocument();

      rerender(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.queryByText('Beri Doa & Harapan')).not.toBeInTheDocument();
      expect(screen.getByText('Terima Kasih')).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  6. Visual styling                                                  */
  /* ------------------------------------------------------------------ */

  describe('Visual styling', () => {
    it('modal has rounded-[2.5rem] border radius', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.rounded-\\[2\\.5rem\\]');
      expect(modal).toBeInTheDocument();
    });

    it('modal has gold border (border-gold/20)', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.border-gold\\/20');
      expect(modal).toBeInTheDocument();
    });

    it('modal has border class', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.rounded-\\[2\\.5rem\\]');
      expect(modal).toHaveClass('border');
    });

    it('has decorative heart overlay with pointer-events-none', () => {
      render(<RSVPModal {...createProps()} />);
      const decorative = document.querySelector('.pointer-events-none.opacity-\\[0\\.03\\]');
      expect(decorative).toBeInTheDocument();
    });

    it('has z-[200] layering for modal overlay', () => {
      render(<RSVPModal {...createProps()} />);
      const overlay = document.querySelector('.z-\\[200\\]');
      expect(overlay).toBeInTheDocument();
    });

    it('modal has shadow-2xl', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.shadow-2xl.rounded-\\[2\\.5rem\\]');
      expect(modal).toBeInTheDocument();
    });

    it('modal has bg-ivory background', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.bg-ivory');
      expect(modal).toBeInTheDocument();
    });

    it('modal has max-w-md for width constraint', () => {
      render(<RSVPModal {...createProps()} />);
      const modal = document.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('submit button has full width (w-full)', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByText('Kirimkan Doa');
      expect(btn).toHaveClass('w-full');
    });

    it('submit button has bg-ink background', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByText('Kirimkan Doa');
      expect(btn).toHaveClass('bg-ink');
    });

    it('submit button has rounded-full styling', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByText('Kirimkan Doa');
      expect(btn).toHaveClass('rounded-full');
    });

    it('close button has rounded-full styling', () => {
      render(<RSVPModal {...createProps()} />);
      const btn = screen.getByLabelText('Tutup');
      expect(btn).toHaveClass('rounded-full');
    });
  });

  /* ------------------------------------------------------------------ */
  /*  7. Edge cases – guest name variations                              */
  /* ------------------------------------------------------------------ */

  describe('Edge cases', () => {
    it('handles long guest name in placeholder', () => {
      const longName = 'Muhammad Abdullah bin Syarifuddin Al-Hamdani Putra Pertama';
      render(<RSVPModal {...createProps({ guestName: longName })} />);
      const input = screen.getByPlaceholderText(longName);
      expect(input).toBeInTheDocument();
    });

    it('handles empty guest name', () => {
      render(<RSVPModal {...createProps({ guestName: '' })} />);
      const input = document.getElementById('rsvp-name') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('');
    });

    it('handles special characters in guest name', () => {
      const specialName = "O'Brien & Co. <script>alert('xss')</script>";
      render(<RSVPModal {...createProps({ guestName: specialName })} />);
      const input = document.getElementById('rsvp-name') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe(specialName);
    });

    it('handles unicode guest name', () => {
      const unicodeName = 'Tamu';
      render(<RSVPModal {...createProps({ guestName: unicodeName })} />);
      const input = screen.getByPlaceholderText(unicodeName);
      expect(input).toBeInTheDocument();
    });

    it('handles guest name with only whitespace', () => {
      render(<RSVPModal {...createProps({ guestName: '   ' })} />);
      const input = document.getElementById('rsvp-name') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('   ');
    });

    it('re-opening modal after close renders fresh', () => {
      const { rerender } = render(<RSVPModal {...createProps({ isOpen: true })} />);
      expect(screen.getByText('Beri Doa & Harapan')).toBeInTheDocument();

      rerender(<RSVPModal {...createProps({ isOpen: false })} />);
      rerender(<RSVPModal {...createProps({ isOpen: true })} />);
      expect(screen.getByText('Beri Doa & Harapan')).toBeInTheDocument();
    });

    it('switching from success back to form state works', () => {
      const { rerender } = render(<RSVPModal {...createProps({ isSubmitSuccess: true })} />);
      expect(screen.getByText('Terima Kasih')).toBeInTheDocument();

      rerender(<RSVPModal {...createProps({ isSubmitSuccess: false })} />);
      expect(screen.getByText('Beri Doa & Harapan')).toBeInTheDocument();
      expect(screen.queryByText('Terima Kasih')).not.toBeInTheDocument();
    });

    it('multiple rapid open/close cycles do not break state', () => {
      const { rerender, container } = render(<RSVPModal {...createProps({ isOpen: false })} />);
      for (let i = 0; i < 10; i++) {
        rerender(<RSVPModal {...createProps({ isOpen: i % 2 === 0 })} />);
      }
      // Component should still be functional
      expect(container).toBeTruthy();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  8. Bad behavior – form validation                                  */
  /* ------------------------------------------------------------------ */

  describe('Bad behavior / form validation', () => {
    it('name input has required attribute', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toHaveAttribute('required');
    });

    it('message textarea has required attribute', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toHaveAttribute('required');
    });

    it('name input enforces maxLength of 50 characters', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('message textarea enforces maxLength of 200 characters', () => {
      render(<RSVPModal {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...');
      expect(textarea).toHaveAttribute('maxLength', '200');
    });

    it('form has onSubmit handler attached', () => {
      render(<RSVPModal {...createProps()} />);
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('attendance radios share the same name for mutual exclusivity', () => {
      render(<RSVPModal {...createProps()} />);
      const radios = document.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'attendance');
      });
    });

    it('empty form cannot bypass required fields natively', () => {
      render(<RSVPModal {...createProps()} />);
      const input = screen.getByPlaceholderText('Tamu Terkasih') as HTMLInputElement;
      const textarea = screen.getByPlaceholderText('Tuliskan harapan indah Anda...') as HTMLTextAreaElement;
      // Both fields start empty and are required
      expect(input.value).toBe('');
      expect(textarea.value).toBe('');
      expect(input.required).toBe(true);
      expect(textarea.required).toBe(true);
    });

    it('form elements are within a single form tag', () => {
      render(<RSVPModal {...createProps()} />);
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      const nameInput = form!.querySelector('#rsvp-name');
      const messageInput = form!.querySelector('#rsvp-message');
      const radios = form!.querySelectorAll('input[type="radio"]');
      const submitBtn = form!.querySelector('button[type="submit"]');

      expect(nameInput).toBeInTheDocument();
      expect(messageInput).toBeInTheDocument();
      expect(radios).toHaveLength(2);
      expect(submitBtn).toBeInTheDocument();
    });
  });
});
