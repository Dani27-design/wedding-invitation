import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDFCF8',
          borderRadius: '22%',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120">
          <path
            d="M50 90 C25 65 5 50 5 30 A22 22 0 0 1 50 20 A22 22 0 0 1 95 30 C95 50 75 65 50 90Z"
            fill="#B48D3E"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
