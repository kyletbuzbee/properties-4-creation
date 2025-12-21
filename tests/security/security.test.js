/**
 * Security Testing Suite for Properties 4 Creations
 * Tests XSS vulnerabilities, input sanitization, and security measures
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeHtml, sanitizeEmail, sanitizePhone, cleanUserInput } from '../src/js/utils/sanitizer.js';

describe('Security Tests', () => {
  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = `
      <form id="test-form">
        <input type="text" id="name" name="name" value="">
        <input type="email" id="email" name="email" value="">
        <input type="tel" id="phone" name="phone" value="">
        <textarea id="message" name="message"></textarea>
        <button type="submit">Submit</button>
      </form>
      <div id="test-output"></div>
    `;
  });

  describe('XSS Prevention', () => {
    it('should sanitize HTML content and remove malicious scripts', () => {
      const maliciousInput = '<script>alert("XSS")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="javascript:alert(1)"></iframe>';
      const sanitized = sanitizeHtml(input);
      
      expect(sanitized).not.toContain('<iframe');
    });

    it('should remove dangerous attributes', () => {
      const input = '<div onclick="alert(1)" onload="alert(2)">Content</div>';
      const sanitized = sanitizeHtml(input);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onload');
    });

    it('should handle nested malicious content', () => {
      const input = '<div><script><img src=x onerror=alert(1)></script></div>';
      const sanitized = sanitizeHtml(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
    });
  });

  describe('Input Sanitization', () => {
    it('should clean user input of dangerous content', () => {
      const dangerousInput = '<script>alert("test")</script>Normal text';
      const cleaned = cleanUserInput(dangerousInput);
      
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).toContain('Normal text');
    });

    it('should handle undefined and null inputs', () => {
      expect(cleanUserInput(null)).toBe('');
      expect(cleanUserInput(undefined)).toBe('');
      expect(cleanUserInput(123)).toBe('123');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("test")';
      const cleaned = cleanUserInput(input);
      
      expect(cleaned).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('should validate proper email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(sanitizeEmail(email)).toBe(email.toLowerCase());
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        'javascript:alert(1)'
      ];

      invalidEmails.forEach(email => {
        expect(sanitizeEmail(email)).toBe('');
      });
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(undefined)).toBe('');
      expect(sanitizeEmail(123)).toBe('');
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '555-123-4567',
        '(555) 123-4567',
        '+1 (555) 123-4567',
        '555.123.4567',
        '555 123 4567'
      ];

      validPhones.forEach(phone => {
        expect(sanitizePhone(phone)).toBe(phone.replace(/[^\d+()]/g, ''));
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'abc-def-ghij',
        '123',
        '12345678901234567890', // Too long
        ''
      ];

      invalidPhones.forEach(phone => {
        expect(sanitizePhone(phone)).toBe('');
      });
    });

    it('should handle non-string inputs', () => {
      expect(sanitizePhone(null)).toBe('');
      expect(sanitizePhone(undefined)).toBe('');
      expect(sanitizePhone(123)).toBe('');
    });
  });

  describe('Form Security', () => {
    it('should prevent XSS in form submissions', () => {
      const form = document.getElementById('test-form');
      const nameInput = document.getElementById('name');
      const messageArea = document.getElementById('message');
      const outputDiv = document.getElementById('test-output');

      // Simulate malicious form data
      nameInput.value = '<script>alert("XSS")</script>John Doe';
      messageArea.value = '<img src=x onerror=alert(1)>';

      // Simulate form processing
      const processedName = cleanUserInput(nameInput.value);
      const processedMessage = cleanUserInput(messageArea.value);

      // Display processed content (simulating what would be shown to users)
      outputDiv.innerHTML = `<p>Name: ${processedName}</p><p>Message: ${processedMessage}</p>`;

      // Verify no malicious content is present
      expect(outputDiv.innerHTML).not.toContain('<script>');
      expect(outputDiv.innerHTML).not.toContain('onerror');
      expect(outputDiv.innerHTML).toContain('John Doe');
    });

    it('should handle form validation errors gracefully', () => {
      const form = document.getElementById('test-form');
      const emailInput = document.getElementById('email');

      // Test invalid email
      emailInput.value = 'invalid-email';
      
      const sanitizedEmail = sanitizeEmail(emailInput.value);
      expect(sanitizedEmail).toBe('');

      // Test valid email
      emailInput.value = 'test@example.com';
      const validEmail = sanitizeEmail(emailInput.value);
      expect(validEmail).toBe('test@example.com');
    });
  });

  describe('Content Security', () => {
    it('should prevent data URI attacks', () => {
      const dangerousContent = 'data:text/html,<script>alert(1)</script>';
      const sanitized = sanitizeHtml(dangerousContent);
      
      expect(sanitized).toBe('');
    });

    it('should handle vbscript attacks', () => {
      const input = '<vbscript>alert("test")</vbscript>';
      const sanitized = sanitizeHtml(input);
      
      expect(sanitized).toBe('');
    });

    it('should prevent file protocol attacks', () => {
      const input = 'file:///etc/passwd';
      const cleaned = cleanUserInput(input);
      
      expect(cleaned).toBe('');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', () => {
      // Test that error messages don't leak internal paths or sensitive data
      const testError = new Error('Database connection failed at /var/www/properties4creations/db.php');
      const errorMessage = testError.message;
      
      // Error messages should be sanitized before display
      const sanitizedError = cleanUserInput(errorMessage);
      expect(sanitizedError).not.toContain('/var/www/');
      expect(sanitizedError).not.toContain('.php');
    });

    it('should handle malformed input gracefully', () => {
      const malformedInputs = [
        null,
        undefined,
        {},
        [],
        Symbol('test'),
        BigInt(123)
      ];

      malformedInputs.forEach(input => {
        expect(() => cleanUserInput(input)).not.toThrow();
        expect(cleanUserInput(input)).toBeDefined();
      });
    });
  });
});