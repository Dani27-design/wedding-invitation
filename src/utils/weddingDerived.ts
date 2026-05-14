import type { SerializedWedding } from '../lib/serialize-wedding';

const dateDisplayFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateShortFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function parseEventDate(eventDate: string): Date {
  const [year, month, day] = eventDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function deriveDateDisplay(eventDate: string): string {
  if (!eventDate) return '';
  return dateDisplayFormatter.format(parseEventDate(eventDate));
}

export function deriveDateShort(eventDate: string): string {
  if (!eventDate) return '';
  return dateShortFormatter.format(parseEventDate(eventDate));
}

export function deriveCalendarUrl(wedding: SerializedWedding): string {
  const date = wedding.eventDate.replace(/-/g, '');
  const startTime = (wedding.ceremonies[0]?.start.replace(':', '') ?? '0900').padStart(4, '0');
  const lastCeremony = wedding.ceremonies[wedding.ceremonies.length - 1];
  const endTime = (lastCeremony?.end.replace(':', '') ?? '1300').padStart(4, '0');
  const start = `${date}T${startTime}00`;
  const end = `${date}T${endTime}00`;
  const title = `Pernikahan ${wedding.groomNickname} & ${wedding.brideNickname}`;
  const location = `${wedding.venueName}, ${wedding.eventCity}`;
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=Pernikahan+kami&location=${encodeURIComponent(location)}&sf=true&output=xml`;
}

export function deriveTwibbonFilename(groom: string, bride: string): string {
  return `Memori-${groom}-${bride}.png`;
}

export function deriveWhatsappUrl(number: string): string {
  return `https://wa.me/${number}`;
}

export function deriveCopyright(eventDate: string): string {
  if (!eventDate) return '';
  const year = eventDate.split('-')[0];
  return `\u00A9 ${year}. Kami membangunnya bersama, dari perjalanan kami.`;
}

export function deriveMetaTitle(groom: string, bride: string, dateShort: string): string {
  return `Wedding ${groom} & ${bride} - ${dateShort}`;
}
