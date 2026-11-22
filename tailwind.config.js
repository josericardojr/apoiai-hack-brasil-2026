const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        ink: c('ink'),
        muted: c('muted'),
        line: c('line'),
        edge: c('edge'),
        primary: c('primary'),
        'primary-strong': c('primary-strong'),
        'primary-soft': c('primary-soft'),
        'on-primary': c('on-primary'),
        secondary: c('secondary'),
        'secondary-soft': c('secondary-soft'),
        'on-secondary': c('on-secondary'),
        danger: c('danger'),
        'danger-soft': c('danger-soft'),
        'on-danger': c('on-danger'),
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'Verdana', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        ring: {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--c-primary) / .55)' },
          '100%': { boxShadow: '0 0 0 18px rgb(var(--c-primary) / 0)' },
        },
        pop: {
          '0%': { transform: 'scale(.6)', opacity: 0 },
          '70%': { transform: 'scale(1.12)', opacity: 1 },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .35s ease-out both',
        'sheet-up': 'sheet-up .3s ease-out both',
        wave: 'wave .9s ease-in-out infinite',
        ring: 'ring 1.2s ease-out infinite',
        pop: 'pop .5s ease-out both',
      },
    },
  },
  plugins: [],
}
