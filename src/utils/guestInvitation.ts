import type { Guest, WeddingDocument } from '@/types/firestore';
import {
  createGuestMessageContext,
  getDefaultGuestMessageTemplate,
  replaceGuestMessageVariables,
  type GuestMessageWeddingFields,
} from './guestMessageVariables';

type GuestInvitationFields = Pick<Guest, 'name' | 'phone'>;
type WeddingInvitationFields = GuestMessageWeddingFields;

function normalizeWhatsAppPhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('620')) return `62${digits.slice(3).replace(/^0+/, '')}`;
  if (digits.startsWith('0')) return `62${digits.replace(/^0+/, '')}`;
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 12) return `62${digits}`;
  return digits;
}

export function buildGuestInvitationUrl(baseUrl: string, slug: string, guestName: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  return `${normalizedBaseUrl}/${slug}?to=${encodeURIComponent(guestName)}`;
}

export function buildGuestInvitationMessage({
  guest,
  wedding,
  invitationUrl,
}: {
  guest: Pick<GuestInvitationFields, 'name'>;
  wedding: WeddingInvitationFields;
  invitationUrl: string;
}) {
  const template = wedding.greetingTemplate || getDefaultGuestMessageTemplate();
  return replaceGuestMessageVariables(
    template,
    createGuestMessageContext({ guest, wedding, invitationUrl }),
  );
}

export function buildGuestWhatsAppUrl({
  guest,
  wedding,
  slug,
  baseUrl,
}: {
  guest: GuestInvitationFields;
  wedding: WeddingInvitationFields | null;
  slug: string;
  baseUrl: string;
}) {
  const phone = normalizeWhatsAppPhone(guest.phone);
  if (!phone || !wedding) return null;

  const invitationUrl = buildGuestInvitationUrl(baseUrl, slug, guest.name);
  const message = buildGuestInvitationMessage({ guest, wedding, invitationUrl });

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
