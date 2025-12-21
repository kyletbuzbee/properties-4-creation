/**
 * Eleventy Configuration
 * Properties 4 Creations - Veteran Housing Platform
 */

module.exports = function (eleventyConfig) {
  // -----------------------------------------------------------------
  // PASSTHROUGH COPIES
  // -----------------------------------------------------------------
  
  // Static Assets
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/videos": "videos" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // Root Files
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/search-index.json": "search-index.json" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // GitHub Pages requirements (kept under src for single source of truth)
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

  // -----------------------------------------------------------------
  // REMOVED LINES (DO NOT UNCOMMENT)
  // -----------------------------------------------------------------
  // eleventyConfig.addPassthroughCopy({ "src/_data": "_data" });      <-- UNSAFE
  // eleventyConfig.addPassthroughCopy({ "src/_includes": "_includes" }); <-- UNSAFE
  
  // NOTE: If your JavaScript needs specific JSON data (like properties.json), 
  // copy ONLY that specific file, not the entire _data folder:
  // eleventyConfig.addPassthroughCopy({ "src/_data/properties.json": "data/properties.json" });

  // -----------------------------------------------------------------
  // FILTERS
  // -----------------------------------------------------------------

  // Date Filter
  eleventyConfig.addFilter("dateFormat", (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Truncate Filter
  eleventyConfig.addFilter("truncate", (str, length = 120) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });

  // -----------------------------------------------------------------
  // DEVELOPMENT CONFIG
  // -----------------------------------------------------------------
  
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  eleventyConfig.setBrowserSyncConfig({
    files: ['_site/**/*'],
    open: true,
    notify: false
  });

  // -----------------------------------------------------------------
  // RETURN OBJECT
  // -----------------------------------------------------------------
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes", // Eleventy looks here automatically for templates
      data: "_data"          // Eleventy looks here automatically for data
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
