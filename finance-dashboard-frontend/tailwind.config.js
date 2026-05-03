/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom design system colors
        green: {
          50: '#EEF6E1',
          100: '#EAF3DE',
          200: '#CFE2AE',
          300: '#C0DD97',
          400: '#97C459',
          500: '#639922',
          600: '#4D7D1A',
          700: '#3B6D11',
          800: '#1D9E75',
          900: '#0F6E56',
        },
        orange: {
          50: '#FFF0EA',
          100: '#FFF0EB',
          200: '#F3C5B5',
          300: '#F3DFC2',
          400: '#D6943F',
          500: '#D85A30',
          600: '#B44624',
          700: '#993C1D',
          800: '#94612D',
          900: '#B1681E',
        },
        tan: {
          50: '#FCFBF7',
          100: '#FAFAF7',
          200: '#F9F7F1',
          300: '#F8F6EE',
          400: '#F4F2EC',
          500: '#F0EDE6',
          600: '#EAE7DF',
          700: '#E9E5D9',
          800: '#E8E3D7',
          900: '#E4E0D6',
        },
        neutral: {
          50: '#F0F4EA',
          100: '#F1F4EC',
          200: '#F4F2EC',
          300: '#C0BAA8',
          400: '#A09C8E',
          500: '#8A8677',
          600: '#7A7669',
          700: '#5A5850',
          800: '#4F4D45',
          900: '#1A1A16',
        },
        error: {
          50: '#FFF6F4',
          100: '#FFF0EB',
          200: '#F0B5A0',
          300: '#D85A30',
          400: '#B44624',
          500: '#993C1D',
        },
        info: {
          50: '#F0F4EA',
          100: '#F1F4EC',
          500: '#5A614C',
          700: '#4A5F31',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease both',
        shimmer: 'shimmer 1.4s infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, #EAE7DF 25%, #F4F2EC 50%, #EAE7DF 75%)',
      },
      backgroundSize: {
        shimmer: '200% 100%',
      },
    },
  },
  plugins: [],
}