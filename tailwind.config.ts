import type { Config } from 'tailwindcss';

/**
 * Tailwind maps onto the CSS-variable tokens in globals.css (DESIGN.md §2).
 * Semantic names (canvas/surface/ink/accent/status) — never raw hex in JSX.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        micro: ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      colors: {
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          sunken: 'var(--surface-sunken)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        },
        status: {
          free: 'var(--status-free)',
          'free-bg': 'var(--status-free-bg)',
          soon: 'var(--status-soon)',
          'soon-bg': 'var(--status-soon-bg)',
          busy: 'var(--status-busy)',
          'busy-bg': 'var(--status-busy-bg)',
          unknown: 'var(--status-unknown)',
          'unknown-bg': 'var(--status-unknown-bg)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        e1: '0 1px 2px rgb(0 0 0 / 0.04)',
        e2: '0 4px 12px rgb(0 0 0 / 0.06)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        base: '220ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
