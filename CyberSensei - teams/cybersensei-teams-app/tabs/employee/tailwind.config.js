/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0078d4',
          600: '#005fa3',
          700: '#004578',
          800: '#002c4d',
          900: '#001322',
        },
        success: {
          500: '#107c10',
          600: '#0c5e0c',
        },
        warning: {
          500: '#f7630c',
          600: '#c44e09',
        },
        danger: {
          500: '#d13438',
          600: '#a72629',
        },
      },
    },
  },
  plugins: [],
}

