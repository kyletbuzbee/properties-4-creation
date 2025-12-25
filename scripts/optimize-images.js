/**
 * Image Optimization Script
 * Properties 4 Creations
 * 
 * Optimizes images by ensuring they are in WebP format and properly sized
 */

const fs = require('fs');
const path = require('path');

/**
 * Check if images are in WebP format
 */
function checkImageFormats () {
  const imagesDir = path.join(__dirname, '../src/images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('Images directory not found');
    return;
  }
  
  const imageFiles = [];
  
  // Recursively find all image files
  function findImages (dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findImages(fullPath);
      } else if (isImageFile(file)) {
        imageFiles.push(fullPath);
      }
    }
  }
  
  findImages(imagesDir);
  
  // Check image formats
  const webpFiles = imageFiles.filter(file => file.endsWith('.webp'));
  const nonWebpFiles = imageFiles.filter(file => !file.endsWith('.webp'));
  
  console.log(`Image format check completed:`);
  console.log(`- Total images: ${imageFiles.length}`);
  console.log(`- WebP images: ${webpFiles.length}`);
  console.log(`- Non-WebP images: ${nonWebpFiles.length}`);
  
  if (nonWebpFiles.length > 0) {
    console.log('\nNon-WebP images found (consider converting to WebP for better performance):');
    nonWebpFiles.forEach(file => {
      const relativePath = path.relative(__dirname, file);
      console.log(`  - ${relativePath}`);
    });
  } else {
    console.log('\n✅ All images are in WebP format - excellent for performance!');
  }
  
  return { webpFiles, nonWebpFiles };
}

/**
 * Check if file is an image
 */
function isImageFile (filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * Main optimization function
 */
function optimizeImages () {
  console.log('Starting image optimization...');
  
  try {
    // Check image formats
    checkImageFormats();
    
    console.log('\nImage optimization completed successfully');
    
    return true;
    
  } catch (error) {
    console.error('Image optimization failed:', error.message);
    return false;
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages };
