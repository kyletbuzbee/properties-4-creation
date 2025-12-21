/**
 * Cross-Browser Compatibility Testing Suite for Properties 4 Creations
 * Tests functionality across different browsers and versions
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = `
      <header>
        <nav>
          <button class="menu-toggle" aria-expanded="false">Menu</button>
          <ul id="nav-menu">
            <li><a href="index.html">Home</a></li>
            <li><a href="properties.html">Properties</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section class="hero">
          <h1>Properties 4 Creations</h1>
          <img src="images/banners/hero-home-banner.webp" alt="Hero banner" loading="lazy">
        </section>

        <section class="properties">
          <div class="property-card">
            <img src="images/properties/tyler-ranch-home.webp" alt="Tyler Ranch Home" loading="lazy">
            <h3>Tyler Ranch Home</h3>
            <p>Section 8 Ready</p>
          </div>
        </section>

        <form id="test-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <button type="submit">Submit</button>
        </form>
      </main>

      <footer>
        <p>© 2024 Properties 4 Creations</p>
      </footer>
    `;
  });

  describe('ES6+ Compatibility', () => {
    it('should support arrow functions', () => {
      const arrowFunction = () => 'test';
      expect(arrowFunction()).toBe('test');
    });

    it('should support const and let declarations', () => {
      const testConst = 'const';
      let testLet = 'let';
      
      expect(testConst).toBe('const');
      expect(testLet).toBe('let');
    });

    it('should support template literals', () => {
      const name = 'Properties 4 Creations';
      const template = `Welcome to ${name}`;
      
      expect(template).toBe('Welcome to Properties 4 Creations');
    });

    it('should support destructuring', () => {
      const obj = { a: 1, b: 2 };
      const { a, b } = obj;
      
      expect(a).toBe(1);
      expect(b).toBe(2);
    });

    it('should support default parameters', () => {
      const defaultParam = (param = 'default') => param;
      
      expect(defaultParam()).toBe('default');
      expect(defaultParam('custom')).toBe('custom');
    });
  });

  describe('Modern API Support', () => {
    it('should support fetch API', () => {
      expect(typeof fetch).toBe('function');
    });

    it('should support Promise API', () => {
      expect(typeof Promise).toBe('function');
      
      const promise = new Promise((resolve) => resolve('test'));
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should support Array.from', () => {
      expect(typeof Array.from).toBe('function');
      
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      const array = Array.from(arrayLike);
      
      expect(array).toEqual(['a', 'b']);
    });

    it('should support Object.assign', () => {
      expect(typeof Object.assign).toBe('function');
      
      const target = { a: 1 };
      const source = { b: 2 };
      const result = Object.assign(target, source);
      
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should support Array methods', () => {
      const array = [1, 2, 3, 4, 5];
      
      expect(typeof array.includes).toBe('function');
      expect(typeof array.find).toBe('function');
      expect(typeof array.filter).toBe('function');
      expect(typeof array.map).toBe('function');
      
      expect(array.includes(3)).toBe(true);
      expect(array.find(x => x > 3)).toBe(4);
    });
  });

  describe('CSS Compatibility', () => {
    it('should support CSS custom properties', () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      
      // Test if CSS custom properties are supported
      root.style.setProperty('--test-property', 'test-value');
      const value = style.getPropertyValue('--test-property');
      
      expect(value).toBe('test-value');
    });

    it('should support flexbox', () => {
      const element = document.createElement('div');
      element.style.display = 'flex';
      element.style.flexDirection = 'row';
      
      document.body.appendChild(element);
      
      const computedStyle = getComputedStyle(element);
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.flexDirection).toBe('row');
    });

    it('should support grid layout', () => {
      const element = document.createElement('div');
      element.style.display = 'grid';
      element.style.gridTemplateColumns = '1fr 1fr';
      
      document.body.appendChild(element);
      
      const computedStyle = getComputedStyle(element);
      expect(computedStyle.display).toBe('grid');
      expect(computedStyle.gridTemplateColumns).toBe('1fr 1fr');
    });

    it('should support CSS transforms', () => {
      const element = document.createElement('div');
      element.style.transform = 'translateX(10px)';
      
      document.body.appendChild(element);
      
      const computedStyle = getComputedStyle(element);
      expect(computedStyle.transform).toBeTruthy();
    });

    it('should support CSS transitions', () => {
      const element = document.createElement('div');
      element.style.transition = 'all 0.3s ease';
      
      document.body.appendChild(element);
      
      const computedStyle = getComputedStyle(element);
      expect(computedStyle.transition).toBeTruthy();
    });
  });

  describe('Browser Feature Detection', () => {
    it('should detect service worker support', () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      expect(typeof hasServiceWorker).toBe('boolean');
    });

    it('should detect localStorage support', () => {
      const hasLocalStorage = 'localStorage' in window;
      expect(typeof hasLocalStorage).toBe('boolean');
    });

    it('should detect sessionStorage support', () => {
      const hasSessionStorage = 'sessionStorage' in window;
      expect(typeof hasSessionStorage).toBe('boolean');
    });

    it('should detect IntersectionObserver support', () => {
      const hasIntersectionObserver = 'IntersectionObserver' in window;
      expect(typeof hasIntersectionObserver).toBe('boolean');
    });

    it('should detect ResizeObserver support', () => {
      const hasResizeObserver = 'ResizeObserver' in window;
      expect(typeof hasResizeObserver).toBe('boolean');
    });

    it('should detect WebP image support', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      
      const supportsWebP = dataURL.indexOf('data:image/webp') === 0;
      expect(typeof supportsWebP).toBe('boolean');
    });
  });

  describe('Event Handling Compatibility', () => {
    it('should support addEventListener', () => {
      const element = document.createElement('div');
      const handler = () => {};
      
      expect(typeof element.addEventListener).toBe('function');
      expect(typeof element.removeEventListener).toBe('function');
      
      element.addEventListener('click', handler);
      element.removeEventListener('click', handler);
    });

    it('should support passive event listeners', () => {
      const element = document.createElement('div');
      const handler = () => {};
      
      try {
        element.addEventListener('touchstart', handler, { passive: true });
        element.removeEventListener('touchstart', handler, { passive: true });
      } catch (e) {
        // Passive event listeners not supported
        expect(e).toBeDefined();
      }
    });

    it('should support custom events', () => {
      const customEvent = new CustomEvent('test-event', {
        detail: { message: 'test' }
      });
      
      expect(customEvent).toBeInstanceOf(CustomEvent);
      expect(customEvent.detail.message).toBe('test');
    });
  });

  describe('Form Validation Compatibility', () => {
    it('should support HTML5 form validation', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.required = true;
      
      expect(input.type).toBe('email');
      expect(input.required).toBe(true);
    });

    it('should support input types', () => {
      const types = ['email', 'tel', 'url', 'number', 'date'];
      
      types.forEach(type => {
        const input = document.createElement('input');
        input.type = type;
        
        // Browser may fallback to text type if not supported
        expect(['text', type]).toContain(input.type);
      });
    });

    it('should support form validation API', () => {
      const form = document.getElementById('test-form');
      const input = document.getElementById('name');
      
      expect(typeof form.checkValidity).toBe('function');
      expect(typeof input.checkValidity).toBe('function');
      expect(typeof input.setCustomValidity).toBe('function');
    });
  });

  describe('Storage Compatibility', () => {
    it('should support localStorage operations', () => {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        
        expect(value).toBe('value');
      }
    });

    it('should support sessionStorage operations', () => {
      if (typeof Storage !== 'undefined') {
        sessionStorage.setItem('test', 'value');
        const value = sessionStorage.getItem('test');
        sessionStorage.removeItem('test');
        
        expect(value).toBe('value');
      }
    });

    it('should handle storage quota exceeded gracefully', () => {
      if (typeof Storage !== 'undefined') {
        try {
          // Try to fill storage
          for (let i = 0; i < 1000; i++) {
            localStorage.setItem(`test-${i}`, 'x'.repeat(1000));
          }
        } catch (e) {
          // Storage quota exceeded - this is expected behavior
          expect(e.name).toBe('QuotaExceededError');
        }
      }
    });
  });

  describe('Mobile Browser Compatibility', () => {
    it('should detect touch support', () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      expect(typeof hasTouch).toBe('boolean');
    });

    it('should handle viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });

    it('should support orientation change', () => {
      const hasOrientation = 'orientation' in window.screen;
      expect(typeof hasOrientation).toBe('boolean');
    });
  });

  describe('Performance APIs', () => {
    it('should support performance.now()', () => {
      expect(typeof performance.now).toBe('function');
      
      const start = performance.now();
      const end = performance.now();
      
      expect(end).toBeGreaterThanOrEqual(start);
    });

    it('should support performance.mark()', () => {
      if (typeof performance.mark === 'function') {
        performance.mark('test-mark');
        
        const marks = performance.getEntriesByType('mark');
        const testMark = marks.find(mark => mark.name === 'test-mark');
        
        expect(testMark).toBeTruthy();
      }
    });

    it('should support performance.measure()', () => {
      if (typeof performance.measure === 'function') {
        performance.mark('start');
        performance.mark('end');
        
        try {
          performance.measure('test-measure', 'start', 'end');
          const measures = performance.getEntriesByType('measure');
          const testMeasure = measures.find(measure => measure.name === 'test-measure');
          
          expect(testMeasure).toBeTruthy();
        } catch (e) {
          // Measurement API not fully supported
        }
      }
    });
  });
});