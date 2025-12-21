/**
 * Feature Testing Suite for Properties 4 Creations
 * Tests all new features for accessibility, performance, and functionality
 */

class FeatureTester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  async runTests() {
    console.log('🧪 Starting Properties 4 Creations Feature Tests...\n');
    
    for (const test of this.tests) {
      try {
        const result = await test.testFunction();
        this.results.push({
          name: test.name,
          passed: result.passed,
          message: result.message,
          details: result.details
        });
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${result.message}`);
        
        if (result.details) {
          console.log(`   ${result.details}`);
        }
      } catch (error) {
        this.results.push({
          name: test.name,
          passed: false,
          message: 'Test failed with error',
          error: error.message
        });
        console.log(`❌ ${test.name}: Test failed with error`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log('\n📊 Test Summary:');
    console.log(`   Passed: ${passed}/${total}`);
    console.log(`   Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! The site is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix the issues.');
    }
  }
}

// Test Suite
const tester = new FeatureTester();

// 1. Header Tests
tester.addTest('Header Accessibility', () => {
  const header = document.querySelector('.header-glass');
  const skipLink = document.querySelector('.skip-link');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-navigation');
  
  const hasSkipLink = !!skipLink;
  const hasAriaLabel = header && header.getAttribute('role') === 'banner';
  const hasMobileMenu = !!menuToggle && !!nav;
  const hasFocusManagement = !!menuToggle && menuToggle.getAttribute('aria-expanded') !== null;
  
  const passed = hasSkipLink && hasAriaLabel && hasMobileMenu && hasFocusManagement;
  const message = passed ? 'Header accessibility features working correctly' : 'Header accessibility issues detected';
  
  return {
    passed,
    message,
    details: `Skip link: ${hasSkipLink ? '✅' : '❌'}, ARIA banner: ${hasAriaLabel ? '✅' : '❌'}, Mobile menu: ${hasMobileMenu ? '✅' : '❌'}, Focus management: ${hasFocusManagement ? '✅' : '❌'}`
  };
});

// 2. Video Hero Tests
tester.addTest('Video Hero Functionality', () => {
  const videoHero = document.querySelector('.video-hero');
  const video = document.querySelector('.hero-video');
  const fallback = document.querySelector('.video-fallback');
  
  const hasVideoHero = !!videoHero;
  const hasVideo = !!video;
  const hasFallback = !!fallback;
  const hasAutoplay = video && video.hasAttribute('autoplay');
  const hasMuted = video && video.hasAttribute('muted');
  const hasLoop = video && video.hasAttribute('loop');
  
  const passed = hasVideoHero && hasVideo && hasFallback && hasAutoplay && hasMuted && hasLoop;
  const message = passed ? 'Video hero working correctly' : 'Video hero issues detected';
  
  return {
    passed,
    message,
    details: `Video hero: ${hasVideoHero ? '✅' : '❌'}, Video element: ${hasVideo ? '✅' : '❌'}, Fallback: ${hasFallback ? '✅' : '❌'}, Autoplay: ${hasAutoplay ? '✅' : '❌'}, Muted: ${hasMuted ? '✅' : '❌'}, Loop: ${hasLoop ? '✅' : '❌'}`
  };
});

// 3. Comparison Slider Tests
tester.addTest('Comparison Slider Functionality', () => {
  const sliderContainer = document.querySelector('.comparison-slider .slider-container');
  const beforeImage = document.querySelector('.slider-before');
  const afterImage = document.querySelector('.slider-after');
  const handle = document.querySelector('.slider-handle');
  
  const hasSlider = !!sliderContainer;
  const hasImages = !!beforeImage && !!afterImage;
  const hasHandle = !!handle;
  const hasAccessibility = handle && handle.getAttribute('role') === 'slider';
  
  const passed = hasSlider && hasImages && hasHandle && hasAccessibility;
  const message = passed ? 'Comparison slider working correctly' : 'Comparison slider issues detected';
  
  return {
    passed,
    message,
    details: `Slider container: ${hasSlider ? '✅' : '❌'}, Images: ${hasImages ? '✅' : '❌'}, Handle: ${hasHandle ? '✅' : '❌'}, Accessibility: ${hasAccessibility ? '✅' : '❌'}`
  };
});

// 4. Mobile Responsiveness Tests
tester.addTest('Mobile Responsiveness', () => {
  const viewportWidth = window.innerWidth;
  const header = document.querySelector('.header-glass');
  const hero = document.querySelector('.hero');
  const menuToggle = document.querySelector('.menu-toggle');
  
  // Check if mobile menu is visible on small screens
  const isMobile = viewportWidth < 768;
  const hasMobileMenu = isMobile ? !!menuToggle : true; // Mobile menu should be visible on mobile
  
  // Check if header is responsive
  const headerStyles = window.getComputedStyle(header);
  const hasResponsiveHeader = headerStyles.position === 'sticky';
  
  const passed = hasMobileMenu && hasResponsiveHeader;
  const message = passed ? 'Mobile responsiveness working correctly' : 'Mobile responsiveness issues detected';
  
  return {
    passed,
    message,
    details: `Mobile menu: ${hasMobileMenu ? '✅' : '❌'}, Sticky header: ${hasResponsiveHeader ? '✅' : '❌'}, Viewport: ${viewportWidth}px`
  };
});

// 5. Accessibility Tests
tester.addTest('General Accessibility', () => {
  const skipLinks = document.querySelectorAll('.skip-link');
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const images = document.querySelectorAll('img');
  const buttons = document.querySelectorAll('button, .btn');
  
  // Check skip links
  const hasSkipLinks = skipLinks.length > 0;
  
  // Check heading hierarchy
  const hasH1 = headings.length > 0 && headings[0].tagName === 'H1';
  
  // Check image alt text
  const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
  const altTextCoverage = images.length > 0 ? (imagesWithAlt.length / images.length) : 1;
  
  // Check button accessibility
  const buttonsWithAria = Array.from(buttons).filter(btn => 
    btn.getAttribute('aria-label') || btn.textContent.trim()
  );
  const buttonAccessibility = buttons.length > 0 ? (buttonsWithAria.length / buttons.length) : 1;
  
  const passed = hasSkipLinks && hasH1 && altTextCoverage >= 0.9 && buttonAccessibility >= 0.9;
  const message = passed ? 'Accessibility standards met' : 'Accessibility issues detected';
  
  return {
    passed,
    message,
    details: `Skip links: ${hasSkipLinks ? '✅' : '❌'}, H1 present: ${hasH1 ? '✅' : '❌'}, Alt text coverage: ${(altTextCoverage * 100).toFixed(1)}%, Button accessibility: ${(buttonAccessibility * 100).toFixed(1)}%`
  };
});

// 6. Performance Tests
tester.addTest('Performance Optimizations', () => {
  const images = document.querySelectorAll('img');
  const videos = document.querySelectorAll('video');
  
  // Check for lazy loading
  const lazyImages = Array.from(images).filter(img => img.loading === 'lazy');
  const lazyLoading = images.length > 0 ? (lazyImages.length / images.length) : 1;
  
  // Check video optimization
  const optimizedVideos = Array.from(videos).filter(video => 
    video.hasAttribute('preload') && video.preload === 'metadata'
  );
  const videoOptimization = videos.length > 0 ? (optimizedVideos.length / videos.length) : 1;
  
  const passed = lazyLoading >= 0.8 && videoOptimization >= 0.8;
  const message = passed ? 'Performance optimizations working' : 'Performance issues detected';
  
  return {
    passed,
    message,
    details: `Lazy loading: ${(lazyLoading * 100).toFixed(1)}%, Video optimization: ${(videoOptimization * 100).toFixed(1)}%`
  };
});

// 7. Cross-Browser Compatibility
tester.addTest('Cross-Browser Compatibility', () => {
  const supportsFlexbox = CSS.supports('display', 'flex');
  const supportsGrid = CSS.supports('display', 'grid');
  const supportsCSSVariables = CSS.supports('--custom-property', 'value');
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsResizeObserver = 'ResizeObserver' in window;
  
  const passed = supportsFlexbox && supportsGrid && supportsCSSVariables && supportsIntersectionObserver;
  const message = passed ? 'Cross-browser compatibility good' : 'Browser compatibility issues detected';
  
  return {
    passed,
    message,
    details: `Flexbox: ${supportsFlexbox ? '✅' : '❌'}, Grid: ${supportsGrid ? '✅' : '❌'}, CSS Variables: ${supportsCSSVariables ? '✅' : '❌'}, IntersectionObserver: ${supportsIntersectionObserver ? '✅' : '❌'}, ResizeObserver: ${supportsResizeObserver ? '✅' : '❌'}`
  };
});

// Run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tester.runTests());
} else {
  tester.runTests();
}

// Export for external use
window.FeatureTester = FeatureTester;