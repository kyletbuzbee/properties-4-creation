#!/usr/bin/env node

/**
 * SRI Attribute Updater
 * Updates HTML files with Subresource Integrity attributes
 */

const fs = require('fs');
const path = require('path');

// SRI hashes generated earlier
const sriHashes = {
    'https://unpkg.com/lucide@latest/dist/umd/lucide.css': 'sha384-GGE05hfBHktPnRBuvrQUr4zlWkq0EU1L8niEW9sctrgzmzYcAWFcIo2ywmkZa0Hu',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js': 'sha384-XcPm71GSOvViJoCA7WCb/9rSD/M3VBABxIZH30y7wbDtwRymtm2Dw2NTumuGrJqB',
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css': 'sha384-b8ANgTJvdlAnWM5YGMpKn7Kodm+1k7NYNG9zdjTCcZcKatzYHwZ0RLdWarbJJVzU',
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js': 'sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH'
};

/**
 * Update HTML file with SRI attributes
 * @param {string} filePath - Path to HTML file
 */
function updateSRIInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Replace unpkg.com resources with SRI
        Object.entries(sriHashes).forEach(([url, hash]) => {
            const integrity = `sha384-${hash}`;
            
            // For stylesheets
            const cssPattern = new RegExp(
                `<link rel='stylesheet' href='${url}'[^>]*>`,
                'g'
            );
            
            if (content.match(cssPattern)) {
                const replacement = `<link rel='stylesheet' href='${url}' integrity='${integrity}' crossorigin='anonymous'>`;
                content = content.replace(cssPattern, replacement);
                updated = true;
            }
            
            // For scripts
            const jsPattern = new RegExp(
                `<script src='${url}'[^>]*></script>`,
                'g'
            );
            
            if (content.match(jsPattern)) {
                const replacement = `<script src='${url}' integrity='${integrity}' crossorigin='anonymous'></script>`;
                content = content.replace(jsPattern, replacement);
                updated = true;
            }
        });

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated SRI in: ${filePath}`);
        } else {
            console.log(`ℹ️  No SRI updates needed: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

/**
 * Find and update all HTML files
 */
function updateAllHTMLFiles() {
    console.log('🔐 Updating HTML files with SRI attributes...\n');
    
    const srcDir = './src';
    const files = fs.readdirSync(srcDir);
    
    let updatedCount = 0;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(srcDir, file);
            updateSRIInFile(filePath);
            updatedCount++;
        }
    });
    
    console.log(`\n📊 Completed: Updated ${updatedCount} HTML files with SRI attributes`);
}

// Run the updater
if (require.main === module) {
    updateAllHTMLFiles();
}

module.exports = { updateSRIInFile, updateAllHTMLFiles };
