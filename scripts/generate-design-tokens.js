/**
 * Design Token Generator
 * Properties 4 Creations - Design System
 * 
 * Converts JSON design tokens to CSS custom properties
 * 
 * Usage: npm run tokens:generate
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: 'src/design-system/tokens/all-tokens.json',
  outputFile: 'src/css/base/design-tokens.css',
  prefix: ''  // Optional prefix for CSS variables
};

/**
 * Convert camelCase to kebab-case
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Recursively generate CSS variables from token object
 * @param {Object} tokens - Token object
 * @param {string} prefix - Current prefix path
 * @returns {string} CSS variable declarations
 */
function generateCSSVariables(tokens, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(tokens)) {
    const varName = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value.value !== undefined) {
        // Leaf node with value property
        css += `  --${varName}: ${value.value};\n`;
      } else {
        // Nested object - recurse
        css += generateCSSVariables(value, varName);
      }
    } else if (typeof value !== 'object') {
      // Primitive value
      css += `  --${varName}: ${value};\n`;
    }
  }
  
  return css;
}

/**
 * Generate utility classes from tokens
 * @param {Object} tokens - Token object
 * @returns {string} CSS utility classes
 */
function generateUtilityClasses(tokens) {
  let css = '\n/* ========================================\n';
  css += '   Utility Classes (Generated)\n';
  css += '   ======================================== */\n\n';
  
  // Spacing utilities
  if (tokens.spacing) {
    css += '/* Margin utilities */\n';
    for (const [key, value] of Object.entries(tokens.spacing)) {
      const val = value.value || value;
      css += `.u-mt-${key} { margin-top: ${val}; }\n`;
      css += `.u-mb-${key} { margin-bottom: ${val}; }\n`;
      css += `.u-ml-${key} { margin-left: ${val}; }\n`;
      css += `.u-mr-${key} { margin-right: ${val}; }\n`;
      css += `.u-mx-${key} { margin-left: ${val}; margin-right: ${val}; }\n`;
      css += `.u-my-${key} { margin-top: ${val}; margin-bottom: ${val}; }\n`;
    }
    
    css += '\n/* Padding utilities */\n';
    for (const [key, value] of Object.entries(tokens.spacing)) {
      const val = value.value || value;
      css += `.u-pt-${key} { padding-top: ${val}; }\n`;
      css += `.u-pb-${key} { padding-bottom: ${val}; }\n`;
      css += `.u-pl-${key} { padding-left: ${val}; }\n`;
      css += `.u-pr-${key} { padding-right: ${val}; }\n`;
      css += `.u-px-${key} { padding-left: ${val}; padding-right: ${val}; }\n`;
      css += `.u-py-${key} { padding-top: ${val}; padding-bottom: ${val}; }\n`;
      css += `.u-p-${key} { padding: ${val}; }\n`;
    }
  }
  
  // Text color utilities
  if (tokens.color) {
    css += '\n/* Text color utilities */\n';
    
    // Primary colors
    if (tokens.color.primary) {
      for (const [key, value] of Object.entries(tokens.color.primary)) {
        const val = value.value || value;
        css += `.u-text-${toKebabCase(key)} { color: ${val}; }\n`;
        css += `.u-bg-${toKebabCase(key)} { background-color: ${val}; }\n`;
      }
    }
    
    // Semantic colors
    if (tokens.color.semantic) {
      for (const [key, value] of Object.entries(tokens.color.semantic)) {
        const val = value.value || value;
        css += `.u-text-${key} { color: ${val}; }\n`;
        css += `.u-bg-${key} { background-color: ${val}; }\n`;
      }
    }
  }
  
  // Font size utilities
  if (tokens.typography && tokens.typography.fontSize) {
    css += '\n/* Font size utilities */\n';
    for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
      const val = value.value || value;
      css += `.u-text-${key} { font-size: ${val}; }\n`;
    }
  }
  
  // Font weight utilities
  if (tokens.typography && tokens.typography.fontWeight) {
    css += '\n/* Font weight utilities */\n';
    for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
      const val = value.value || value;
      css += `.u-font-${key} { font-weight: ${val}; }\n`;
    }
  }
  
  return css;
}

/**
 * Generate dark mode overrides
 * @returns {string} CSS dark mode variables
 */
function generateDarkMode() {
  return `
/* ========================================
   Dark Mode Overrides
   ======================================== */

[data-theme='dark'] {
  --color-primary-navy: #1a2332;
  --color-primary-beige: #1F2937;
  --color-neutral-white: #111827;
  --color-neutral-black: #FFFFFF;
  --color-neutral-gray-50: #1F2937;
  --color-neutral-gray-100: #374151;
  --color-neutral-gray-200: #4B5563;
  --color-neutral-gray-800: #F3F4F6;
  --color-neutral-gray-900: #F9FAFB;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-primary-navy: #1a2332;
    --color-primary-beige: #1F2937;
    --color-neutral-white: #111827;
    --color-neutral-black: #FFFFFF;
    --color-neutral-gray-50: #1F2937;
    --color-neutral-gray-100: #374151;
  }
}
`;
}

/**
 * Main execution function
 */
function main() {
  console.log('🎨 Design Token Generator');
  console.log('=========================\n');
  
  // Read tokens file
  const tokensPath = path.join(process.cwd(), CONFIG.inputFile);
  
  if (!fs.existsSync(tokensPath)) {
    console.error(`❌ Token file not found: ${tokensPath}`);
    process.exit(1);
  }
  
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  console.log(`✓ Loaded tokens from ${CONFIG.inputFile}`);
  
  // Generate CSS
  let cssOutput = `/**
 * Design Tokens - Properties 4 Creations
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from: ${CONFIG.inputFile}
 * Generated at: ${new Date().toISOString()}
 * 
 * To regenerate: npm run tokens:generate
 */

/* ========================================
   CSS Custom Properties (Design Tokens)
   ======================================== */

:root {
`;
  
  // Generate CSS variables
  cssOutput += generateCSSVariables(tokens);
  cssOutput += '}\n';
  
  // Add dark mode
  cssOutput += generateDarkMode();
  
  // Add utility classes
  cssOutput += generateUtilityClasses(tokens);
  
  // Ensure output directory exists
  const outputDir = path.dirname(path.join(process.cwd(), CONFIG.outputFile));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ Created directory: ${outputDir}`);
  }
  
  // Write output file
  const outputPath = path.join(process.cwd(), CONFIG.outputFile);
  fs.writeFileSync(outputPath, cssOutput);
  
  // Count generated variables
  const varCount = (cssOutput.match(/--[\w-]+:/g) || []).length;
  const utilityCount = (cssOutput.match(/\.u-[\w-]+/g) || []).length;
  
  console.log(`✓ Generated ${varCount} CSS variables`);
  console.log(`✓ Generated ${utilityCount} utility classes`);
  console.log(`✓ Output written to: ${CONFIG.outputFile}`);
  console.log('\n✅ Design tokens generated successfully!');
}

// Run the script
main();
