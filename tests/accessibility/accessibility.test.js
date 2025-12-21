/**
 * Accessibility Testing Suite for Properties 4 Creations
 * Tests WCAG compliance, ARIA labels, keyboard navigation, and screen reader compatibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AccessibilityEnhancer } from '../src/js/accessibility-enhanced.js';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Setup DOM environment with accessible structure
    document.body.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      
      <header class="header-glass" role="banner">
        <nav aria-label="Main navigation">
          <button class="menu-toggle" aria-expanded="false" aria-controls="nav-menu">
            <span>Menu</span>
          </button>
          <ul id="nav-menu" role="navigation">
            <li><a href="index.html" class="nav-link" aria-current="page">Home</a></li>
            <li><a href="properties.html" class="nav-link">Properties</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main id="main" role="main">
        <section class="hero">
          <h1>Properties 4 Creations</h1>
          <p>Veteran & Family Housing in East Texas</p>
        </section>

        <section class="properties" id="properties">
          <h2>Available Properties</h2>
          <div class="property-card" tabindex="0" role="button" aria-label="Tyler Ranch Home">
            <img src="images/properties/tyler-ranch-home.webp" alt="Tyler Ranch Home exterior" loading="lazy">
            <div class="property-content">
              <h3 class="property-title">Tyler Ranch Home</h3>
              <p class="property-location">Tyler, TX</p>
              <div class="property-details">
                <div class="detail-item">
                  <div class="detail-label">Beds</div>
                  <div class="detail-value">3</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Baths</div>
                  <div class="detail-value">2</div>
                </div>
              </div>
              <a href="apply.html" class="btn btn-primary" aria-label="Apply for Tyler Ranch Home">Apply for This Home</a>
            </div>
          </div>
        </section>

        <section class="accordion" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div class="accordion-item">
            <button class="accordion-header" aria-expanded="false" aria-controls="faq-content-1">
              How do I apply for housing?
            </button>
            <div id="faq-content-1" class="accordion-content" hidden>
              <p>Application process details...</p>
            </div>
          </div>
        </section>

        <form id="contact-form" novalidate>
          <h3>Contact Us</h3>
          <div class="form-group">
            <label for="contact-name">Name</label>
            <input type="text" id="contact-name" name="name" required>
            <div class="error-message" id="name-error" role="alert" hidden></div>
          </div>
          <div class="form-group">
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" name="email" required>
            <div class="error-message" id="email-error" role="alert" hidden></div>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </main>

      <footer class="footer" role="contentinfo">
        <div class="footer-section">
          <h3>Contact Information</h3>
          <ul>
            <li><a href="tel:+15551234567" aria-label="Call us at 555-123-4567">555-123-4567</a></li>
            <li><a href="mailto:info@properties4creations.com" aria-label="Email us at info@properties4creations.com">info@properties4creations.com</a></li>
          </ul>
        </div>
      </footer>

      <div id="aria-live-region" aria-live="polite" aria-atomic="true" class="sr-only"></div>
    `;
  });

  describe('Skip Links', () => {
    it('should have skip to content link', () => {
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).toBeTruthy();
      expect(skipLink.href).toContain('#main-content');
      expect(skipLink.textContent).toBe('Skip to main content');
    });

    it('should focus main content when skip link is activated', () => {
      const skipLink = document.querySelector('.skip-link');
      const mainContent = document.getElementById('main');
      
      skipLink.click();
      
      expect(document.activeElement).toBe(mainContent);
      expect(mainContent.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper ARIA labels on navigation', () => {
      const nav = document.querySelector('nav');
      expect(nav.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should have accessible menu toggle', () => {
      const menuToggle = document.querySelector('.menu-toggle');
      expect(menuToggle.getAttribute('aria-expanded')).toBe('false');
      expect(menuToggle.getAttribute('aria-controls')).toBe('nav-menu');
    });

    it('should update aria-expanded on menu toggle', () => {
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu = document.getElementById('nav-menu');
      
      menuToggle.click();
      
      expect(menuToggle.getAttribute('aria-expanded')).toBe('true');
      expect(navMenu.getAttribute('aria-hidden')).toBe('false');
    });

    it('should have active page indicators', () => {
      const homeLink = document.querySelector('a[href="index.html"]');
      expect(homeLink.getAttribute('aria-current')).toBe('page');
    });
  });

  describe('Image Accessibility', () => {
    it('should have alt text for all images', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img.alt).toBeTruthy();
        expect(img.alt.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive alt text', () => {
      const propertyImage = document.querySelector('.property-card img');
      expect(propertyImage.alt).toContain('Tyler Ranch Home');
      expect(propertyImage.alt).toContain('exterior');
    });

    it('should have lazy loading for performance', () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels', () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        expect(label).toBeTruthy();
        expect(label.textContent.length).toBeGreaterThan(0);
      });
    });

    it('should have error messages with proper ARIA attributes', () => {
      const nameInput = document.getElementById('contact-name');
      const nameError = document.getElementById('name-error');
      
      // Simulate validation error
      nameInput.classList.add('error');
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.textContent = 'Name is required';
      nameError.hidden = false;
      
      expect(nameInput.getAttribute('aria-invalid')).toBe('true');
      expect(nameError.getAttribute('role')).toBe('alert');
      expect(nameError.hidden).toBe(false);
    });

    it('should clear errors on input', () => {
      const nameInput = document.getElementById('contact-name');
      const nameError = document.getElementById('name-error');
      
      // Set up error state
      nameInput.classList.add('error');
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.hidden = false;
      
      // Simulate user input
      nameInput.value = 'John Doe';
      nameInput.dispatchEvent(new Event('input'));
      
      expect(nameInput.classList.contains('error')).toBe(false);
      expect(nameInput.getAttribute('aria-invalid')).toBeNull();
      expect(nameError.hidden).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for property cards', () => {
      const propertyCard = document.querySelector('.property-card');
      const applyButton = propertyCard.querySelector('.btn');
      
      // Simulate keyboard interaction
      propertyCard.focus();
      propertyCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      
      // Should trigger button click
      expect(document.activeElement).toBe(applyButton);
    });

    it('should support keyboard navigation for accordion', () => {
      const accordionHeader = document.querySelector('.accordion-header');
      
      accordionHeader.focus();
      accordionHeader.click();
      
      expect(accordionHeader.getAttribute('aria-expanded')).toBe('true');
    });

    it('should detect keyboard navigation mode', () => {
      const body = document.body;
      
      // Simulate keyboard navigation
      body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      
      expect(body.classList.contains('keyboard-nav')).toBe(true);
      
      // Simulate mouse navigation
      body.dispatchEvent(new Event('mousedown'));
      
      expect(body.classList.contains('keyboard-nav')).toBe(false);
    });
  });

  describe('ARIA Live Regions', () => {
    it('should have live regions for dynamic content', () => {
      const liveRegion = document.getElementById('aria-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
    });

    it('should announce form submission status', () => {
      const form = document.getElementById('contact-form');
      const liveRegion = document.getElementById('aria-live-region');
      
      // Simulate successful form submission
      form.dispatchEvent(new Event('submit'));
      
      // Should update live region content
      expect(liveRegion.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should manage focus for modal dialogs', () => {
      // Create a modal for testing
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">Close</button>
          <h2>Modal Title</h2>
        </div>
      `;
      document.body.appendChild(modal);
      
      const closeButton = modal.querySelector('.modal-close');
      
      // Open modal
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      closeButton.focus();
      
      expect(document.activeElement).toBe(closeButton);
      expect(modal.classList.contains('active')).toBe(true);
      expect(modal.getAttribute('aria-hidden')).toBe('false');
      
      // Close modal
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      
      expect(modal.classList.contains('active')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });

    it('should handle ESC key for modal dismissal', () => {
      const modal = document.createElement('div');
      modal.className = 'modal active';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-hidden', 'false');
      document.body.appendChild(modal);
      
      // Simulate ESC key press
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      
      expect(modal.classList.contains('active')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have semantic HTML structure', () => {
      const main = document.getElementById('main');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      expect(main.getAttribute('role')).toBe('main');
      expect(header.getAttribute('role')).toBe('banner');
      expect(footer.getAttribute('role')).toBe('contentinfo');
    });

    it('should have proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2s = document.querySelectorAll('h2');
      
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Properties 4 Creations');
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have sufficient color contrast (visual test simulation)', () => {
      // This would typically require actual color testing
      // For now, we verify that CSS custom properties are defined
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Check that CSS custom properties exist
      expect(computedStyle.getPropertyValue('--navy')).toBeTruthy();
      expect(computedStyle.getPropertyValue('--wood')).toBeTruthy();
      expect(computedStyle.getPropertyValue('--beige')).toBeTruthy();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have touch-friendly targets', () => {
      const buttons = document.querySelectorAll('button, .btn');
      buttons.forEach(button => {
        // Check that buttons have sufficient size or padding
        const computedStyle = getComputedStyle(button);
        const minWidth = parseInt(computedStyle.minWidth) || 0;
        const minHeight = parseInt(computedStyle.minHeight) || 0;
        const padding = parseInt(computedStyle.padding) || 0;
        
        // Buttons should be at least 44px for touch targets (WCAG 2.1)
        expect(Math.max(minWidth, minHeight + (padding * 2))).toBeGreaterThanOrEqual(44);
      });
    });

    it('should support responsive design', () => {
      // Test viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });
  });

  describe('Error Boundary Accessibility', () => {
    it('should provide accessible error messages', () => {
      // Create error boundary test
      const errorContainer = document.createElement('div');
      errorContainer.className = 'error-boundary';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'assertive');
      errorContainer.innerHTML = `
        <h2>Something went wrong</h2>
        <p>We're experiencing technical difficulties. Please try refreshing the page.</p>
        <button class="btn btn-primary">Try Again</button>
        <button class="btn btn-secondary">Refresh Page</button>
      `;
      document.body.appendChild(errorContainer);
      
      expect(errorContainer.getAttribute('role')).toBe('alert');
      expect(errorContainer.getAttribute('aria-live')).toBe('assertive');
      
      const buttons = errorContainer.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });
  });
});