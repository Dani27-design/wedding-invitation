import type { Ceremony, Guest, WeddingDocument } from '@/types/firestore';

export interface GuestMessageVariableOption {
  key: string;
  label: string;
  group: string;
  value: string;
  required?: boolean;
}

export interface GuestMessageVariableContext {
  guestName: string;
  invitationUrl: string;
  wedding: GuestMessageWeddingFields;
}

export type GuestMessageWeddingFields = Pick<WeddingDocument, 'greetingTemplate' | 'groomNickname' | 'brideNickname'> & Partial<Pick<
  WeddingDocument,
  'groomName' | 'brideName' | 'groomParents' | 'brideParents' | 'eventDate' | 'eventCity' | 'ceremonies'
>>;

const LEGACY_VARIABLE_ALIASES: Record<string, string> = {
  nama: 'nama tamu',
  pengantin: 'nama pengantin',
  link: 'link undangan',
};

const BASE_REQUIRED_VARIABLES = [
  'nama tamu',
  'link undangan',
] as const;

function normalizeVariableKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function canonicalizeGuestMessageVariableKey(key: string) {
  const normalized = normalizeVariableKey(key);
  return LEGACY_VARIABLE_ALIASES[normalized] ?? normalized;
}

function formatDateString(value?: string) {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTimeRange(ceremony: Ceremony) {
  if (ceremony.start && ceremony.end) return `${ceremony.start} - ${ceremony.end}`;
  return ceremony.start || ceremony.end || '';
}

function getCeremonies(wedding: GuestMessageWeddingFields): Ceremony[] {
  if (wedding.ceremonies?.length) return wedding.ceremonies;
  if (wedding.eventDate || wedding.eventCity) {
    return [{
      name: 'Acara Utama',
      date: wedding.eventDate ?? '',
      start: '',
      end: '',
      venueName: wedding.eventCity ?? '',
      venueAddress: '',
      venueMapsUrl: '',
    }];
  }
  return [{
    name: 'Acara 1',
    date: '',
    start: '',
    end: '',
    venueName: '',
    venueAddress: '',
    venueMapsUrl: '',
  }];
}

function eventGroupLabel(ceremony: Ceremony, index: number) {
  return ceremony.name.trim() || `Acara ${index + 1}`;
}

export function buildGuestMessageVariableOptions(context: GuestMessageVariableContext): GuestMessageVariableOption[] {
  const { guestName, invitationUrl, wedding } = context;
  const groomDisplayName = wedding.groomName || wedding.groomNickname || 'Pengantin Pria';
  const brideDisplayName = wedding.brideName || wedding.brideNickname || 'Pengantin Wanita';
  const coupleDisplayName = `${groomDisplayName} & ${brideDisplayName}`;
  const ceremonies = getCeremonies(wedding);

  const baseOptions: GuestMessageVariableOption[] = [
    { key: 'nama tamu', label: 'Nama tamu', group: 'Tamu', value: guestName, required: true },
    { key: 'link undangan', label: 'Link undangan', group: 'Tamu', value: invitationUrl, required: true },
    { key: 'nama pengantin', label: 'Nama pengantin', group: 'Pengantin', value: coupleDisplayName },
    { key: 'nama pengantin pria', label: 'Nama pengantin pria', group: 'Pengantin', value: groomDisplayName },
    { key: 'nama pengantin wanita', label: 'Nama pengantin wanita', group: 'Pengantin', value: brideDisplayName },
    { key: 'orang tua pengantin pria', label: 'Orang tua pengantin pria', group: 'Pengantin', value: wedding.groomParents || 'Orang tua pengantin pria' },
    { key: 'orang tua pengantin wanita', label: 'Orang tua pengantin wanita', group: 'Pengantin', value: wedding.brideParents || 'Orang tua pengantin wanita' },
  ];

  const ceremonyOptions = ceremonies.flatMap((ceremony, index): GuestMessageVariableOption[] => {
    const number = index + 1;
    const group = eventGroupLabel(ceremony, index);
    const venue = ceremony.venueName || ceremony.venueAddress || wedding.eventCity || `Lokasi ${group}`;

    return [
      { key: `nama acara ${number}`, label: `Nama ${group}`, group, value: ceremony.name || group },
      { key: `tanggal acara ${number}`, label: `Tanggal ${group}`, group, value: formatDateString(ceremony.date || wedding.eventDate) },
      { key: `jam acara ${number}`, label: `Jam ${group}`, group, value: formatTimeRange(ceremony) },
      { key: `lokasi acara ${number}`, label: `Lokasi ${group}`, group, value: venue },
      { key: `alamat acara ${number}`, label: `Alamat ${group}`, group, value: ceremony.venueAddress || venue },
      { key: `maps acara ${number}`, label: `Maps ${group}`, group, value: ceremony.venueMapsUrl || '' },
    ];
  });

  return [...baseOptions, ...ceremonyOptions];
}

export function getGuestMessageVariableMap(context: GuestMessageVariableContext) {
  const map = new Map<string, string>();

  for (const option of buildGuestMessageVariableOptions(context)) {
    map.set(canonicalizeGuestMessageVariableKey(option.key), option.value);
  }

  for (const [legacy, canonical] of Object.entries(LEGACY_VARIABLE_ALIASES)) {
    const value = map.get(canonical);
    if (value != null) map.set(legacy, value);
  }

  return map;
}

export function replaceGuestMessageVariables(template: string, context: GuestMessageVariableContext) {
  const variableMap = getGuestMessageVariableMap(context);
  return template.replace(/\{([^{}]+)\}/g, (match, rawKey: string) => {
    const value = variableMap.get(canonicalizeGuestMessageVariableKey(rawKey));
    return value ?? match;
  });
}

export function normalizeGuestMessageTemplate(template: string) {
  return template.replace(/\{([^{}]+)\}/g, (match, rawKey: string) => {
    const canonical = canonicalizeGuestMessageVariableKey(rawKey);
    return canonical === normalizeVariableKey(rawKey) ? match : `{${canonical}}`;
  });
}

export function getGuestMessagePlaceholderKeys(template: string) {
  return Array.from(template.matchAll(/\{([^{}]+)\}/g), match => canonicalizeGuestMessageVariableKey(match[1]));
}

function getBrokenPlaceholderFragments(template: string) {
  const fragments: string[] = [];
  const lines = template.split(/\r?\n/);
  for (const line of lines) {
    const openIndex = line.lastIndexOf('{');
    const closeIndex = line.lastIndexOf('}');
    if (openIndex !== -1 && openIndex > closeIndex) {
      fragments.push(line.slice(openIndex));
    }
  }
  return fragments;
}

export function validateGuestMessageTemplate(template: string, options: GuestMessageVariableOption[]) {
  const knownKeys = new Set(options.map(option => canonicalizeGuestMessageVariableKey(option.key)));
  const placeholderKeys = getGuestMessagePlaceholderKeys(template);
  const placeholderSet = new Set(placeholderKeys);
  const unknownPlaceholders = placeholderKeys.filter(key => !knownKeys.has(key));
  const brokenFragments = getBrokenPlaceholderFragments(template);
  const missingRequired: string[] = BASE_REQUIRED_VARIABLES.filter(key => !placeholderSet.has(key));

  return {
    isValid: unknownPlaceholders.length === 0 && brokenFragments.length === 0 && missingRequired.length === 0,
    unknownPlaceholders,
    brokenFragments,
    missingRequired,
  };
}

export function getDefaultGuestMessageTemplate() {
  return [
    'Assalamualaikum Wr. Wb.',
    '',
    'Kepada Yth.',
    '{nama tamu}',
    '',
    'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan:',
    '',
    '{nama pengantin pria}',
    '{orang tua pengantin pria}',
    '',
    'dengan',
    '',
    '{nama pengantin wanita}',
    '{orang tua pengantin wanita}',
    '',
    'Acara:',
    '{nama acara 1}',
    '{tanggal acara 1}',
    '{jam acara 1}',
    '{lokasi acara 1}',
    '{alamat acara 1}',
    '',
    'Buka undangan:',
    '{link undangan}',
    '',
    'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.',
    '',
    'Wassalamualaikum Wr. Wb.',
  ].join('\n');
}

export function createGuestMessageContext({
  guest,
  wedding,
  invitationUrl,
}: {
  guest: Pick<Guest, 'name'>;
  wedding: GuestMessageWeddingFields;
  invitationUrl: string;
}): GuestMessageVariableContext {
  return {
    guestName: guest.name,
    invitationUrl,
    wedding,
  };
}
