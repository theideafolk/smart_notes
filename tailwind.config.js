/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3A86FF',
        secondary: '#8338EC',
        accent: '#FF006E',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: {
          primary: '#212529',
          secondary: '#495057',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};