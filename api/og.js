const React = require('react');

module.exports = async function handler() {
  try {
    const { ImageResponse } = await import('@vercel/og');

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #8b5cf6 100%)',
            fontFamily: 'Inter',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
            },
          },
          React.createElement(
            'span',
            {
              style: {
                fontSize: 80,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-2px',
              },
            },
            'Templify'
          )
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 40,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: 60,
              textAlign: 'center',
            },
          },
          'Fill Word Templates in Bulk'
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              gap: 40,
            },
          },
          createStep('1', 'Upload'),
          createStep('2', 'Define Fields'),
          createStep('3', 'Generate')
        ),
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              gap: 20,
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.6)',
            },
          },
          React.createElement('span', null, 'No Signup'),
          React.createElement(
            'span',
            { style: { color: 'rgba(255, 255, 255, 0.4)' } },
            '•'
          ),
          React.createElement('span', null, 'No Install'),
          React.createElement(
            'span',
            { style: { color: 'rgba(255, 255, 255, 0.4)' } },
            '•'
          ),
          React.createElement('span', null, '100% Private')
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('OG Image endpoint - deploy to Vercel to test', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

module.exports.config = {
  runtime: 'nodejs',
};

function createStep(number, label) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement(
      'div',
      {
        style: {
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
        },
      },
      number
    ),
    React.createElement(
      'span',
      { style: { fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' } },
      label
    )
  );
}
