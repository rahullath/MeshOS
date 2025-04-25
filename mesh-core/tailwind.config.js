/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space-black': '#0A0E17',
        'rich-navy': '#141E33',
        'electric-blue': '#00D8FF',
        'cyber-purple': '#6E56CF',
        'mint-green': '#10B981',
        'amber': '#F59E0B',
        'coral-red': '#EF4444',
        'ice-white': '#F8FAFC',
        'silver': '#94A3B8',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
