/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bis: {
          navy: '#0A2540',
          blue: '#0F2C59',
          lightBlue: '#1E40AF',
          gold: '#D97706',
          saffron: '#EA580C',
          green: '#0F766E',
          slate: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 44, 89, 0.08)',
        'elevated': '0 10px 25px -5px rgba(10, 37, 64, 0.1), 0 8px 10px -6px rgba(10, 37, 64, 0.05)'
      }
    },
  },
  plugins: [],
}
