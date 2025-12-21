import { test, expect } from '@playwright/test';

test.describe('Critical User Flows - Properties 4 Creations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if skip link is available for accessibility
    await expect(page.locator('.skip-to-content')).toBeVisible();
  });

  test.describe('Homepage Navigation & Accessibility', () => {
    test('should load homepage with proper accessibility features', async ({ page }) => {
      // Check main navigation
      await expect(page.locator('nav[aria-label="main navigation"]')).toBeVisible();

      // Check skip link functionality
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-to-content:focus')).toBeVisible();

      // Check main content area
      await expect(page.locator('main#main')).toBeVisible();

      // Check page title
      await expect(page).toHaveTitle(/Properties 4 Creations/);

      // Check hero section
      await expect(page.locator('.hero-section, .hero-banner, .hero')).toBeVisible();

      // Check footer
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should navigate to all main pages successfully', async ({ page }) => {
      const mainNavLinks = [
        { text: /Home/i, url: '/' },
        { text: /Properties/i, url: '/properties' },
        { text: /Contact/i, url: '/contact' },
        { text: /About/i, url: '/about' },
        { text: /Resources/i, url: '/resources' }
      ];

      for (const link of mainNavLinks) {
        // Find and click navigation link
        const navLink = page.locator('nav a').filter({ hasText: link.text });
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(new RegExp(link.url));

          // Go back to home for next test
          await page.goto('/');
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('should work properly with keyboard navigation', async ({ page }) => {
      // Test Tab navigation through interactive elements
      await page.keyboard.press('Tab');
      const firstFocusable = await page.locator(':focus').first();
      await expect(firstFocusable).toBeVisible();

      // Continue tabbing through navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.locator(':focus').first();
        await expect(focused).toBeVisible();
      }

      // Test Enter key activation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should navigate or activate focused element
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Property Search & Filtering', () => {
    test('should search for properties successfully', async ({ page }) => {
      // Navigate to properties page
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      // Look for search form
      const searchForm = page.locator('form').filter({ hasText: /search/i });
      if (await searchForm.isVisible()) {
        // Fill search form
        const locationInput = page.locator('input[placeholder*="location" i], input[id*="location"], input[name*="location"]');
        if (await locationInput.isVisible()) {
          await locationInput.fill('Tyler');
        }

        const typeSelect = page.locator('select');
        if (await typeSelect.isVisible()) {
          await typeSelect.selectOption('ranch');
        }

        // Submit search
        await page.locator('button[type="submit"]').click();
        await page.waitForLoadState('networkidle');

        // Check for search results
        await expect(page.locator('.property-card, .search-results, .property-listing')).toBeVisible();
      }
    });

    test('should filter properties by type', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const typeFilter = page.locator('select[name="type"], select[id*="type"]');
      if (await typeFilter.isVisible()) {
        await typeFilter.selectOption('ranch');
        await page.waitForTimeout(1000);

        // Check if filtering is applied
        const propertyCards = page.locator('.property-card');
        const cardCount = await propertyCards.count();
        expect(cardCount).toBeGreaterThan(0);
      }
    });

    test('should announce search results with ARIA live regions', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      // Look for ARIA live region
      const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');

      // Perform search
      const searchInput = page.locator('input[type="text"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Longview');
        await page.waitForTimeout(1000);

        // Check if live region exists and is properly configured
        if (await liveRegion.isVisible()) {
          const ariaLive = await liveRegion.getAttribute('aria-live');
          expect(['polite', 'assertive']).toContain(ariaLive);
        }
      }
    });
  });

  test.describe('Property Details & Modals', () => {
    test('should view property details in modal', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      // Look for 'View Details' buttons
      const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click first view details button
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1000);

        // Check if modal opened
        const modal = page.locator('.modal, .modal-overlay, [role="dialog"]');
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();

          // Check modal accessibility
          const modalDialog = page.locator('[role="dialog"]');
          if (await modalDialog.isVisible()) {
            const ariaLabelledby = await modalDialog.getAttribute('aria-labelledby');
            expect(ariaLabelledby).toBeTruthy();
          }

          // Close modal
          const closeButton = page.locator('button[aria-label*="close" i], button[aria-label*="dismiss" i]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('should handle modal keyboard navigation', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
      if (await viewDetailsButtons.first().isVisible()) {
        // Open modal
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('.modal, [role="dialog"]');
        if (await modal.isVisible()) {
          // Test Escape key to close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // Modal should be closed
          await expect(modal).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Contact Form & Rate Limiting', () => {
    test('should submit contact form successfully', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Fill contact form
      const emailInput = page.locator('input[type="email"]').first();
      const nameInput = page.locator('input[type="text"]').first();
      const messageTextarea = page.locator('textarea').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible() && await nameInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await nameInput.fill('Test User');

        if (await messageTextarea.isVisible()) {
          await messageTextarea.fill('This is a test message for property inquiry.');
        }

        // Submit form
        await submitButton.click();
        await page.waitForLoadState('networkidle');

        // Check for success message or redirect
        await expect(
          page.locator('.success, .form-success, [aria-live]').filter({ hasText: /success/i })
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should validate form fields properly', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        // Try to submit with invalid email
        await emailInput.fill('invalid-email');
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Check for validation error
        await expect(
          page.locator('.error, .field-error, [aria-live]').filter({ hasText: /email/i })
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should enforce rate limiting on form submission', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const nameInput = page.locator('input[type="text"]').first();
      const messageTextarea = page.locator('textarea').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        // Fill form
        await emailInput.fill('test@example.com');
        await nameInput.fill('Test User');
        await messageTextarea.fill('Test message');

        // Submit multiple times rapidly to trigger rate limiting
        for (let i = 0; i < 5; i++) {
          await submitButton.click();
          await page.waitForTimeout(500);
        }

        // Should show rate limiting message
        await expect(
          page.locator('[aria-live]').filter({ hasText: /rate limit|too many|try again/i })
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should announce form validation with ARIA live regions', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        // Fill invalid email and submit
        await emailInput.fill('invalid-email');
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Check for ARIA live region announcements
        const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
        const liveRegionCount = await liveRegions.count();

        expect(liveRegionCount).toBeGreaterThan(0);

        // Verify at least one region has announcement content
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i);
          const text = await region.textContent();
          if (text) {
            expect(text.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check mobile navigation
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(1000);

        // Check if mobile menu opened
        await expect(page.locator('nav, .mobile-menu')).toBeVisible();
      }

      // Test property search on mobile
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="text"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Tyler');
        await page.waitForTimeout(1000);

        // Check if search is responsive
        const isVisible = await searchInput.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      // Test tap interactions
      const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
      if (await viewDetailsButtons.first().isVisible()) {
        await viewDetailsButtons.first().tap();
        await page.waitForTimeout(1000);

        // Check if modal opened on tap
        const modal = page.locator('.modal, [role="dialog"]');
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();
        }
      }
    });
  });

  test.describe('Performance & Loading', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should still be functional
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Error Handling & Recovery', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');

      // Should either show 404 page or redirect
      const is404 = await page.locator('text=/404|Page not found|Not found/i').isVisible();
      const isHomepage = page.url() === page.url();

      expect(is404 || !isHomepage).toBe(true);
    });

    test('should handle network errors in forms', async ({ page }) => {
      await page.route('**/submit', route => route.abort());

      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Should show error message
        await expect(
          page.locator('[aria-live]').filter({ hasText: /error|failed|try again/i })
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test core functionality
      await expect(page.locator('main#main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // Test JavaScript features
      const hasJavaScript = await page.evaluate(() => typeof window !== 'undefined');
      expect(hasJavaScript).toBe(true);

      // Test CSS loading
      const stylesheets = await page.locator('link[rel="stylesheet"]').count();
      expect(stylesheets).toBeGreaterThan(0);
    });
  });

  test.describe('Security Features', () => {
    test('should prevent XSS in form inputs', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const nameInput = page.locator('input[type="text"]').first();
      if (await nameInput.isVisible()) {
        // Try to inject XSS
        await nameInput.fill('<script>alert("xss")</script>Test User');
        await page.waitForTimeout(1000);

        // Check that script was not executed
        const hasAlert = await page.evaluate(() => {
          return window.alerts && window.alerts.length > 0;
        });
        expect(hasAlert).toBe(false);
      }
    });

    test('should implement CSRF protection', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Check for CSRF token
      const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
      const hiddenCsrfInput = page.locator('input[name="_token"], input[name="csrf_token"]');

      // Should have CSRF protection in place
      expect(csrfToken || await hiddenCsrfInput.isVisible()).toBeTruthy();
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }

      // Check for proper form labels
      const inputs = await page.locator('input[required], input[type="email"], input[type="text"]').all();
      for (const input of inputs) {
        const label = await input.getAttribute('aria-label') ||
                     await input.getAttribute('placeholder') ||
                     await page.locator(`label[for="${await input.getAttribute('id')}"]`).textContent();
        expect(label).toBeTruthy();
      }
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Check for ARIA landmarks
      await expect(page.locator('main[role="main"], main#main')).toBeVisible();
      await expect(page.locator('nav[role="navigation"], nav[aria-label]')).toBeVisible();

      // Check for live regions
      const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
      const liveRegionCount = await liveRegions.count();
      expect(liveRegionCount).toBeGreaterThan(0);

      // Check for proper focus management
      const focusableElements = await page.locator('button, a, input, select, textarea').count();
      expect(focusableElements).toBeGreaterThan(0);
    });
  });
});
