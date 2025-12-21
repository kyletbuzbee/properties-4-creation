/**
 * PostCSS Configuration
 * Properties 4 Creations
 */

module.exports = {
  plugins: [
    require('autoprefixer')({
      // Support last 2 versions of browsers and IE 11
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead',
        'not ie <= 10'
      ]
    }),
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        minifyGradients: true
      }]
    })
  ]
};
