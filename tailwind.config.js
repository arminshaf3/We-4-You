/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D0957',
          dark: '#080538',
          light: '#1B1475',
          subtle: '#241D96',
        },
        mint: {
          DEFAULT: '#35F5AD',
          dark: '#088F5B',       // High-contrast readable green for small text/labels on white
          darker: '#066842',
          pale: '#E6FBEF',
          surface: '#F0FDF6',
        },
        neutral: {
          soft: '#F7FAF8',
        },
        content: {
          body: '#334155',
          muted: '#64748B',
          heading: '#0D0957',
        },
        border: {
          subtle: '#E2E8F0',
          focus: '#35F5AD',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
      borderRadius: {
        'brand-sm': '10px',
        'brand': '14px',
        'brand-lg': '20px',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(13, 9, 87, 0.05)',
        'card': '0 10px 30px -4px rgba(13, 9, 87, 0.08)',
        'floating': '0 20px 40px -10px rgba(13, 9, 87, 0.12)',
      }
    },
  },
  plugins: [],
};
