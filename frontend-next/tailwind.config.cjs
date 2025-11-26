module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9ff',
          100: '#e0f2fe',
          500: '#0d6efd',
          600: '#0b5ed7',
          700: '#0a58ca'
        }
      }
    }
  },
  plugins: []
};
