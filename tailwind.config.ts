import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        micro: ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '600' }],
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
          border: 'var(--accent-border)',
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
        pastel: {
          mint: 'var(--pastel-mint-bg)',
          'mint-text': 'var(--pastel-mint-text)',
          butter: 'var(--pastel-butter-bg)',
          'butter-text': 'var(--pastel-butter-text)',
          sky: 'var(--pastel-sky-bg)',
          'sky-text': 'var(--pastel-sky-text)',
          lavender: 'var(--pastel-lavender-bg)',
          'lavender-text': 'var(--pastel-lavender-text)',
          coral: 'var(--pastel-coral-bg)',
          'coral-text': 'var(--pastel-coral-text)',
          sage: 'var(--pastel-sage-bg)',
          'sage-text': 'var(--pastel-sage-text)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        editorial: '-0.035em',
        tightest: '-0.04em',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 1px rgba(0, 0, 0, 0.02)',
        e2: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        e3: '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'glow-accent': '0 0 20px -4px rgba(27, 67, 50, 0.35)',
        'glow-free': '0 0 16px -4px rgba(16, 185, 129, 0.35)',
      },
      transitionDuration: {
        instant: '120ms',
        fast: '180ms',
        base: '280ms',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        cinematic: 'cubic-bezier(0.32, 0.72, 0, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
