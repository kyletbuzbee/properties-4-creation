/**
 * Simple CSS Optimization Script
 * Properties 4 Creations
 * 
 * Optimizes CSS by removing comments, whitespace, and redundant styles
 */

const fs = require('fs');
const path = require('path');

/**
 * Remove comments from CSS
 */
function removeComments (css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Minify CSS by removing whitespace and newlines
 */
function minifyCSS (css) {
  return css
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\/\*.*?\*\//g, '')
    .replace(/@media\s+\(/g, '@media (')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/\n/g, '\n')
    .replace(/\n/g, '\n')
    .replace(/\n/g, '\n')
    .replace(/\n/g, '\n')
    .trim();
}

/**
 * Remove duplicate CSS rules
 */
function removeDuplicates (css) {
  const lines = css.split('}');
  const uniqueLines = [];
  const seen = new Set();
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      uniqueLines.push(trimmed);
    }
  }
  
  return uniqueLines.join('}') + '}';
}

/**
 * Optimize CSS file
 */
function optimizeCSSFile () {
  const inputPath = path.join(__dirname, '../src/css/style.css');
  const outputPath = path.join(__dirname, '../src/css/style.optimized.css');
  
  try {
    // Read original CSS
    const originalCSS = fs.readFileSync(inputPath, 'utf8');
    
    // Remove comments
    let optimizedCSS = removeComments(originalCSS);
    
    // Remove duplicates
    optimizedCSS = removeDuplicates(optimizedCSS);
    
    // Minify
    optimizedCSS = minifyCSS(optimizedCSS);
    
    // Write optimized CSS
    fs.writeFileSync(outputPath, optimizedCSS);
    
    const originalSize = Math.round(originalCSS.length / 1024);
    const optimizedSize = Math.round(optimizedCSS.length / 1024);
    const reduction = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    
    console.log(`CSS optimization completed:`);
    console.log(`- Original size: ${originalSize}KB`);
    console.log(`- Optimized size: ${optimizedSize}KB`);
    console.log(`- Size reduction: ${reduction}%`);
    
    return true;
    
  } catch (error) {
    console.error('CSS optimization failed:', error.message);
    return false;
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeCSSFile();
}

module.exports = { optimizeCSSFile };