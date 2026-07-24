/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: { DEFAULT: 'var(--ink)', muted: 'var(--ink-muted)', faint: 'var(--ink-faint)' },
        line: 'var(--line)',
        blue: 'var(--blue)',
        gold: { DEFAULT: 'var(--gold)', ink: 'var(--gold-ink)' },
        scene: { DEFAULT: 'var(--scene)', surface: 'var(--scene-surface)', ink: 'var(--scene-ink)', gold: 'var(--scene-gold)' },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['3.375rem', { lineHeight: '1.05', letterSpacing: '-0.022em' }],
        h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        h2: ['1.875rem', { lineHeight: '1.18', letterSpacing: '-0.012em' }],
        h3: ['1.375rem', { lineHeight: '1.28' }],
        body: ['1rem', { lineHeight: '1.62' }],
        sm: ['0.875rem', { lineHeight: '1.55' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      borderRadius: { DEFAULT: 'var(--radius)', sm: 'var(--radius)', md: 'var(--radius)', lg: 'var(--radius)', xl: 'var(--radius)' },
      boxShadow: { overlay: 'var(--shadow-overlay)', none: 'none' },
      transitionTimingFunction: { brand: 'var(--ease)' },
      transitionDuration: { brand: 'var(--duration)' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down var(--duration) var(--ease)',
        'accordion-up': 'accordion-up var(--duration) var(--ease)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
