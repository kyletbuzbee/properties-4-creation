#!/usr/bin/env node

/**
 * SRI Hash Generator for External CDN Resources
 * Generates Subresource Integrity hashes for external scripts and stylesheets
 */

const https = require('https');
const crypto = require('crypto');

/**
 * External CDN resources that need SRI hashes
 */
const externalResources = [
    // Lucide Icons
    'https://unpkg.com/lucide@latest/dist/umd/lucide.css',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
    
    // Leaflet Maps
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
    
    // Google Fonts (if needed)
    'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600&display=swap'
];

/**
 * Generate SRI hash for a given content
 * @param {string} content - The content to hash
 * @param {string} algorithm - Hash algorithm (sha384, sha512)
 * @returns {string} Base64 encoded hash
 */
function generateSRIHash(content, algorithm = 'sha384') {
    return crypto
        .createHash(algorithm)
        .update(content)
        .digest('base64');
}

/**
 * Fetch content from URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} Content as string
 */
function fetchContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);
    });
}

/**
 * Generate SRI attributes for a resource
 * @param {string} url - Resource URL
 * @returns {Promise<Object>} Object with url, integrity, and crossorigin
 */
async function generateSRIAttributes(url) {
    try {
        console.log(`Generating SRI for: ${url}`);
        const content = await fetchContent(url);
        const integrity = generateSRIHash(content);
        
        return {
            url,
            integrity: `${integrity}`,
            crossorigin: 'anonymous'
        };
    } catch (error) {
        console.error(`Failed to generate SRI for ${url}:`, error.message);
        return {
            url,
            integrity: null,
            crossorigin: 'anonymous',
            error: error.message
        };
    }
}

/**
 * Main function to generate SRI hashes for all resources
 */
async function main() {
    console.log('🔐 Generating SRI Hashes for External CDN Resources\n');
    
    const results = [];
    
    for (const url of externalResources) {
        const attributes = await generateSRIAttributes(url);
        results.push(attributes);
        
        if (attributes.integrity) {
            console.log(`✅ Generated: ${url}`);
            console.log(`   Integrity: sha384-${attributes.integrity}`);
            console.log(`   Crossorigin: ${attributes.crossorigin}\n`);
        } else {
            console.log(`❌ Failed: ${url}`);
            console.log(`   Error: ${attributes.error}\n`);
        }
    }
    
    // Generate HTML examples
    console.log('📝 HTML Integration Examples:\n');
    
    results.forEach(result => {
        if (result.integrity) {
            if (result.url.includes('.css')) {
                console.log(`<!-- Stylesheet with SRI -->`);
                console.log(`<link rel="stylesheet" href="${result.url}"`);
                console.log(`      integrity="sha384-${result.integrity}" crossorigin="anonymous">`);
            } else if (result.url.includes('.js')) {
                console.log(`<!-- Script with SRI -->`);
                console.log(`<script src="${result.url}"`);
                console.log(`        integrity="sha384-${result.integrity}" crossorigin="anonymous"></script>`);
            }
            console.log('');
        }
    });
    
    // Save results to JSON file
    const fs = require('fs');
    const outputPath = 'scripts/sri-hashes.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`💾 Results saved to: ${outputPath}`);
}

// Run the generator
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateSRIHash, generateSRIAttributes };
