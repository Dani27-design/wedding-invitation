import { Timestamp } from 'firebase/firestore';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: 'pending' | 'customer' | 'super';
  provider: 'email' | 'google';
  assignedWeddingSlug: string | null;
  createdAt: Timestamp;
}

export interface WeddingDocument {
  adminIds: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  groomNickname: string;
  groomName: string;
  groomParents: string;
  groomPhoto: string;
  groomSocialLinks: { label: string; url: string }[];

  brideNickname: string;
  brideName: string;
  brideParents: string;
  bridePhoto: string;
  brideSocialLinks: { label: string; url: string }[];

  defaultGuest: string;

  eventDate: string;
  eventCity: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  ceremonies: Ceremony[];

  story: StorySlide[];
  gallery: string[];
  giftAccounts: BankAccount[];

  musicUrl: string;
  twibbonOverlay: string;
  heroImage: string;
  openingImage: string;

  quranArabic: string;
  quranTranslation: string;
  quranReference: string;

  theme: WeddingTheme;

  credits: CreditPerson[];
}

export interface ThemeColors {
  accent: string;
  background: string;
  text: string;
  surface: string;
  button: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  decorative: string;
  script: string;
}

export interface WeddingTheme {
  template: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export interface StoryLikesDocument {
  likes: number[];
}

export interface WishDocument {
  weddingId: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: Timestamp;
}

export interface StoryCommentDocument {
  weddingId: string;
  slideIndex: number;
  name: string;
  text: string;
  createdAt: Timestamp;
}

export interface Ceremony {
  name: string;
  start: string;
  end: string;
}

export interface StorySlide {
  year: string;
  text: string;
  bgImage: string;
}

export interface BankAccount {
  bank: string;
  account: string;
  owner: string;
}

export interface CreditPerson {
  name: string;
  role: string;
  description: string;
}
