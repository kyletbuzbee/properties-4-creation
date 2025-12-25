#!/usr/bin/env node

/**
 * Script to fix CSS/JS paths in docs/ directory
 * Changes:
 * - public/css/style.css → /css/style.css
 * - public/js/main.js → /js/main.js
 * - public/manifest.json → /manifest.json
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

function fixFilePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix CSS path
  const cssRegex = /href="public\/css\/style\.css"/g;
  if (cssRegex.test(content)) {
    content = content.replace(cssRegex, 'href="/css/style.css"');
    changed = true;
  }
  
  // Fix JS path
  const jsRegex = /src="public\/js\/main\.js"/g;
  if (jsRegex.test(content)) {
    content = content.replace(jsRegex, 'src="/js/main.js"');
    changed = true;
  }
  
  // Fix manifest path
  const manifestRegex = /href="public\/manifest\.json"/g;
  if (manifestRegex.test(content)) {
    content = content.replace(manifestRegex, 'href="/manifest.json"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed paths in: ${filePath}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      fixFilePaths(filePath);
    }
  });
}

// Start processing
console.log('🔧 Fixing CSS/JS paths in docs/ directory...');
processDirectory(docsDir);
console.log('✨ Path fixing complete!');