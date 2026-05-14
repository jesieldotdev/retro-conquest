/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ra: {
          gold: '#F5C518',
          dark: '#0D0F1A',
          darker: '#080A12',
          card: '#141628',
          border: '#1E2240',
          text: '#A0A8C8',
          accent: '#4F6EF7',
          green: '#22C55E',
          red: '#EF4444',
          purple: '#A855F7',
          orange: '#F97316',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(79,110,247,0.3)' },
          to: { boxShadow: '0 0 20px rgba(79,110,247,0.6), 0 0 40px rgba(79,110,247,0.2)' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow-accent': '0 0 20px rgba(79,110,247,0.4)',
        'glow-gold': '0 0 20px rgba(245,197,24,0.4)',
        'glow-green': '0 0 20px rgba(34,197,94,0.3)',
      },
    },
  },
  plugins: [],
}

