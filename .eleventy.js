const Image = require('@11ty/eleventy-img');

module.exports = function(eleventyConfig) {
  // ============================================
  // PASSTHROUGH COPY
  // ============================================
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'src/js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'src/images': 'images' });
  eleventyConfig.addPassthroughCopy({ 'src/manifest.json': 'manifest.json' });
  eleventyConfig.addPassthroughCopy('src/CNAME');
  eleventyConfig.addPassthroughCopy('src/.nojekyll');

  // ============================================
  // CUSTOM FILTERS
  // ============================================
  
  // Limit Filter (for property listings)
  eleventyConfig.addFilter('limit', (array, limit) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, limit);
  });

  // Date Filter
  eleventyConfig.addFilter('formatDate', (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  eleventyConfig.addFilter('truncate', (text, limit) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  });

  // ============================================
  // COLLECTIONS
  // ============================================
  eleventyConfig.addCollection('posts', function(collectionApi) {
    return collectionApi.getFilteredByGlob('src/blog/**/*.md');
  });

  // ============================================
  // IMAGE SHORTCODE (Optional - requires setup)
  // ============================================
  eleventyConfig.addShortcode('image', async function(src, alt, sizes = '100vw') {
    try {
      let metadata = await Image(src, {
        widths: [400, 800, 1200],
        formats: ['webp', 'jpeg'],
        outputDir: './_site/images/optimized/',
        urlPath: '/images/optimized/'
      });

      let imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async'
      };

      return Image.generateHTML(metadata, imageAttributes);
    } catch (error) {
      console.warn(`Image optimization failed for ${src}:`, error.message);
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
  });

  // ============================================
  // WATCH TARGETS
  // ============================================
  eleventyConfig.addWatchTarget('./src/css/');
  eleventyConfig.addWatchTarget('./src/js/');

  // ============================================
  // BROWSERSYNC CONFIG
  // ============================================
  eleventyConfig.setBrowserSyncConfig({
    files: ['./_site/css/**/*.css', './_site/js/**/*.js'],
    open: true,
    notify: false
  });

  // ============================================
  // RETURN CONFIG
  // ============================================
  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
