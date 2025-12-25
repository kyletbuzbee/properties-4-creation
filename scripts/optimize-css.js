/**
 * CSS Optimization Script
 * Properties 4 Creations
 * 
 * Optimizes CSS by removing unused styles, inlining critical CSS,
 * and creating optimized versions for better performance.
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

/**
 * Critical CSS extraction for above-the-fold content
 */
const CRITICAL_PATHS = [
  'src/index.html',
  'src/about.html',
  'src/properties.html',
  'src/apply.html',
  'src/contact.html'
];

const CRITICAL_SELECTORS = [
  // Header and navigation
  '.header-glass', '.navbar', '.nav-container', '.nav-brand',
  '.nav-menu', '.nav-brand', '.brand-link', '.brand-logo',
  '.brand-text', '.menu-toggle', '.cta-link',
  
  // Hero section
  '.hero', '.hero-content', '.hero-text', '.hero h2',
  '.hero-subtitle', '.hero-tagline', '.hero-ctas',
  
  // Skip link
  '.skip-link',
  
  // Footer
  '.footer', '.footer-content', '.footer-section',
  
  // Basic layout
  '.container', '.grid', '.flex',
  
  // Buttons
  '.btn', '.btn-primary', '.btn-secondary',
  
  // Forms
  '.form-container', '.form-wrapper', '.form-group',
  '.form-group label', '.form-group input',
  '.form-group textarea', '.submit-btn',
  
  // Accessibility
  '.text-navy-on-beige', '.text-navy-on-white',
  '.text-gold-on-navy', '.text-white-on-navy'
];

/**
 * Remove unused CSS styles
 */
async function removeUnusedCSS () {
  const inputCSS = path.join(__dirname, '../src/css/style.optimized.css');
  const outputCSS = path.join(__dirname, '../src/css/style.purged.css');
  
  if (!fs.existsSync(inputCSS)) {
    console.log('Input CSS file not found, skipping unused CSS removal');
    return;
  }

  try {
    const result = await postcss([
      purgecss({
        content: CRITICAL_PATHS,
        defaultExtractor: content => {
          // Extract class names and ids
          const broadMatches = content.match(/[^<>"'`\s]*[a-zA-Z0-9-][^<>"'`\s]*/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.]*[a-zA-Z0-9-][^<>"'`\s.]*/g) || [];
          return broadMatches.concat(innerMatches);
        },
        safelist: [
          // Keep critical selectors
          ...CRITICAL_SELECTORS,
          // Keep utility classes
          /^btn-/,
          /^text-/,
          /^bg-/,
          /^border-/,
          /^shadow-/,
          /^rounded-/,
          /^p-/,
          /^m-/,
          /^flex/,
          /^grid/,
          /^container/,
          // Keep dark mode classes
          /^data-theme/,
          // Keep animation classes
          /^animate-/,
          // Keep focus states
          /^focus:/,
          /^hover:/,
          // Keep responsive classes
          /^sm:/,
          /^md:/,
          /^lg:/,
          /^xl:/
        ]
      })
    ]).process(fs.readFileSync(inputCSS, 'utf8'), {
      from: inputCSS,
      to: outputCSS
    });

    fs.writeFileSync(outputCSS, result.css);
    console.log(`Unused CSS removed. Size reduced to: ${Math.round(result.css.length / 1024)}KB`);
    
  } catch (error) {
    console.error('Error removing unused CSS:', error.message);
  }
}

/**
 * Inline critical CSS for above-the-fold content
 */
function inlineCriticalCSS () {
  const criticalCSS = `
    /* CRITICAL CSS - Above the fold styles */
    :root {
      --navy: #0b1120;
      --gold: #c28e5a;
      --beige: #f5f5f0;
      --white: #ffffff;
      --shadow-sm: 0 2px 8px rgba(11, 17, 32, 0.1);
      --btn-padding: 0.75rem 1.5rem;
      --btn-border-radius: 5px;
      --btn-font-weight: 600;
    }
    
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; background-color: var(--beige); color: var(--navy); line-height: 1.6; }
    
    .header-glass { position: fixed; top: 0; width: 100%; background: rgba(11, 17, 32, 0.7); backdrop-filter: blur(10px); z-index: 1000; }
    .navbar { padding: 1rem 0; }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
    .nav-brand h1 { font-family: 'Merriweather', serif; color: white; font-size: 1.5rem; font-weight: 700; }
    .cta-link { background-color: var(--gold); color: var(--navy); padding: 0.5rem 1rem; border-radius: 5px; }
    
    .skip-link { position: absolute; top: -40px; left: 0; background: var(--gold); color: var(--navy); padding: 0.5rem 1rem; z-index: 100; }
    .skip-link:focus { top: 0; }
    
    .hero { margin-top: 60px; background: linear-gradient(135deg, rgba(11, 17, 32, 0.8) 0%, rgba(11, 17, 32, 0.6) 100%), url('/images/backgrounds/hero-pattern.svg'); color: white; padding: 6rem 1rem; text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; }
    .hero-content { position: relative; z-index: 2; max-width: 800px; background: rgba(0, 0, 0, 0.3); padding: 2rem; border-radius: 10px; }
    .hero h2 { font-family: 'Merriweather', serif; font-size: 3rem; font-weight: 700; margin-bottom: 1rem; }
    .hero-ctas { display: flex; gap: 1rem; justify-content: center; }
    
    .btn { padding: var(--btn-padding); border: none; border-radius: var(--btn-border-radius); font-weight: var(--btn-font-weight); cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .btn-primary { background-color: var(--gold); color: var(--navy); }
    .btn-secondary { background-color: transparent; color: white; border: 2px solid var(--gold); }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); }
    .flex { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    
    @media (max-width: 768px) {
      .hero { padding: 4rem 0.75rem; min-height: 50vh; }
      .hero h2 { font-size: 2rem; }
      .nav-menu { display: none; }
      .menu-toggle { display: flex; }
    }
  `;

  // Write critical CSS to a separate file
  const criticalCSSPath = path.join(__dirname, '../src/css/critical.css');
  fs.writeFileSync(criticalCSSPath, criticalCSS);
  console.log('Critical CSS inlined successfully');
}

/**
 * Optimize CSS further with cssnano
 */
async function optimizeCSS () {
  const inputCSS = path.join(__dirname, '../src/css/style.purged.css');
  const outputCSS = path.join(__dirname, '../src/css/style.optimized.css');
  
  if (!fs.existsSync(inputCSS)) {
    console.log('Purged CSS file not found, using original');
    return;
  }

  try {
    const result = await postcss([
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          reduceIdents: false, // Keep CSS custom properties
          zindex: false
        }]
      })
    ]).process(fs.readFileSync(inputCSS, 'utf8'), {
      from: inputCSS,
      to: outputCSS
    });

    fs.writeFileSync(outputCSS, result.css);
    console.log(`CSS optimized. Final size: ${Math.round(result.css.length / 1024)}KB`);
    
  } catch (error) {
    console.error('Error optimizing CSS:', error.message);
  }
}

/**
 * Main optimization function
 */
async function optimizeCSSFile () {
  console.log('Starting CSS optimization...');
  
  try {
    // Step 1: Remove unused CSS
    await removeUnusedCSS();
    
    // Step 2: Inline critical CSS
    inlineCriticalCSS();
    
    // Step 3: Optimize with cssnano
    await optimizeCSS();
    
    console.log('CSS optimization completed successfully');
    
  } catch (error) {
    console.error('CSS optimization failed:', error.message);
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeCSSFile();
}

module.exports = { optimizeCSSFile };