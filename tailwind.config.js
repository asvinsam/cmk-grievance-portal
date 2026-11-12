/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8f0f8',
          100: '#c5d6ec',
          500: '#1a4a7a',
          700: '#0d3560',
          900: '#0B2A4A',
          950: '#071d35'
        },
        saffron: {
          50: '#fff8e1',
          100: '#ffecb3',
          400: '#ffca28',
          500: '#E08A00',
          600: '#c47b00',
          700: '#a86900'
        },
        status: {
          submitted: '#6B7280',
          underreview: '#3B82F6',
          inprogress: '#F59E0B',
          resolved: '#1E7B34',
          reopened: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif']
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.6' }]
      }
    }
  },
  plugins: []
};
