/**
 * Image Optimization Script
 * Properties 4 Creations - Performance Optimization
 * 
 * Generates responsive image sets (400w, 800w, 1200w, 1600w) in WebP format
 * Also creates placeholder images for lazy loading
 * 
 * Usage: npm run images:optimize
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  quality: 85,
  sizes: [400, 800, 1200, 1600],
  placeholderWidth: 32,
  placeholderQuality: 60,
  inputDirs: [
    'images//properties',
    'images//banners',
    'images//our-work-gallery',
    'images//before-after-comparison'
  ],
  outputFormat: 'webp'
};

/**
 * Optimize a single image and generate responsive variants
 * @param {string} inputPath - Path to the source image
 */
async function optimizeImage(inputPath) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const name = path.basename(inputPath, ext);
  
  // Skip if already a generated file
  if (name.includes('-placeholder') || name.match(/-\d+w$/)) {
    return;
  }
  
  console.log(`\nProcessing: ${inputPath}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`  Original: ${metadata.width}x${metadata.height}`);
    
    // Generate responsive sizes
    for (const size of CONFIG.sizes) {
      // Skip if original is smaller than target size
      if (metadata.width && metadata.width < size) {
        console.log(`  ⏭ Skipping ${size}w (original smaller)`);
        continue;
      }
      
      const outputPath = path.join(dir, `${name}-${size}w.webp`);
      
      await sharp(inputPath)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: CONFIG.quality })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  ✓ Generated ${size}w version (${sizeKB}KB)`);
    }
    
    // Generate placeholder (32px width, blurred)
    const placeholderPath = path.join(dir, `${name}-placeholder.jpg`);
    await sharp(inputPath)
      .resize(CONFIG.placeholderWidth, null)
      .blur(2)
      .jpeg({ quality: CONFIG.placeholderQuality })
      .toFile(placeholderPath);
    
    const placeholderStats = fs.statSync(placeholderPath);
    console.log(`  ✓ Generated placeholder (${(placeholderStats.size / 1024).toFixed(1)}KB)`);
    
  } catch (error) {
    console.error(`  ✗ Error processing ${inputPath}:`, error.message);
  }
}

/**
 * Generate srcset string for an image
 * @param {string} baseName - Base name of the image (without extension)
 * @param {string} dir - Directory path
 * @returns {string} srcset attribute value
 */
function generateSrcset(baseName, dir) {
  const srcsetParts = [];
  
  for (const size of CONFIG.sizes) {
    const filePath = path.join(dir, `${baseName}-${size}w.webp`);
    if (fs.existsSync(filePath)) {
      srcsetParts.push(`${filePath} ${size}w`);
    }
  }
  
  return srcsetParts.join(', ');
}

/**
 * Main execution function
 */
async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('============================\n');
  console.log(`Quality: ${CONFIG.quality}%`);
  console.log(`Sizes: ${CONFIG.sizes.join(', ')}px`);
  console.log(`Format: ${CONFIG.outputFormat.toUpperCase()}\n`);
  
  let totalImages = 0;
  let processedImages = 0;
  
  for (const inputDir of CONFIG.inputDirs) {
    if (!fs.existsSync(inputDir)) {
      console.log(`⚠️  Directory not found: ${inputDir}`);
      continue;
    }
    
    console.log(`\n📁 Processing directory: ${inputDir}`);
    console.log('-'.repeat(50));
    
    // Find all images (excluding already processed ones)
    const images = glob.sync(`${inputDir}/*.{jpg,jpeg,png,webp}`, {
      ignore: [
        `${inputDir}/*-placeholder.*`,
        `${inputDir}/*-*w.webp`
      ]
    });
    
    totalImages += images.length;
    
    for (const img of images) {
      await optimizeImage(img);
      processedImages++;
    }
  }
  
  console.log('\n============================');
  console.log(`✅ Processed ${processedImages}/${totalImages} images`);
  console.log('\nNext steps:');
  console.log('1. Update HTML files to use responsive <picture> elements');
  console.log('2. Add loading='lazy' to images below the fold');
  console.log('3. Use placeholder images for progressive loading');
}

// Run the script
main().catch(console.error);
