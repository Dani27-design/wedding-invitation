import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
        <path
          d="M50 90 C25 65 5 50 5 30 A22 22 0 0 1 50 20 A22 22 0 0 1 95 30 C95 50 75 65 50 90Z"
          fill="#B48D3E"
        />
      </svg>
    ),
    { ...size },
  );
}
