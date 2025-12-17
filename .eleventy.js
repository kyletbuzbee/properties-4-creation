/**
 * Eleventy Configuration
 * Properties 4 Creations - Veteran Housing Platform
 */

module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets from src
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/videos": "videos" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/search-index.json": "search-index.json" });
  eleventyConfig.addPassthroughCopy({ "src/_data": "_data" });
  
<<<<<<< HEAD
  // Copy  folder assets
  eleventyConfig.addPassthroughCopy({ "": "." });
  
  // Copy root files needed for GitHub Pages
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy(".nojekyll");
=======
  // Copy public folder assets (images, etc) to root
  eleventyConfig.addPassthroughCopy({ "public/images": "images" });
>>>>>>> 6af3669f28d73f2a14e5f079df1e2dcef8707d0e

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
