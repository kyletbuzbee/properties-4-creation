#!/usr/bin/env node

/**
 * Production Readiness Test Script for Properties 4 Creations
 * 
 * This script performs comprehensive testing to ensure the website
 * is ready for production deployment.
 * 
 * Usage: node test-production-readiness.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionReadinessTester {
  constructor() {
    this.results = {
      security: { passed: 0, failed: 0, tests: [] },
      accessibility: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] },
      crossBrowser: { passed: 0, failed: 0, tests: [] },
      serviceWorker: { passed: 0, failed: 0, tests: [] },
      configuration: { passed: 0, failed: 0, tests: [] }
    };
    
    this.totalTests = 0;
    this.passedTests = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async runTest(category, testName, testFunction) {
    this.totalTests++;
    this.log(`🧪 Running ${category}: ${testName}`, 'info');
    
    try {
      await testFunction();
      this.results[category].passed++;
      this.passedTests++;
      this.results[category].tests.push({ name: testName, status: 'PASSED' });
      this.log(`✅ ${testName} - PASSED`, 'success');
    } catch (error) {
      this.results[category].failed++;
      this.results[category].tests.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
    }
  }

  async checkFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${description} not found at ${filePath}`);
    }
  }

  async checkFileContent(filePath, checks) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(check => {
      if (!content.includes(check.expected)) {
        throw new Error(`Expected "${check.expected}" in ${filePath}`);
      }
    });
  }

  async runSecurityTests() {
    this.log('\n🔒 Security Tests', 'info');
    
    await this.runTest('security', 'XSS Prevention', async () => {
      await this.checkFileExists('src/js/utils/sanitizer.js', 'Sanitizer utility');
      
      const sanitizerContent = fs.readFileSync('src/js/utils/sanitizer.js', 'utf8');
      if (!sanitizerContent.includes('sanitizeHtml') || 
          !sanitizerContent.includes('cleanUserInput')) {
        throw new Error('Sanitizer functions not found');
      }
    });

    await this.runTest('security', 'Input Validation', async () => {
      await this.checkFileContent('src/js/main.js', [
        { expected: 'sanitizeInput' },
        { expected: 'validateEmail' },
        { expected: 'validatePhone' }
      ]);
    });

    await this.runTest('security', 'Error Handling', async () => {
      await this.checkFileExists('src/js/utils/errorHandler.js', 'Error handler');
      await this.checkFileExists('src/js/utils/errorBoundary.js', 'Error boundary');
    });

    await this.runTest('security', 'Form Security', async () => {
      const formFiles = ['src/index.html', 'src/apply.html', 'src/contact.html'];
      for (const file of formFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('novalidate') && !content.includes('required')) {
            throw new Error(`Form validation not properly implemented in ${file}`);
          }
        }
      }
    });
  }

  async runAccessibilityTests() {
    this.log('\n♿ Accessibility Tests', 'info');
    
    await this.runTest('accessibility', 'Skip Links', async () => {
      const htmlFiles = ['src/index.html', 'src/apply.html', 'src/contact.html'];
      for (const file of htmlFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('skip-link') && !content.includes('skip-to-content')) {
            throw new Error(`Skip link not found in ${file}`);
          }
        }
      }
    });

    await this.runTest('accessibility', 'ARIA Labels', async () => {
      await this.checkFileExists('src/js/accessibility-enhanced.js', 'Accessibility enhancements');
      
      const content = fs.readFileSync('src/js/accessibility-enhanced.js', 'utf8');
      if (!content.includes('aria-label') && !content.includes('aria-live')) {
        throw new Error('ARIA labels not implemented');
      }
    });

    await this.runTest('accessibility', 'Keyboard Navigation', async () => {
      const content = fs.readFileSync('src/js/ui-header.js', 'utf8');
      if (!content.includes('keydown') && !content.includes('tabindex')) {
        throw new Error('Keyboard navigation not implemented');
      }
    });

    await this.runTest('accessibility', 'Image Alt Text', async () => {
      const htmlFiles = ['src/index.html', 'src/apply.html', 'src/contact.html'];
      for (const file of htmlFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const imgTags = (content.match(/<img[^>]+>/g) || []);
          
          for (const imgTag of imgTags) {
            if (!imgTag.includes('alt=')) {
              throw new Error(`Image without alt text found in ${file}`);
            }
          }
        }
      }
    });
  }

  async runPerformanceTests() {
    this.log('\n⚡ Performance Tests', 'info');
    
    await this.runTest('performance', 'Lazy Loading', async () => {
      await this.checkFileExists('src/js/utils/lazyLoad.js', 'Lazy loading utility');
      
      const content = fs.readFileSync('src/js/utils/lazyLoad.js', 'utf8');
      if (!content.includes('IntersectionObserver') && !content.includes('loading="lazy"')) {
        throw new Error('Lazy loading not implemented');
      }
    });

    await this.runTest('performance', 'Bundle Size Monitoring', async () => {
      await this.checkFileExists('bundlewatch.config.json', 'Bundle size configuration');
      
      const config = JSON.parse(fs.readFileSync('bundlewatch.config.json', 'utf8'));
      if (!config.files || config.files.length === 0) {
        throw new Error('No bundle size limits configured');
      }
    });

    await this.runTest('performance', 'Image Optimization', async () => {
      const imageDir = 'src/images';
      if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir);
        const webpFiles = files.filter(file => file.endsWith('.webp'));
        
        if (webpFiles.length === 0) {
          throw new Error('No WebP images found - images not optimized');
        }
      }
    });

    await this.runTest('performance', 'CSS Optimization', async () => {
      const cssFiles = ['src/css/main.css', 'src/css/style.css'];
      for (const file of cssFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('--') && !content.includes('custom')) {
            throw new Error('CSS custom properties not used');
          }
        }
      }
    });
  }

  async runCrossBrowserTests() {
    this.log('\n🌐 Cross-Browser Tests', 'info');
    
    await this.runTest('crossBrowser', 'ES6+ Support', async () => {
      const jsFiles = ['src/js/main.js', 'src/js/accessibility-enhanced.js'];
      for (const file of jsFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('const ') && !content.includes('let ') && !content.includes('=>')) {
            throw new Error('ES6+ features not used');
          }
        }
      }
    });

    await this.runTest('crossBrowser', 'Feature Detection', async () => {
      const content = fs.readFileSync('src/js/main.js', 'utf8');
      if (!content.includes('if (') && !content.includes('typeof')) {
        throw new Error('Feature detection not implemented');
      }
    });

    await this.runTest('crossBrowser', 'Polyfill Support', async () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const polyfillDeps = Object.keys(dependencies).filter(dep => 
        dep.includes('polyfill') || dep.includes('core-js')
      );
      
      if (polyfillDeps.length === 0) {
        this.log('⚠️  No polyfill dependencies found - may need for older browsers', 'warning');
      }
    });
  }

  async runServiceWorkerTests() {
    this.log('\n🤖 Service Worker Tests', 'info');
    
    await this.runTest('serviceWorker', 'Service Worker Registration', async () => {
      await this.checkFileExists('src/sw.js', 'Service worker file');
      
      const content = fs.readFileSync('src/sw.js', 'utf8');
      if (!content.includes('self.addEventListener') && !content.includes('caches')) {
        throw new Error('Service worker not properly implemented');
      }
    });

    await this.runTest('serviceWorker', 'Manifest File', async () => {
      await this.checkFileExists('src/manifest.json', 'PWA manifest');
      
      const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'));
      if (!manifest.name || !manifest.short_name || !manifest.icons) {
        throw new Error('Manifest missing required fields');
      }
    });

    await this.runTest('serviceWorker', 'Offline Support', async () => {
      const content = fs.readFileSync('src/sw.js', 'utf8');
      if (!content.includes('fetch') && !content.includes('cache')) {
        throw new Error('Offline caching not implemented');
      }
    });
  }

  async runConfigurationTests() {
    this.log('\n⚙️ Configuration Tests', 'info');
    
    await this.runTest('configuration', 'Lighthouse Configuration', async () => {
      await this.checkFileExists('lighthouserc.json', 'Lighthouse configuration');
      
      const config = JSON.parse(fs.readFileSync('lighthouserc.json', 'utf8'));
      if (!config.ci || !config.ci.collect || !config.ci.assert) {
        throw new Error('Lighthouse configuration incomplete');
      }
      
      // Check for environment variables
      const configStr = fs.readFileSync('lighthouserc.json', 'utf8');
      if (!configStr.includes('${LH_BASE_URL')) {
        throw new Error('Lighthouse configuration should use environment variables');
      }
    });

    await this.runTest('configuration', 'Package Scripts', async () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts;
      
      const requiredScripts = [
        'test', 'build', 'dev', 'lint', 'format'
      ];
      
      for (const script of requiredScripts) {
        if (!scripts[script]) {
          throw new Error(`Required script "${script}" not found`);
        }
      }
    });

    await this.runTest('configuration', 'Test Configuration', async () => {
      await this.checkFileExists('vitest.config.js', 'Vitest configuration');
      
      const vitestConfig = fs.readFileSync('vitest.config.js', 'utf8');
      if (!vitestConfig.includes('test') && !vitestConfig.includes('coverage')) {
        throw new Error('Vitest configuration incomplete');
      }
    });

    await this.runTest('configuration', 'ESLint Configuration', async () => {
      await this.checkFileExists('.eslintrc.json', 'ESLint configuration');
      
      const eslintConfig = JSON.parse(fs.readFileSync('.eslintrc.json', 'utf8'));
      if (!eslintConfig.rules || Object.keys(eslintConfig.rules).length === 0) {
        throw new Error('ESLint rules not configured');
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Properties 4 Creations - Production Readiness Test', 'info');
    this.log('='.repeat(60), 'info');
    
    await this.runSecurityTests();
    await this.runAccessibilityTests();
    await this.runPerformanceTests();
    await this.runCrossBrowserTests();
    await this.runServiceWorkerTests();
    await this.runConfigurationTests();
    
    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary', 'info');
    this.log('='.repeat(60), 'info');
    
    let allPassed = true;
    
    Object.entries(this.results).forEach(([category, result]) => {
      const passRate = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0;
      const status = result.failed === 0 ? '✅' : '❌';
      
      this.log(`${status} ${category.toUpperCase()}: ${result.passed}/${result.total} passed (${passRate}%)`, 'info');
      
      if (result.failed > 0) {
        allPassed = false;
        result.tests.forEach(test => {
          if (test.status === 'FAILED') {
            this.log(`   ❌ ${test.name}: ${test.error || 'Test failed'}`, 'error');
          }
        });
      }
    });
    
    this.log('='.repeat(60), 'info');
    this.log(`🎯 Overall: ${this.passedTests}/${this.totalTests} tests passed`, 'info');
    
    if (allPassed) {
      this.log('🎉 All tests passed! The website is production-ready.', 'success');
      process.exit(0);
    } else {
      this.log('⚠️  Some tests failed. Please review and fix issues before deployment.', 'warning');
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new ProductionReadinessTester();
tester.runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});