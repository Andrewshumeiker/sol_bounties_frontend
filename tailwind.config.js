/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        panel: '#121220',
        panel2: '#0F0F18',
        primary: '#8B5CF6',
        mint: '#2EE6A6'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.35), 0 12px 60px rgba(139,92,246,0.18)'
      }
    }
  },
  plugins: []
};
