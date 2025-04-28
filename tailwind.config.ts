
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        flashcard: {
          blue: '#3498db',
          'blue-dark': '#2980b9',
          green: '#2ecc71',
          'green-dark': '#27ae60',
          red: '#e74c3c',
          'red-dark': '#c0392b',
          yellow: '#f1c40f',
          'yellow-dark': '#f39c12',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'flip': {
          '0%, 100%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(180deg)' }
        },
        'pulse-success': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 204, 113, 0)' },
          '50%': { boxShadow: '0 0 0 15px rgba(46, 204, 113, 0.4)' }
        },
        'pulse-error': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(231, 76, 60, 0)' },
          '50%': { boxShadow: '0 0 0 15px rgba(231, 76, 60, 0.4)' }
        },
        'pulse-warning': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(241, 196, 15, 0)' },
          '50%': { boxShadow: '0 0 0 15px rgba(241, 196, 15, 0.4)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        'pulse-success': 'pulse-success 1.5s infinite',
        'pulse-error': 'pulse-error 1.5s infinite',
        'pulse-warning': 'pulse-warning 1.5s infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
