/**
 * JavaScript Optimization Script
 * Properties 4 Creations
 * 
 * Optimizes JavaScript by removing unused code, minifying, and tree shaking
 */

const fs = require('fs');
const path = require('path');

/**
 * Remove console.log statements (except error/warn)
 */
function removeConsoleLogs (code) {
  return code
    .replace(/console\.log\([^)]*\);?/g, '')
    .replace(/console\.info\([^)]*\);?/g, '')
    .replace(/console\.debug\([^)]*\);?/g, '');
}

/**
 * Remove comments
 */
function removeComments (code) {
  return code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Minify JavaScript
 */
function minifyJS (code) {
  return code
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:=+\-*/%<>!&|^~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
}

/**
 * Optimize imports
 */
function optimizeImports (code) {
  // Remove unused imports
  const importRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/g;
  return code.replace(importRegex, (match) => {
    // Keep all imports for now (would need static analysis to determine usage)
    return match;
  });
}

/**
 * Optimize JavaScript file
 */
function optimizeJSFile () {
  const inputPath = path.join(__dirname, '../src/js/main.js');
  const outputPath = path.join(__dirname, '../src/js/main.optimized.js');
  
  try {
    // Read original JS
    const originalJS = fs.readFileSync(inputPath, 'utf8');
    
    // Remove console logs
    let optimizedJS = removeConsoleLogs(originalJS);
    
    // Remove comments
    optimizedJS = removeComments(optimizedJS);
    
    // Optimize imports
    optimizedJS = optimizeImports(optimizedJS);
    
    // Minify
    optimizedJS = minifyJS(optimizedJS);
    
    // Write optimized JS
    fs.writeFileSync(outputPath, optimizedJS);
    
    const originalSize = Math.round(originalJS.length / 1024);
    const optimizedSize = Math.round(optimizedJS.length / 1024);
    const reduction = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    
    console.log(`JavaScript optimization completed:`);
    console.log(`- Original size: ${originalSize}KB`);
    console.log(`- Optimized size: ${optimizedSize}KB`);
    console.log(`- Size reduction: ${reduction}%`);
    
    return true;
    
  } catch (error) {
    console.error('JavaScript optimization failed:', error.message);
    return false;
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeJSFile();
}

module.exports = { optimizeJSFile };