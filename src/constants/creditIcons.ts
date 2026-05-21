import {
  Code, Palette, Camera, Music, Video, Heart, Sparkles, Flower2, Star, Gem,
  PenTool, Brush, Scissors, BookOpen, Gift, Cake, Church, Car, Plane, MapPin,
  Sun, Moon, Crown, Ribbon, type LucideIcon,
} from 'lucide-react';

export interface CreditIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
  restricted?: boolean; // only show for specific names
}

export const CREDIT_ICONS: CreditIconOption[] = [
  { value: 'developer', label: 'Developer', icon: Code, restricted: true },
  { value: 'designer', label: 'Desainer', icon: Palette },
  { value: 'camera', label: 'Fotografer', icon: Camera },
  { value: 'music', label: 'Musik', icon: Music },
  { value: 'video', label: 'Videografer', icon: Video },
  { value: 'heart', label: 'Cinta', icon: Heart },
  { value: 'sparkles', label: 'Dekorasi', icon: Sparkles },
  { value: 'flower', label: 'Bunga', icon: Flower2 },
  { value: 'star', label: 'Bintang', icon: Star },
  { value: 'gem', label: 'Permata', icon: Gem },
  { value: 'pen', label: 'Penulis', icon: PenTool },
  { value: 'brush', label: 'Seniman', icon: Brush },
  { value: 'scissors', label: 'Penjahit', icon: Scissors },
  { value: 'book', label: 'Buku', icon: BookOpen },
  { value: 'gift', label: 'Hadiah', icon: Gift },
  { value: 'cake', label: 'Kue', icon: Cake },
  { value: 'church', label: 'Tempat Ibadah', icon: Church },
  { value: 'car', label: 'Transportasi', icon: Car },
  { value: 'plane', label: 'Perjalanan', icon: Plane },
  { value: 'location', label: 'Lokasi', icon: MapPin },
  { value: 'sun', label: 'Matahari', icon: Sun },
  { value: 'moon', label: 'Bulan', icon: Moon },
  { value: 'crown', label: 'Mahkota', icon: Crown },
  { value: 'ribbon', label: 'Pita', icon: Ribbon },
];

// Name that's allowed to use the 'developer' role
export const DEVELOPER_ALLOWED_NAME = 'M. Daniansyah C.';

// Lookup map for quick icon resolution
export const CREDIT_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CREDIT_ICONS.map(({ value, icon }) => [value, icon])
);
