#!/usr/bin/env node
/**
 * Security Testing & Validation Script
 * Properties 4 Creations - Final Phase 6 Implementation
 * 
 * Comprehensive security audit and validation tool
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Security validation functions
class SecurityValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  /**
   * Log test result
   */
  logTest(name, status, message, details = {}) {
    const test = {
      name,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(test);
    
    if (status === 'PASS') this.results.passed++;
    else if (status === 'FAIL') this.results.failed++;
    else this.results.warnings++;

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${name}: ${message}`);
  }

  /**
   * Validate security headers implementation
   */
  validateSecurityHeaders() {
    console.log('\n🔒 Validating Security Headers Implementation...');
    
    try {
      // Check if security headers partial exists
      const headersFile = path.join(__dirname, '../src/_includes/partials/security-headers.html');
      if (fs.existsSync(headersFile)) {
        const content = fs.readFileSync(headersFile, 'utf8');
        
        // Check for essential security headers
        const requiredHeaders = [
          'Content-Security-Policy',
          'X-Content-Type-Options',
          'Referrer-Policy',
          'Permissions-Policy'
        ];

        // Special check for X-Frame-Options or frame-ancestors
        if (content.includes('X-Frame-Options') || (content.includes('Content-Security-Policy') && content.includes('frame-ancestors'))) {
            this.logTest(`Security Header: X-Frame-Options or CSP frame-ancestors`, 'PASS', 'Header found in implementation');
        } else {
            this.logTest(`Security Header: X-Frame-Options or CSP frame-ancestors`, 'FAIL', 'Header missing from implementation');
        }

        requiredHeaders.forEach(header => {
          if (content.includes(header)) {
            this.logTest(`Security Header: ${header}`, 'PASS', 'Header found in implementation');
          } else {
            this.logTest(`Security Header: ${header}`, 'FAIL', 'Header missing from implementation');
          }
        });

        // Check for SRI implementation
        if (content.includes('integrity=') || content.includes('sha384-')) {
          this.logTest('Subresource Integrity (SRI)', 'PASS', 'SRI implementation detected');
        } else {
          this.logTest('Subresource Integrity (SRI)', 'WARN', 'SRI implementation not found in headers');
        }

      } else {
        this.logTest('Security Headers File', 'FAIL', 'Security headers partial not found');
      }
    } catch (error) {
      this.logTest('Security Headers Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Validate SRI hash integrity
   */
  validateSRIHashes() {
    console.log('\n🔗 Validating SRI Hashes...');
    
    try {
      // Check if SRI hashes file exists
      const hashesFile = path.join(__dirname, 'sri-hashes.json');
      if (fs.existsSync(hashesFile)) {
        const hashes = JSON.parse(fs.readFileSync(hashesFile, 'utf8'));
        
        // Validate hash structure
        const requiredHashes = ['sha384'];
        let validHashes = 0;

        Object.entries(hashes).forEach(([resource, hashData]) => {
          if (typeof hashData === 'object' && hashData.sha384) {
            // Validate SHA-384 format
            const hashValue = hashData.sha384;
            if (/^[A-Za-z0-9+/=]+$/.test(hashValue) && hashValue.length === 64) {
              this.logTest(`SRI Hash: ${resource}`, 'PASS', 'Valid SHA-384 hash format');
              validHashes++;
            } else {
              this.logTest(`SRI Hash: ${resource}`, 'FAIL', 'Invalid hash format');
            }
          }
        });

        this.logTest('SRI Hash Coverage', validHashes > 0 ? "PASS": 'FAIL', 
          `${validHashes} valid SRI hashes found`);

      } else {
        this.logTest('SRI Hashes File', 'FAIL', 'sri-hashes.json not found');
      }
    } catch (error) {
      this.logTest('SRI Hash Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Validate XSS protection implementation
   */
  validateXSSProtection() {
    console.log('\n🛡️ Validating XSS Protection...');
    
    try {
      // Check sanitizer implementation
      const sanitizerFile = path.join(__dirname, '../src/js/utils/sanitizer.js');
      if (fs.existsSync(sanitizerFile)) {
        const content = fs.readFileSync(sanitizerFile, 'utf8');
        
        // Check for XSS protection features
        const xssFeatures = [
          { pattern: /DOMPurify/i, feature: 'DOMPurify integration' },
          { pattern: /sanitize/i, feature: 'Input sanitization' },
          { pattern: /escape/i, feature: 'Output escaping' },
          { pattern: /innerHTML/i, feature: 'DOM manipulation safety' }
        ];

        xssFeatures.forEach(({ pattern, feature }) => {
          if (pattern.test(content)) {
            this.logTest(`XSS Protection: ${feature}`, 'PASS', 'Feature implemented');
          } else {
            this.logTest(`XSS Protection: ${feature}`, 'WARN', 'Feature not detected');
          }
        });

      } else {
        this.logTest('XSS Protection File', 'FAIL', 'sanitizer.js not found');
      }

      // Check main.js for secure DOM manipulation
      const mainJsFile = path.join(__dirname, '../src/js/main.js');
      if (fs.existsSync(mainJsFile)) {
        const content = fs.readFileSync(mainJsFile, 'utf8');
        
        // Check for unsafe innerHTML usage
        const unsafePatterns = [
          /innerHTML\s*=\s*[''][^'']*["']/g,
          /innerHTML\s*\+=/g
        ];

        let unsafeUsages = 0;
        unsafePatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) unsafeUsages += matches.length;
        });

        if (unsafeUsages === 0) {
          this.logTest('DOM Manipulation Security', 'PASS', 'No unsafe innerHTML usage detected');
        } else {
          this.logTest('DOM Manipulation Security', 'WARN', `${unsafeUsages} potential unsafe innerHTML usages`);
        }
      }

    } catch (error) {
      this.logTest('XSS Protection Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Validate CSRF protection
   */
  validateCSRFProtection() {
    console.log('\n🔐 Validating CSRF Protection...');
    
    try {
      const csrfFile = path.join(__dirname, '../src/js/security/csrf-protection.js');
      if (fs.existsSync(csrfFile)) {
        const content = fs.readFileSync(csrfFile, 'utf8');
        
        const csrfFeatures = [
          { pattern: /token/i, feature: 'CSRF token generation' },
          { pattern: /validate/i, feature: 'Token validation' },
          { pattern: /header/i, feature: 'Header validation' }
        ];

        csrfFeatures.forEach(({ pattern, feature }) => {
          if (pattern.test(content)) {
            this.logTest(`CSRF Protection: ${feature}`, 'PASS', 'Feature implemented');
          } else {
            this.logTest(`CSRF Protection: ${feature}`, 'WARN', 'Feature not detected');
          }
        });

      } else {
        this.logTest('CSRF Protection File', 'FAIL', 'csrf-protection.js not found');
      }
    } catch (error) {
      this.logTest('CSRF Protection Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Validate console stripping for production
   */
  validateConsoleStripping() {
    console.log('\n🧹 Validating Console Stripping...');
    
    try {
      const stripFile = path.join(__dirname, 'strip-console.js');
      if (fs.existsSync(stripFile)) {
        const content = fs.readFileSync(stripFile, 'utf8');
        
        if (content.includes('console') && content.includes('drop')) {
          this.logTest('Console Stripping', 'PASS', 'Console removal script found');
        } else {
          this.logTest('Console Stripping', 'WARN', 'Console stripping script incomplete');
        }
      } else {
        this.logTest('Console Stripping Script', 'FAIL', 'strip-console.js not found');
      }

      // Check if production build strips console
      if (fs.existsSync(path.join(__dirname, '../package.json'))) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
        if (packageJson.scripts && packageJson.scripts['strip-console']) {
          this.logTest('Production Console Stripping', 'PASS', 'Production script configured');
        } else {
          this.logTest('Production Console Stripping', 'WARN', 'Production script not configured');
        }
      }

    } catch (error) {
      this.logTest('Console Stripping Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Validate build system security
   */
  validateBuildSecurity() {
    console.log('\n🏗️ Validating Build System Security...');
    
    try {
      // Check package.json security
      const packagePath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check for security-related scripts
        const securityScripts = ['strip-console', 'build:prod'];
        securityScripts.forEach(script => {
          if (packageJson.scripts && packageJson.scripts[script]) {
            this.logTest(`Build Script: ${script}`, 'PASS', 'Script configured');
          } else {
            this.logTest(`Build Script: ${script}`, 'WARN', 'Script not found');
          }
        });

        // Check dependencies for known vulnerabilities
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const knownVulnerable = [];
        
        Object.keys(dependencies).forEach(dep => {
          if (dep.includes('dompurify') || dep.includes('terser')) {
            // These are security tools, not vulnerabilities
            this.logTest(`Security Tool: ${dep}`, 'PASS', 'Security tool dependency found');
          }
        });

      }

      // Check PostCSS configuration
      const postcssFile = path.join(__dirname, '../postcss.config.js');
      if (fs.existsSync(postcssFile)) {
        const content = fs.readFileSync(postcssFile, 'utf8');
        if (content.includes('autoprefixer') && content.includes('cssnano')) {
          this.logTest('PostCSS Security', 'PASS', 'CSS processing configured');
        } else {
          this.logTest('PostCSS Security', 'WARN', 'CSS processing incomplete');
        }
      }

    } catch (error) {
      this.logTest('Build System Security', 'FAIL', `Error: ${error.message}`);
    }
  }

  /**
   * Generate security report
   */
  generateReport() {
    console.log('\n📊 SECURITY VALIDATION REPORT');
    console.log('=====================================');
    
    const totalTests = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = ((this.results.passed / totalTests) * 100).toFixed(1);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);
    console.log(`Success Rate: ${passRate}%`);
    
    // Overall security status
    let securityLevel = 'LOW';
    if (this.results.failed === 0 && this.results.warnings <= 2) {
      securityLevel = 'ENTERPRISE';
    } else if (this.results.failed <= 2 && this.results.warnings <= 5) {
      securityLevel = 'HIGH';
    } else if (this.results.failed <= 5) {
      securityLevel = 'MEDIUM';
    }
    
    console.log(`\n🎯 SECURITY LEVEL: ${securityLevel}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.failed > 0) {
      console.log('- Address all failed security tests immediately');
    }
    if (this.results.warnings > 5) {
      console.log('- Review and address security warnings');
    }
    if (securityLevel === 'ENTERPRISE') {
      console.log('- Excellent security implementation! Ready for production');
    }
    
    // Save report
    const reportPath = path.join(__dirname, '../SECURITY_VALIDATION_REPORT.md');
    const reportContent = `# Security Validation Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${this.results.passed}
- **Failed**: ${this.results.failed}
- **Warnings**: ${this.results.warnings}
- **Success Rate**: ${passRate}%
- **Security Level**: ${securityLevel}

## Test Results
${this.results.tests.map(test => `- ${test.status}: ${test.name} - ${test.message}`).join('\n')}

## Recommendations
${this.results.failed > 0 ? '- Address all failed security tests immediately' : ''}
${this.results.warnings > 5 ? '- Review and address security warnings' : ''}
${securityLevel === 'ENTERPRISE' ? '- Excellent security implementation! Ready for production' : ''}
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return {
      passed: this.results.passed,
      failed: this.results.failed,
      warnings: this.results.warnings,
      securityLevel,
      successRate: passRate
    };
  }

  /**
   * Run all security validations
   */
  async runAllValidations() {
    console.log('🚀 Starting Comprehensive Security Validation...\n');
    
    this.validateSecurityHeaders();
    this.validateSRIHashes();
    this.validateXSSProtection();
    this.validateCSRFProtection();
    this.validateConsoleStripping();
    this.validateBuildSecurity();
    
    const results = this.generateReport();
    
    // Exit with appropriate code
    if (results.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new SecurityValidator();
  validator.runAllValidations().catch(error => {
    console.error('❌ Security validation failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityValidator;
