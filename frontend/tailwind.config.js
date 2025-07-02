/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
      './App.tsx',
      './main.tsx',
      './components/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          pink: {
            DEFAULT: '#f06595',
            light: '#fff0f6',
            soft: '#f7c6d9',
            alt: '#f4b6c2',
          },
        },
        borderRadius: {
          xl: '12px',
          '2xl': '16px',
        },
      },
    },
    plugins: [],
  };
  