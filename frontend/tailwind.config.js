/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        surface: {
          50:  'rgba(255,255,255,0.08)',
          100: 'rgba(255,255,255,0.06)',
          200: 'rgba(255,255,255,0.04)',
          300: 'rgba(255,255,255,0.02)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-indigo': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35), transparent)',
        'glow-purple': 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.2), transparent)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px 0 rgba(99,102,241,0.4)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(99,102,241,0.7)' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(99,102,241,0.3)' },
          '50%':      { borderColor: 'rgba(139,92,246,0.6)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.5s ease forwards',
        'fade-in':    'fade-in 0.4s ease forwards',
        shimmer:      'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float:        'float 3s ease-in-out infinite',
        'border-glow':'border-glow 2s ease-in-out infinite',
        'count-up':   'count-up 0.6s ease forwards',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
