/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        'bg-main':  '#0A0908',
        'bg-card':  '#111009',
        'border-dim': '#1E1C14',
        'parchment': '#E2D9C8',
        'muted':     '#7A756A',
        'burgundy':  '#6B2D3E',
        'sage':      '#6A8F6E',
        'steel':     '#3A6B7A',
        'bone':      '#EDE5D5',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Lora', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        quote:   ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}