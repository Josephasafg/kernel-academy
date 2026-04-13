/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050a15',
        surface: {
          DEFAULT: '#0c1222',
          light: '#141c30',
          lighter: '#1a2540',
        },
        accent: {
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a78bfa',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow:
              '0 0 5px rgba(6,182,212,0.5), 0 0 10px rgba(6,182,212,0.3)',
          },
          '100%': {
            boxShadow:
              '0 0 10px rgba(6,182,212,0.8), 0 0 20px rgba(6,182,212,0.5)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
