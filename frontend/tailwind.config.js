/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d6e0ec',
          400: '#3d5a80',
          600: '#1c3557',
          700: '#12294a',
          800: '#0c1f3c',
          900: '#081633',
        },
        teal: {
          50: '#e9f9f5',
          100: '#c9f0e6',
          400: '#2bb3a0',
          500: '#0f9b8e',
          600: '#0c8378',
          700: '#0a6b62',
        },
        sand: {
          50: '#fbfaf7',
          100: '#f4f1ea',
        },
        amber: {
          500: '#d98c2b',
        },
        coral: {
          500: '#d9634f',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12, 31, 60, 0.04), 0 8px 24px -8px rgba(12, 31, 60, 0.12)',
        card: '0 1px 3px rgba(12, 31, 60, 0.06), 0 12px 32px -12px rgba(12, 31, 60, 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
