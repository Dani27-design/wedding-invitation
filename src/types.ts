export interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: number;
}
