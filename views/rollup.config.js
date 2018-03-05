export default [{
  input: 'js/doc/translate.js',
  external: ['jquery'],
  output: {
    file: 'dist/js/doc/translate.js',
    format: 'cjs',
    globals: {
      jquery: '$'
    }
  }
}, {
  input: 'js/doc/revise.js',
  external: ['jquery'],
  output: {
    file: 'dist/js/doc/revise.js',
    format: 'cjs',
    globals: {
      jquery: '$'
    }
  }
}];
