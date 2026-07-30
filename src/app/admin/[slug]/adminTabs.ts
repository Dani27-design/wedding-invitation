import { UserRound, Calendar, BookHeart, Image, Gift, Images, Award, Palette, MessageCircle, MessageSquare, Heart, Users, Eye, Star } from 'lucide-react';

export const ADMIN_TABS = [
  { label: 'Pasangan', icon: UserRound },
  { label: 'Acara', icon: Calendar },
  { label: 'Media', icon: Image },
  { label: 'Cerita', icon: BookHeart },
  { label: 'Galeri', icon: Images },
  { label: 'Hadiah', icon: Gift },
  { label: 'Penutup', icon: Award },
  { label: 'Tema', icon: Palette },
  { label: 'Pesan', icon: MessageSquare },
  { label: 'Tamu', icon: Users },
  { label: 'Preview', icon: Eye },
  { label: 'Interaksi', icon: MessageCircle },
  { label: 'Ucapan', icon: Heart },
  { label: 'Testimoni', icon: Star },
] as const;
