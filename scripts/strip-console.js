/**
 * Console Log Stripping Script
 * Removes console statements from JavaScript files for production builds
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Strip console statements from JavaScript content
 * @param {string} content - JavaScript file content
 * @returns {string} - Content with console statements removed
 */
function stripConsoleLogs(content) {
  // Remove various console statements
  let stripped = content;
  
  // Remove console.log, console.warn, console.error, console.info, console.debug
  stripped = stripped.replace(/console\.(log|warn|error|info|debug|table|group|groupEnd|trace|assert|dir|dirxml|time|timeEnd|profile|profileEnd|count|clear)\([^)]*\);?/g, '');
  
  // Remove console statements with multi-line arguments
  stripped = stripped.replace(/console\.\w+\([^)]*\([^)]*\)[^)]*\);?/g, '');
  
  // Remove console statements with template literals
  stripped = stripped.replace(/console\.\w+\([^)]*\${[^}]*}[^)]*\);?/g, '');
  
  // Remove console statements with string concatenation
  stripped = stripped.replace(/console\.\w+\([^)]*\+[^)]*\);?/g, '');
  
  // Remove console statements with comments (edge cases)
  stripped = stripped.replace(/console\.\w+\([^)]*\/\/.*\);?/g, '');
  
  // Clean up multiple empty lines
  stripped = stripped.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Clean up lines that are now empty after console removal
  stripped = stripped.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed !== '' && !trimmed.startsWith('//');
  }).join('\n');
  
  return stripped;
}

/**
 * Process a single JavaScript file
 * @param {string} filePath - Path to the JavaScript file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stripped = stripConsoleLogs(content);
    
    // Only write if content changed
    if (stripped !== content) {
      fs.writeFileSync(filePath, stripped);
      console.log(`✓ Stripped console logs from ${filePath}`);
      return true;
    } else {
      console.log(`○ No console logs found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to strip console logs from all JS files
 */
function main() {
  // Find all JavaScript files in docs directory
  const jsFiles = glob.sync('docs/js/**/*.js');
  
  if (jsFiles.length === 0) {
    console.log('No JavaScript files found in docs/js/ directory');
    return;
  }
  
  console.log(`Found ${jsFiles.length} JavaScript files to process\n`);
  
  let processedCount = 0;
  let changedCount = 0;
  
  jsFiles.forEach(file => {
    if (processFile(file)) {
      changedCount++;
    }
    processedCount++;
  });
  
  console.log(`\n✓ Processed ${processedCount} files`);
  if (changedCount > 0) {
    console.log(`✓ Modified ${changedCount} files`);
  } else {
    console.log('✓ No changes needed');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { stripConsoleLogs, processFile };
