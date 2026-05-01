export interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  count: number;
  createdAt: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

