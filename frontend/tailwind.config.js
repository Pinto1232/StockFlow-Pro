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
          50: '#f4f6fb',
          100: '#e5e7ef',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#5a5cdb',
          600: '#4a4cb8',
          700: '#3b3d95',
          800: '#2c2e72',
          900: '#1d1f4f',
        },
        secondary: {
          50: '#f8f4ff',
          100: '#ede4ff',
          200: '#dcc9ff',
          300: '#c4a3ff',
          400: '#a873ff',
          500: '#7f53ac',
          600: '#6b4592',
          700: '#573778',
          800: '#43295e',
          900: '#2f1b44',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      animation: {
        'dropdown-fade-in': 'dropdown-fade-in 0.3s ease-out',
        'pulse': 'pulse 2s infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        'dropdown-fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        'dropdown': '0 12px 40px rgba(90, 92, 219, 0.15), 0 4px 16px rgba(0, 0, 0, 0.05)',
        'dropdown-lg': '0 8px 32px rgba(90, 92, 219, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}