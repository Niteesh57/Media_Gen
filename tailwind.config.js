/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        glass: {
          light: 'rgba(255, 255, 255, 0.15)',
          dark: 'rgba(15, 17, 23, 0.65)',
          border: 'rgba(255, 255, 255, 0.18)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        macGenie: {
          '0%': { transform: 'scale(0.1) translateY(200px)', opacity: '0' },
          '80%': { transform: 'scale(1.02) translateY(-10px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        animatedBeam: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        pulseGlow: 'pulseGlow 3s infinite ease-in-out',
        macGenie: 'macGenie 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        animatedBeam: 'animatedBeam 2.5s infinite linear',
      }
    },
  },
  plugins: [],
}
