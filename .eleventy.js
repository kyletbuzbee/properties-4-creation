/**
 * Eleventy Configuration
 * Properties 4 Creations - Veteran Housing Platform
 */

module.exports = function  (eleventyConfig) {
  // Passthrough copy for static assets from src
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/videos": "videos" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/search-index.json": "search-index.json" });
  eleventyConfig.addPassthroughCopy({ "src/_data": "_data" });
  eleventyConfig.addPassthroughCopy({ "src/_includes": "_includes" });
  eleventyConfig.addPassthroughCopy({ "src/design-system": "design-system" });
  
  
  // Copy public folder assets (images, etc) to root
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });


  // Copy root files needed for GitHub Pages
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  // Watch targets for development
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Add date filters
  eleventyConfig.addFilter("dateFormat", (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Add truncate filter for descriptions
  eleventyConfig.addFilter("truncate", (str, length = 120) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });

  // Browser sync config for development
  eleventyConfig.setBrowserSyncConfig({
    files: ['docs/**/*'],
    open: true,
    notify: false
  });

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
