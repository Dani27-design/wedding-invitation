import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WeddingDocument } from '@/types/firestore';
import AdminPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'dani-marini' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('@/lib/firebase-auth', () => ({
  auth: {},
}));

vi.mock('@/lib/revalidate', () => ({
  revalidateWedding: vi.fn(),
}));

vi.mock('@/lib/storage', () => ({
  deleteFile: vi.fn(),
  getUploadFileExtension: vi.fn(() => 'jpg'),
  uploadFile: vi.fn(),
  validateUploadFile: vi.fn(() => ({ ok: true, contentType: 'image/jpeg' })),
}));

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    authUser: { uid: 'admin-1' },
    userDoc: { role: 'super' },
    isLoading: false,
  }),
}));

const wedding: WeddingDocument = {
  adminIds: ['admin-1'],
  status: 'published',
  createdAt: {} as WeddingDocument['createdAt'],
  updatedAt: {} as WeddingDocument['updatedAt'],
  groomNickname: 'Dani',
  groomName: 'Daniansyah C.',
  groomParents: 'Bapak dan Ibu Pria',
  groomPhoto: '',
  groomSocialLinks: [],
  brideNickname: 'Marini',
  brideName: 'Siti Nur Marini',
  brideParents: 'Bapak dan Ibu Wanita',
  bridePhoto: '',
  brideSocialLinks: [],
  defaultGuest: 'Tamu Spesial Kami',
  eventDate: '2026-09-18',
  eventCity: 'Surabaya',
  ceremonies: [],
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
    colors: {
      accent: '#b8944d',
      background: '#fff',
      text: '#222',
      surface: '#fff',
      button: '#b8944d',
    },
    fonts: {
      heading: '',
      body: '',
      decorative: '',
      script: '',
    },
  },
  credits: [],
  footerText: '',
  greetingTemplate: '{nama tamu}\n{link undangan}',
};

vi.mock('@/hooks/useWedding', () => ({
  useWedding: () => ({
    wedding,
    isLoading: false,
  }),
}));

vi.mock('@/components/admin/CoupleForm', () => ({
  CoupleForm: () => <div data-testid="couple-form" />,
}));
vi.mock('@/components/admin/EventForm', () => ({
  EventForm: () => <div data-testid="event-form" />,
}));
vi.mock('@/components/admin/MediaForm', () => ({
  MediaForm: () => <div data-testid="media-form" />,
}));
vi.mock('@/components/admin/StoryForm', () => ({
  StoryForm: () => <div data-testid="story-form" />,
}));
vi.mock('@/components/admin/GalleryForm', () => ({
  GalleryForm: () => <div data-testid="gallery-form" />,
}));
vi.mock('@/components/admin/GiftForm', () => ({
  GiftForm: () => <div data-testid="gift-form" />,
}));
vi.mock('@/components/admin/CreditForm', () => ({
  CreditForm: () => <div data-testid="credit-form" />,
}));
vi.mock('@/components/admin/CustomizeForm', () => ({
  CustomizeForm: () => <div data-testid="customize-form" />,
}));
vi.mock('@/components/admin/GuestTab', () => ({
  GuestTab: () => <div data-testid="guest-tab" />,
}));
vi.mock('@/components/admin/GuestListTab', () => ({
  GuestListTab: () => <div data-testid="guest-list-tab" />,
}));
vi.mock('@/components/admin/StoryInteractionsForm', () => ({
  StoryInteractionsForm: () => <div data-testid="story-interactions-form" />,
}));
vi.mock('@/components/admin/WishesForm', () => ({
  WishesForm: () => <div data-testid="wishes-form" />,
}));
vi.mock('@/components/admin/TestimonialForm', () => ({
  TestimonialForm: () => <div data-testid="testimonial-form" />,
}));
vi.mock('@/components/admin/ConfirmDeleteModal', () => ({
  ConfirmDeleteModal: () => null,
}));

describe('AdminPage layout', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('keeps bottom safe-area padding so the last form action remains tappable on mobile', () => {
    render(<AdminPage />);

    const panel = screen.getByRole('tabpanel');

    expect(panel).toHaveClass('pt-1');
    expect(panel.className).toContain('pb-[calc(5rem+env(safe-area-inset-bottom))]');
    expect(panel).not.toHaveClass('py-1');
  });
});
