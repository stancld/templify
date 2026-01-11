import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const fontData = fetch(
  new URL('./Inter-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler() {
  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #8b5cf6 100%)',
          fontFamily: 'Inter',
        }}
      >
        {/* Logo/Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            Templify
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 60,
            textAlign: 'center',
          }}
        >
          Fill Word Templates in Bulk
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            gap: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
              }}
            >
              1
            </div>
            <span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Upload
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
              }}
            >
              2
            </div>
            <span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Define Fields
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
              }}
            >
              3
            </div>
            <span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Generate
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 20,
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <span>No Signup</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
          <span>No Install</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
          <span>100% Private</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  return imageResponse;
}
