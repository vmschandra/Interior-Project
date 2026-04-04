/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DesignNest navy + fluorescent green palette
        navy: {
          950: '#030810',
          900: '#071020',
          850: '#0B1929',
          800: '#101F36',
          700: '#162D4A',
          600: '#1E3D60',
          500: '#2A5080',
          400: '#3668A0',
          300: '#4A82C0',
          200: '#6BA0D8',
          100: '#A0C8F0',
          50:  '#D0E4F8',
        },
        neon: {
          DEFAULT: '#39FF14',
          light:   '#6BFF4A',
          pale:    '#A5FF8A',
          muted:   'rgba(57,255,20,0.15)',
          dark:    '#2ACC10',
        },
        mint: {
          DEFAULT: '#E0FFD6',
          light:   '#F0FFF0',
          dark:    '#B8F0A0',
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
        'glow':   '0 0 20px rgba(57,255,20,0.25)',
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
