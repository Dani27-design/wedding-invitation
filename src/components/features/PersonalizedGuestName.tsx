'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { parsePersonalizedGuestName } from '@/utils/personalizedGuestName';

interface PersonalizedGuestNameProps {
  fallbackGuestName: string;
  onGuestNameChange: (guestName: string) => void;
}

export function PersonalizedGuestName({
  fallbackGuestName,
  onGuestNameChange,
}: PersonalizedGuestNameProps) {
  const searchParams = useSearchParams();
  const personalizedGuestName = parsePersonalizedGuestName(searchParams.get('to')) ?? fallbackGuestName;

  useEffect(() => {
    onGuestNameChange(personalizedGuestName);
  }, [onGuestNameChange, personalizedGuestName]);

  return null;
}
