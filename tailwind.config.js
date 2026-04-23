/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#280611',
          deep: '#1a0308',
          soft: '#3d0b1c',
          glow: '#5c1026',
          light: '#6d1a2e',
        },
        claret: '#9f2e4a',
        bordeaux: {
          DEFAULT: '#e55f83',
          deep: '#c44569',
        },
        oxblood: '#7a1a2e',
        parchment: {
          DEFAULT: '#f4e8d7',
          dim: '#d4c5a9',
          mute: '#c9b896',
          ink: '#f9f2e5',
        },
        bone: '#e8dcc4',
        gold: {
          DEFAULT: '#c9a961',
          deep: '#a8893f',
        },
        copper: {
          DEFAULT: '#d89050',
          deep: '#b87333',
        },
        sage: '#8fa173',
        rust: '#b85838',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        italic: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        'caps': '0.18em',
        'widest': '0.24em',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.91 0 0 0 0 0.84 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
