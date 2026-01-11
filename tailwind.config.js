/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3F8AE2',
          dark: '#2E69B3',
          light: '#5DA3F5',
        },
        accent: {
          purple: '#AE33EC',
          green: '#00eb82',
        },
        neutral: {
          dark: '#32373c',
          gray: '#6B7280',
          light: '#F3F4F6',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3F8AE2 0%, #AE33EC 100%)',
        'gradient-hero': 'linear-gradient(135deg, #3F8AE2 0%, #5DA3F5 50%, #AE33EC 100%)',
      }
    },
  },
  plugins: [],
}
