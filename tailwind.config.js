
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{App,index}.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
       animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'fade-in-right': 'fade-in-right 0.3s ease-out',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
           '0%': { opacity: '0', transform: 'translateX(20px)' },
           '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
    },
  },
  plugins: [],
}
