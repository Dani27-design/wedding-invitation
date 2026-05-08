import { Timestamp } from 'firebase/firestore';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const formatDate = (value: number | Timestamp) =>
  dateFormatter.format(value instanceof Timestamp ? value.toDate() : value);
