module.exports = {
  content: ['./public/**/*.html'],
  theme: {
    extend: {
      colors: {
        canvas: '#edf3f4',
        surface: '#ffffff',
        ink: '#112e36',
        muted: '#47636a',
        line: '#b6c9cc',
        accent: '#0a706b',
        'accent-soft': '#d6eae7',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(17, 24, 39, 0.08)',
      },
    },
  },
};
