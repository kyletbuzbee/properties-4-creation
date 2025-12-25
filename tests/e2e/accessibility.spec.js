import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Testing - Properties 4 Creations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('should pass automated accessibility audit on homepage', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag21aa', 'wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit on properties page', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit on contact page', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard-only navigation through main menu', async ({ page }) => {
      // Focus on skip link first
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-to-content:focus')).toBeVisible();

      // Navigate through main menu items
      const menuItems = page.locator('nav a');
      const itemCount = await menuItems.count();

      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        await page.keyboard.press('Tab');
        const focusedItem = page.locator(':focus');
        await expect(focusedItem).toBeVisible();
      }
    });

    test('should support keyboard navigation in property search', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      // Navigate to search input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      if (await focusedElement.isVisible()) {
        const elementType = await focusedElement.evaluate(el => el.tagName);
        expect(['INPUT', 'SELECT', 'BUTTON']).toContain(elementType);
      }
    });

    test('should support keyboard navigation in contact form', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Navigate through form fields
      const formFields = page.locator('input, textarea, button');
      const fieldCount = await formFields.count();

      for (let i = 0; i < Math.min(fieldCount, 5); i++) {
        await page.keyboard.press('Tab');
        const focusedField = page.locator(':focus');
        await expect(focusedField).toBeVisible();
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA landmarks', async ({ page }) => {
      const landmarks = {
        'banner': await page.locator('[role="banner"]').count(),
        'main': await page.locator('[role="main"]').count(),
        'navigation': await page.locator('[role="navigation"]').count(),
        'contentinfo': await page.locator('[role="contentinfo"]').count()
      };

      expect(landmarks.banner).toBeGreaterThan(0);
      expect(landmarks.main).toBeGreaterThan(0);
      expect(landmarks.navigation).toBeGreaterThan(0);
      expect(landmarks.contentinfo).toBeGreaterThan(0);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
  
      expect(h1).toBeGreaterThan(0);
      expect(h2).toBeGreaterThan(0);
  
      // Check that heading hierarchy is logical
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      for (let i = 1; i < headings.length; i++) {
        const prevLevel = await headings[i - 1].evaluate(el => parseInt(el.tagName.substring(1)));
        const currLevel = await headings[i].evaluate(el => parseInt(el.tagName.substring(1)));
  
        // Heading levels should not skip more than one level
        expect(Math.abs(currLevel - prevLevel)).toBeLessThanOrEqual(1);
      }
    });

    test('should have ARIA live regions for dynamic content', async ({ page }) => {
      const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
      const liveRegionCount = await liveRegions.count();

      expect(liveRegionCount).toBeGreaterThan(0);

      // Check that live regions are properly configured
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        const ariaAtomic = await region.getAttribute('aria-atomic');
        
        expect(['polite', 'assertive']).toContain(ariaLive);
        expect(ariaAtomic).toBe('true');
      }
    });
  });

  test.describe('Image Accessibility', () => {
    test('should have descriptive alt text for all images', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // Skip empty alt for decorative images
        if (src && !src.includes('placeholder') && !src.includes('spacer')) {
          expect(alt).toBeTruthy();
          expect(alt.length).toBeGreaterThan(3); // Meaningful description
        }
      }
    });

    test('should use lazy loading for performance', async ({ page }) => {
      const lazyImages = page.locator('img[loading="lazy"]');
      const lazyImageCount = await lazyImages.count();

      expect(lazyImageCount).toBeGreaterThan(0);
    });

    test('should have proper image dimensions for layout stability', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        
        // Images should have explicit dimensions to prevent layout shifts
        if (width && height) {
          expect(parseInt(width)).toBeGreaterThan(0);
          expect(parseInt(height)).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper labels for all form fields', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const inputs = await page.locator('input[required], textarea[required]').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        
        // Check for associated label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelExists = await label.count() > 0;
          expect(labelExists || ariaLabel || placeholder).toBe(true);
        }
      }
    });

    test('should have accessible error messages', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        // Submit with invalid email
        await emailInput.fill('invalid-email');
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Check for error messages with proper ARIA attributes
        const errorMessages = page.locator('[role="alert"], [aria-live="assertive"]');
        const errorCount = await errorMessages.count();
        
        expect(errorCount).toBeGreaterThan(0);
      }
    });

    test('should have accessible form validation', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const requiredInputs = page.locator('input[required], textarea[required]');
      const requiredCount = await requiredInputs.count();

      expect(requiredCount).toBeGreaterThan(0);

      // Check that required fields have proper indicators
      for (let i = 0; i < requiredCount; i++) {
        const input = requiredInputs.nth(i);
        const ariaRequired = await input.getAttribute('aria-required');
        
        expect(ariaRequired).toBe('true');
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast for text', async ({ page }) => {
      // This test would typically use a visual testing tool
      // For now, we verify that high-contrast CSS classes are applied
      const highContrastElements = page.locator('.high-contrast, .contrast-text');
      const highContrastCount = await highContrastElements.count();

      expect(highContrastCount).toBeGreaterThan(0);
    });

    test('should support dark mode for better accessibility', async ({ page }) => {
      // Check for dark mode support
      const html = page.locator('html');
      const hasDarkModeClass = await html.evaluate(el => 
        el.classList.contains('dark-mode') || 
        el.getAttribute('data-theme') === 'dark'
      );

      // Dark mode should be available (may not be active by default)
      expect(hasDarkModeClass).toBe(false); // Not active by default

      // Check for dark mode toggle
      const darkModeToggle = page.locator('button[aria-label*="dark" i], button[aria-label*="theme" i]');
      const toggleExists = await darkModeToggle.count() > 0;
      
      expect(toggleExists).toBe(true);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have touch-friendly targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button, a[role="button"]').all();
      
      for (const button of buttons) {
        const computedStyle = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            minWidth: parseInt(style.minWidth) || 0,
            minHeight: parseInt(style.minHeight) || 0,
            padding: parseInt(style.padding) || 0
          };
        });

        // Touch targets should be at least 44px (WCAG 2.1)
        const effectiveSize = Math.max(
          computedStyle.minWidth,
          computedStyle.minHeight + (computedStyle.padding * 2)
        );
        
        expect(effectiveSize).toBeGreaterThanOrEqual(44);
      }
    });

    test('should have accessible mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle');
      const mobileMenuButtonExists = await mobileMenuButton.count() > 0;

      expect(mobileMenuButtonExists).toBe(true);

      if (mobileMenuButtonExists) {
        await mobileMenuButton.click();
        await page.waitForTimeout(1000);

        // Mobile menu should open
        const mobileMenu = page.locator('nav.mobile-nav, .mobile-menu');
        const mobileMenuVisible = await mobileMenu.isVisible();
        
        expect(mobileMenuVisible).toBe(true);
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.focus();
        
        const computedStyle = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.outline || style.border;
        });

        expect(computedStyle).toBeTruthy();
      }
    });

    test('should manage focus for modal dialogs', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
      if (await viewDetailsButtons.first().isVisible()) {
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('.modal, [role="dialog"]');
        if (await modal.isVisible()) {
          // Focus should be trapped within modal
          const focusedElement = page.locator(':focus');
          const focusedElementInModal = await modal.evaluate((modal, focusedElement) => {
            return modal.contains(focusedElement);
          }, await focusedElement.elementHandle());

          expect(focusedElementInModal).toBe(true);

          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
          expect(await modal.isVisible()).toBe(false);
        }
      }
    });

    test('should restore focus after modal closes', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');

      const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
      const firstButton = viewDetailsButtons.first();

      if (await firstButton.isVisible()) {
        // Focus on button before opening modal
        await firstButton.focus();
        const buttonId = await firstButton.getAttribute('id');

        // Open modal
        await firstButton.click();
        await page.waitForTimeout(1000);

        const modal = page.locator('.modal, [role="dialog"]');
        if (await modal.isVisible()) {
          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // Focus should return to the button that opened the modal
          const focusedElement = page.locator(':focus');
          const focusedElementId = await focusedElement.getAttribute('id');
          
          expect(focusedElementId).toBe(buttonId);
        }
      }
    });
  });

  test.describe('Error Handling Accessibility', () => {
    test('should provide accessible error messages for failed operations', async ({ page }) => {
      // Simulate a network error
      await page.route('**/submit', route => route.abort());

      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Should show error message with proper ARIA attributes
        const errorMessages = page.locator('[role="alert"], [aria-live="assertive"]');
        const errorMessageVisible = await errorMessages.isVisible();
        
        expect(errorMessageVisible).toBe(true);
      }
    });

    test('should handle 404 pages accessibly', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');

      // Should either show accessible 404 page or redirect
      const is404 = await page.locator('text=/404|Page not found|Not found/i').isVisible();
      const isHomepage = page.url() === 'http://localhost:8080/';

      expect(is404 || isHomepage).toBe(true);

      if (is404) {
        // 404 page should have proper heading
        await expect(page.locator('h1')).toContainText(/404|Page not found|Not found/i);
      }
    });
  });

  test.describe('Performance Impact on Accessibility', () => {
    test('should load accessibility features quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Accessibility features should not significantly impact performance
      expect(loadTime).toBeLessThan(5000);

      // Check that accessibility script loads quickly
      const accessibilityScript = page.locator('script[src*="accessibility"]');
      const scriptLoaded = await accessibilityScript.count() > 0;
      
      expect(scriptLoaded).toBe(true);
    });

    test('should prioritize critical accessibility features', async ({ page }) => {
      // Check for critical CSS that includes accessibility features
      const criticalStyles = page.locator('style[data-critical], link[rel="stylesheet"][data-critical]');
      const criticalStylesCount = await criticalStyles.count();

      expect(criticalStylesCount).toBeGreaterThan(0);
    });
  });
});