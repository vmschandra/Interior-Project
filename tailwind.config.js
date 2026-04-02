/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DesignNest luxury warm palette (Somervilles-inspired)
        stone: {
          950: '#0D0B09',
          900: '#1A1612',
          850: '#201C18',
          800: '#2A2420',
          700: '#3D3530',
          600: '#5C5148',
          500: '#7A6B60',
          400: '#A88362',
          300: '#C9A87C',
          200: '#D4B896',
          100: '#E8DDD0',
          50:  '#F5F0EA',
        },
        gold: {
          DEFAULT: '#A88362',
          light:   '#C9A87C',
          pale:    '#D4B896',
          muted:   'rgba(168,131,98,0.15)',
        },
        cream: {
          DEFAULT: '#E8DDD0',
          light:   '#F5F0EA',
          dark:    '#D4B896',
        },
      },
      fontFamily: {
        serif:  ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans:   ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'hero':    ['3.5rem', { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'heading': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '6px',
        'lg': '10px',
        'xl': '16px',
      },
      boxShadow: {
        'luxury': '0 1px 3px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)',
        'card':   '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
        'glow':   '0 0 20px rgba(168,131,98,0.25)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                   to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
