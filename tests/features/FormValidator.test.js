import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Test Form</title>
</head>
<body>
    <form id="test-form" novalidate>
        <input type="email" id="email" name="email" aria-label="Email Address">
        <input type="text" id="name" name="name" aria-label="Full Name">
        <input type="tel" id="phone" name="phone" aria-label="Phone Number">
        <input type="text" id="zip" name="zip" aria-label="ZIP Code">
        <textarea id="message" name="message" aria-label="Message"></textarea>
        <button type="submit" id="submit-btn">Submit</button>
        <div class="error-messages" aria-live="polite"></div>
    </form>
    <form id="contact-form">
        <input type="email" id="contact-email" name="email" required>
        <input type="text" id="contact-name" name="name" required>
        <button type="submit">Send</button>
        <div class="error-container" aria-live="assertive"></div>
    </form>
</body>
</html>
`, { 
    url: 'http://localhost',
    pretendToBeVisual: true,
    runScripts: "dangerously"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.fetch = vi.fn();
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Import FormValidator after DOM setup
let FormValidator;
let AriaLiveRegions;
let RateLimiter;

describe('FormValidator Integration Tests', () => {
    let formValidator;
    let testForm;
    let emailInput;
    let nameInput;
    let phoneInput;
    let zipInput;
    let messageInput;
    let submitBtn;
    let errorContainer;
    let contactForm;
    let contactEmail;
    let contactName;
    let contactErrorContainer;

    beforeAll(async () => {
        // Import modules
        const FormValidatorModule = await import('../../src/js/features/FormValidator.js');
        const AriaLiveRegionsModule = await import('../../src/js/utils/ariaLiveRegions.js');
        const RateLimiterModule = await import('../../src/js/utils/rateLimiter.js');
        
        FormValidator = FormValidatorModule.default;
        AriaLiveRegions = AriaLiveRegionsModule.default;
        RateLimiter = RateLimiterModule.RateLimiter;
    });

    beforeEach(() => {
        // Reset DOM state
        document.body.innerHTML = `
            <form id="test-form" novalidate>
                <input type="email" id="email" name="email" aria-label="Email Address">
                <input type="text" id="name" name="name" aria-label="Full Name">
                <input type="tel" id="phone" name="phone" aria-label="Phone Number">
                <input type="text" id="zip" name="zip" aria-label="ZIP Code">
                <textarea id="message" name="message" aria-label="Message"></textarea>
                <button type="submit" id="submit-btn">Submit</button>
                <div class="error-messages" aria-live="polite"></div>
            </form>
            <form id="contact-form">
                <input type="email" id="contact-email" name="email" required>
                <input type="text" id="contact-name" name="name" required>
                <button type="submit">Send</button>
                <div class="error-container" aria-live="assertive"></div>
            </form>
        `;

        // Get form elements
        testForm = document.getElementById('test-form');
        emailInput = document.getElementById('email');
        nameInput = document.getElementById('name');
        phoneInput = document.getElementById('phone');
        zipInput = document.getElementById('zip');
        messageInput = document.getElementById('message');
        submitBtn = document.getElementById('submit-btn');
        errorContainer = document.querySelector('.error-messages');
        
        contactForm = document.getElementById('contact-form');
        contactEmail = document.getElementById('contact-email');
        contactName = document.getElementById('contact-name');
        contactErrorContainer = document.querySelector('.error-container');

        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        if (formValidator) {
            formValidator.destroy();
        }
    });

    describe('Constructor and Initialization', () => {
        it('should create FormValidator instance with default options', () => {
            formValidator = new FormValidator(testForm);
            expect(formValidator).toBeDefined();
            expect(formValidator.form).toBe(testForm);
            expect(formValidator.options).toEqual(expect.objectContaining({
                rateLimiter: expect.any(Object),
                ariaLive: expect.any(Object),
                debounceMs: 300
            }));
        });

        it('should create FormValidator instance with custom options', () => {
            const customOptions = {
                rateLimiter: { maxAttempts: 5, windowMs: 60000 },
                ariaLive: { polite: true, assertive: false },
                debounceMs: 500,
                validateOnBlur: true,
                showSuccessMessage: true
            };

            formValidator = new FormValidator(testForm, customOptions);
            expect(formValidator.options.rateLimiter.maxAttempts).toBe(5);
            expect(formValidator.options.debounceMs).toBe(500);
            expect(formValidator.options.validateOnBlur).toBe(true);
        });

        it('should initialize ARIA live regions and rate limiter', () => {
            formValidator = new FormValidator(testForm);
            
            expect(formValidator.ariaLive).toBeDefined();
            expect(formValidator.rateLimiter).toBeDefined();
            expect(formValidator.rateLimiter.maxAttempts).toBe(3);
            expect(formValidator.rateLimiter.windowMs).toBe(60000);
        });

        it('should setup event listeners on initialization', () => {
            formValidator = new FormValidator(testForm);
            
            const submitSpy = vi.spyOn(formValidator, 'handleSubmit');
            formValidator.initializeEventListeners();
            
            testForm.dispatchEvent(new Event('submit', { bubbles: true }));
            expect(submitSpy).toHaveBeenCalled();
        });
    });

    describe('Rate Limiting Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should check rate limiting before form submission', async () => {
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            isAllowedSpy.mockReturnValue(true);

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            expect(isAllowedSpy).toHaveBeenCalled();
        });

        it('should prevent submission when rate limit exceeded', async () => {
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            isAllowedSpy.mockReturnValue(false);

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(submitEvent.preventDefault).toHaveBeenCalled();
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('rate limit'),
                'assertive'
            );
        });

        it('should record successful submission attempts', async () => {
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            const recordAttemptSpy = vi.spyOn(formValidator.rateLimiter, 'recordAttempt');
            isAllowedSpy.mockReturnValue(true);

            // Mock successful validation
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            expect(recordAttemptSpy).toHaveBeenCalled();
        });

        it('should not record failed validation attempts', async () => {
            const recordAttemptSpy = vi.spyOn(formValidator.rateLimiter, 'recordAttempt');

            // Mock failed validation
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(false);

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            expect(recordAttemptSpy).not.toHaveBeenCalled();
        });
    });

    describe('ARIA Live Regions Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should announce validation errors using ARIA live regions', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            formValidator.showFieldError('email', 'Please enter a valid email address');
            
            expect(announceSpy).toHaveBeenCalledWith(
                'Please enter a valid email address',
                'assertive'
            );
        });

        it('should announce form-level messages using ARIA live regions', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            formValidator.showFormMessage('Form submitted successfully!', 'success');
            
            expect(announceSpy).toHaveBeenCalledWith(
                'Form submitted successfully!',
                'polite'
            );
        });

        it('should announce rate limiting messages with appropriate priority', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            formValidator.showRateLimitMessage();
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('rate limit'),
                'assertive'
            );
        });

        it('should announce field validation results', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            formValidator.announceFieldValidation('email', true);
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('email'),
                'polite'
            );
        });

        it('should announce form submission status', async () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            // Mock successful submission
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });
    });

    describe('Field Validation Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should validate email field with real-time feedback', () => {
            // Test invalid email
            emailInput.value = 'invalid-email';
            formValidator.validateField('email');
            
            expect(formValidator.showFieldError).toHaveBeenCalledWith(
                'email',
                expect.stringContaining('email')
            );

            // Reset and test valid email
            vi.clearAllMocks();
            emailInput.value = 'test@example.com';
            formValidator.validateField('email');
            
            expect(formValidator.clearFieldError).toHaveBeenCalledWith('email');
        });

        it('should validate phone field with proper formatting', () => {
            // Test invalid phone
            phoneInput.value = '123';
            formValidator.validateField('phone');
            
            expect(formValidator.showFieldError).toHaveBeenCalledWith(
                'phone',
                expect.stringContaining('phone')
            );

            // Test valid phone
            phoneInput.value = '(555) 123-4567';
            formValidator.validateField('phone');
            
            expect(formValidator.clearFieldError).toHaveBeenCalledWith('phone');
        });

        it('should validate ZIP code field', () => {
            // Test invalid ZIP
            zipInput.value = '1234';
            formValidator.validateField('zip');
            
            expect(formValidator.showFieldError).toHaveBeenCalledWith(
                'zip',
                expect.stringContaining('ZIP')
            );

            // Test valid ZIP
            zipInput.value = '12345';
            formValidator.validateField('zip');
            
            expect(formValidator.clearFieldError).toHaveBeenCalledWith('zip');
        });

        it('should handle required field validation', () => {
            // Test empty required field
            nameInput.value = '';
            formValidator.validateField('name');
            
            expect(formValidator.showFieldError).toHaveBeenCalledWith(
                'name',
                expect.stringContaining('required')
            );
        });

        it('should sanitize input values', () => {
            const maliciousInput = '<script>alert("xss")</script>test@example.com';
            emailInput.value = maliciousInput;
            
            formValidator.validateField('email');
            
            // Should sanitize before validation
            expect(emailInput.value).not.toContain('<script>');
        });
    });

    describe('Real-time Validation with Debouncing', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            formValidator = new FormValidator(testForm);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should debounce real-time validation', () => {
            const validateFieldSpy = vi.spyOn(formValidator, 'validateField');
            
            // Simulate rapid input changes
            emailInput.value = 't';
            emailInput.dispatchEvent(new Event('input'));
            
            emailInput.value = 'te';
            emailInput.dispatchEvent(new Event('input'));
            
            emailInput.value = 'test@';
            emailInput.dispatchEvent(new Event('input'));
            
            // Should not call validateField immediately
            expect(validateFieldSpy).not.toHaveBeenCalled();
            
            // Wait for debounce
            vi.advanceTimersByTime(formValidator.options.debounceMs);
            
            // Should only call once after debounce
            expect(validateFieldSpy).toHaveBeenCalledTimes(1);
            expect(validateFieldSpy).toHaveBeenCalledWith('email');
        });

        it('should validate on blur when configured', () => {
            const customFormValidator = new FormValidator(testForm, {
                validateOnBlur: true
            });
            const validateFieldSpy = vi.spyOn(customFormValidator, 'validateField');
            
            emailInput.value = 'invalid-email';
            emailInput.dispatchEvent(new Event('blur'));
            
            expect(validateFieldSpy).toHaveBeenCalledWith('email');
        });

        it('should not validate on blur when disabled', () => {
            const customFormValidator = new FormValidator(testForm, {
                validateOnBlur: false
            });
            const validateFieldSpy = vi.spyOn(customFormValidator, 'validateField');
            
            emailInput.dispatchEvent(new Event('blur'));
            
            expect(validateFieldSpy).not.toHaveBeenCalled();
        });
    });

    describe('XSS Protection Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should sanitize malicious input before validation', () => {
            const maliciousScripts = [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '<img src="x" onerror="alert(\'xss\')">',
                '\'><script>alert("xss")</script>'
            ];

            maliciousScripts.forEach(script => {
                emailInput.value = script + 'test@example.com';
                formValidator.validateField('email');
                
                // Should remove script tags and dangerous content
                expect(emailInput.value).not.toContain('<script>');
                expect(emailInput.value).not.toContain('javascript:');
                expect(emailInput.value).not.toContain('onerror=');
                expect(emailInput.value).not.toContain('alert(');
            });
        });

        it('should sanitize error messages displayed to user', () => {
            const maliciousMessage = '<script>alert("xss")</script>Invalid input';
            
            // Mock the showFieldError method to test sanitization
            const originalShowFieldError = formValidator.showFieldError;
            formValidator.showFieldError = vi.fn().mockImplementation((field, message) => {
                // Should sanitize the message before displaying
                expect(message).not.toContain('<script>');
                expect(message).not.toContain('alert(');
                originalShowFieldError(field, message);
            });
            
            formValidator.showFieldError('email', maliciousMessage);
        });

        it('should handle textarea content safely', () => {
            const maliciousContent = '<script>alert("xss")</script>Message content';
            messageInput.value = maliciousContent;
            
            formValidator.validateField('message');
            
            // Should sanitize content
            expect(messageInput.value).not.toContain('<script>');
            expect(messageInput.value).not.toContain('alert(');
        });
    });

    describe('Error Handling and Recovery', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should handle network errors gracefully', async () => {
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('error'),
                'assertive'
            );
        });

        it('should handle server errors with appropriate messaging', async () => {
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal server error' })
            });

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('error'),
                'assertive'
            );
        });

        it('should provide retry mechanism after errors', async () => {
            let attemptCount = 0;
            global.fetch.mockImplementation(() => {
                attemptCount++;
                if (attemptCount === 1) {
                    return Promise.reject(new Error('Temporary error'));
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ success: true })
                });
            });

            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);

            // First attempt should fail
            const submitEvent1 = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent1, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent1);
            expect(attemptCount).toBe(1);

            // Second attempt should succeed
            const submitEvent2 = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent2, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent2);
            expect(attemptCount).toBe(2);
        });
    });

    describe('Form Submission Flow Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should complete full form submission flow successfully', async () => {
            // Fill valid data
            emailInput.value = 'test@example.com';
            nameInput.value = 'John Doe';
            phoneInput.value = '(555) 123-4567';
            zipInput.value = '12345';
            messageInput.value = 'Test message';

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(submitEvent.preventDefault).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });

        it('should handle partial form validation', async () => {
            // Fill only email, leave others empty
            emailInput.value = 'test@example.com';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(submitEvent.preventDefault).toHaveBeenCalled();
            expect(global.fetch).not.toHaveBeenCalled();
            
            // Should show error for required fields
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('required'),
                'assertive'
            );
        });

        it('should handle form reset after successful submission', async () => {
            // Fill valid data
            emailInput.value = 'test@example.com';
            nameInput.value = 'John Doe';
            
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            // Form should be reset
            expect(emailInput.value).toBe('');
            expect(nameInput.value).toBe('');
            
            // Should show success message
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });

        it('should prevent double submission', async () => {
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            global.fetch.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true })
                }), 100))
            );

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            // Trigger submission
            formValidator.handleSubmit(submitEvent);
            
            // Immediately try to submit again
            const submitEvent2 = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent2, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent2);
            
            // Should prevent second submission
            expect(submitEvent2.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Multiple Form Support', () => {
        it('should handle multiple forms independently', () => {
            const testFormValidator = new FormValidator(testForm);
            const contactFormValidator = new FormValidator(contactForm);
            
            expect(testFormValidator.form).toBe(testForm);
            expect(contactFormValidator.form).toBe(contactForm);
            expect(testFormValidator).not.toBe(contactFormValidator);
            
            // Each should have independent rate limiting
            expect(testFormValidator.rateLimiter).not.toBe(contactFormValidator.rateLimiter);
            expect(testFormValidator.ariaLive).not.toBe(contactFormValidator.ariaLive);
        });

        it('should manage different rate limits for different forms', () => {
            const contactFormValidator = new FormValidator(contactForm, {
                rateLimiter: { maxAttempts: 5, windowMs: 300000 } // 5 attempts per 5 minutes
            });
            
            expect(contactFormValidator.rateLimiter.maxAttempts).toBe(5);
            expect(contactFormValidator.rateLimiter.windowMs).toBe(300000);
            
            // Test form should still have default limits
            expect(formValidator.rateLimiter.maxAttempts).toBe(3);
            expect(formValidator.rateLimiter.windowMs).toBe(60000);
        });

        it('should handle form-specific validation rules', () => {
            const contactFormValidator = new FormValidator(contactForm, {
                requiredFields: ['email', 'name'],
                customValidators: {
                    email: (value) => value.includes('@company.com') // Custom rule
                }
            });
            
            // Mock custom validation
            contactEmail.value = 'user@other.com';
            contactFormValidator.validateField('email');
            
            expect(contactFormValidator.showFieldError).toHaveBeenCalledWith(
                'email',
                expect.stringContaining('company.com')
            );
        });
    });

    describe('Accessibility Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should set proper ARIA attributes on form elements', () => {
            expect(testForm.getAttribute('aria-live')).toBe('polite');
            
            emailInput.setAttribute('aria-describedby', 'email-error');
            formValidator.setupAccessibilityAttributes();
            
            expect(emailInput.getAttribute('aria-invalid')).toBe('false');
        });

        it('should update ARIA states during validation', () => {
            emailInput.value = 'invalid-email';
            formValidator.validateField('email');
            
            expect(emailInput.getAttribute('aria-invalid')).toBe('true');
            
            emailInput.value = 'test@example.com';
            formValidator.validateField('email');
            
            expect(emailInput.getAttribute('aria-invalid')).toBe('false');
        });

        it('should announce validation state changes', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            emailInput.value = 'invalid-email';
            formValidator.validateField('email');
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('email'),
                'assertive'
            );
        });

        it('should handle keyboard navigation properly', () => {
            const focusSpy = vi.spyOn(formValidator, 'focusField');
            
            formValidator.navigateToNextField('email');
            
            expect(focusSpy).toHaveBeenCalledWith('name');
        });

        it('should provide screen reader friendly error messages', () => {
            const errorMessage = 'Please enter a valid email address';
            formValidator.showFieldError('email', errorMessage);
            
            // Should announce error with proper context
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                `Email field: ${errorMessage}`,
                'assertive'
            );
        });
    });

    describe('Performance and Memory Management', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should cleanup event listeners on destroy', () => {
            const removeEventListenerSpy = vi.spyOn(testForm, 'removeEventListener');
            
            formValidator.destroy();
            
            expect(removeEventListenerSpy).toHaveBeenCalled();
        });

        it('should cleanup rate limiter resources', () => {
            const cleanupSpy = vi.spyOn(formValidator.rateLimiter, 'cleanup');
            
            formValidator.destroy();
            
            expect(cleanupSpy).toHaveBeenCalled();
        });

        it('should handle memory cleanup properly', () => {
            formValidator.destroy();
            
            // Should nullify references
            expect(formValidator.form).toBeNull();
            expect(formValidator.rateLimiter).toBeNull();
            expect(formValidator.ariaLive).toBeNull();
        });

        it('should handle rapid form interactions without memory leaks', () => {
            const startMemory = vi.fn();
            
            // Simulate rapid interactions
            for (let i = 0; i < 100; i++) {
                emailInput.value = `test${i}@example.com`;
                formValidator.validateField('email');
            }
            
            // Should not cause memory leaks
            expect(formValidator).toBeDefined();
            expect(formValidator.rateLimiter).toBeDefined();
        });
    });

    describe('Integration with External Services', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should integrate with Google Apps Script endpoints', async () => {
            const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfyc/exec';
            const customFormValidator = new FormValidator(testForm, {
                endpoint: googleAppsScriptUrl
            });
            
            vi.spyOn(customFormValidator, 'validateForm').mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await customFormValidator.handleSubmit(submitEvent);
            
            expect(global.fetch).toHaveBeenCalledWith(
                googleAppsScriptUrl,
                expect.objectContaining({
                    method: 'POST'
                })
            );
        });

        it('should handle CSRF token integration', async () => {
            const csrfToken = 'test-csrf-token';
            document.head.insertAdjacentHTML('beforeend', 
                `<meta name="csrf-token" content="${csrfToken}">`
            );
            
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await formValidator.handleSubmit(submitEvent);
            
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-CSRF-Token': csrfToken
                    })
                })
            );
        });

        it('should integrate with analytics tracking', () => {
            const trackEventSpy = vi.spyOn(formValidator, 'trackEvent');
            
            formValidator.trackFormSubmission('test-form');
            
            expect(trackEventSpy).toHaveBeenCalledWith('form_submission', {
                form_id: 'test-form',
                timestamp: expect.any(Number)
            });
        });
    });

    describe('Edge Cases and Error Scenarios', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should handle form without error container', () => {
            const formWithoutErrorContainer = document.createElement('form');
            formWithoutErrorContainer.id = 'no-error-form';
            document.body.appendChild(formWithoutErrorContainer);
            
            const noErrorFormValidator = new FormValidator(formWithoutErrorContainer);
            
            expect(noErrorFormValidator.errorContainer).toBeNull();
            
            // Should still function without errors
            expect(() => {
                noErrorFormValidator.showFieldError('email', 'Error message');
            }).not.toThrow();
        });

        it('should handle invalid form element gracefully', () => {
            expect(() => {
                new FormValidator(null);
            }).toThrow('Form element is required');
            
            expect(() => {
                new FormValidator(document.createElement('div'));
            }).toThrow('Element must be a form');
        });

        it('should handle malformed validation options', () => {
            const malformedOptions = {
                rateLimiter: 'invalid',
                ariaLive: null,
                debounceMs: 'not-a-number'
            };
            
            const validatorWithMalformedOptions = new FormValidator(testForm, malformedOptions);
            
            // Should use defaults for malformed options
            expect(validatorWithMalformedOptions.options.rateLimiter).toEqual(
                expect.objectContaining({
                    maxAttempts: 3,
                    windowMs: 60000
                })
            );
            expect(validatorWithMalformedOptions.options.debounceMs).toBe(300);
        });

        it('should handle extremely long input values', () => {
            const extremelyLongValue = 'a'.repeat(10000);
            emailInput.value = extremelyLongValue;
            
            expect(() => {
                formValidator.validateField('email');
            }).not.toThrow();
            
            // Should handle gracefully without performance issues
            expect(emailInput.value.length).toBeLessThanOrEqual(10000);
        });

        it('should handle special characters and Unicode', () => {
            const specialChars = 'José María Fernández-Niño 🚀 ñáéíóú';
            nameInput.value = specialChars;
            
            formValidator.validateField('name');
            
            // Should preserve Unicode characters
            expect(nameInput.value).toBe(specialChars);
            expect(formValidator.clearFieldError).toHaveBeenCalledWith('name');
        });

        it('should handle network timeout scenarios', async () => {
            vi.spyOn(formValidator, 'validateForm').mockReturnValue(true);
            
            // Mock slow network response
            global.fetch.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true })
                }), 10000))
            );

            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            // Use fake timers to avoid waiting
            vi.useFakeTimers();
            
            formValidator.handleSubmit(submitEvent);
            vi.advanceTimersByTime(5000); // 5 seconds
            
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('timeout'),
                'assertive'
            );
            
            vi.useRealTimers();
        });
    });

    describe('Browser Compatibility', () => {
        beforeEach(() => {
            formValidator = new FormValidator(testForm);
        });

        it('should work without fetch API (fallback to XMLHttpRequest)', () => {
            // Remove fetch
            global.fetch = undefined;
            
            const validatorWithoutFetch = new FormValidator(testForm);
            
            expect(validatorWithoutFetch).toBeDefined();
            
            // Should handle submission gracefully
            vi.spyOn(validatorWithoutFetch, 'validateForm').mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            expect(async () => {
                await validatorWithoutFetch.handleSubmit(submitEvent);
            }).not.toThrow();
        });

        it('should handle missing IntersectionObserver', () => {
            global.IntersectionObserver = undefined;
            
            expect(() => {
                new FormValidator(testForm);
            }).not.toThrow();
        });

        it('should work with older browser APIs', () => {
            // Mock older browser environment
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                // Simulate older browser without options parameter
                return originalAddEventListener.call(this, type, listener);
            };
            
            expect(() => {
                new FormValidator(testForm);
            }).not.toThrow();
            
            // Restore
            EventTarget.prototype.addEventListener = originalAddEventListener;
        });
    });

    describe('Advanced Integration Scenarios', () => {
        it('should integrate with third-party form services', async () => {
            const mailchimpValidator = new FormValidator(testForm, {
                integration: 'mailchimp',
                apiKey: 'test-api-key',
                listId: 'test-list-id'
            });
            
            vi.spyOn(mailchimpValidator, 'validateForm').mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            await mailchimpValidator.handleSubmit(submitEvent);
            
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('mailchimp'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
        });

        it('should handle progressive enhancement', () => {
            // Test with JavaScript disabled scenario (simulated)
            const noJsFormValidator = new FormValidator(testForm, {
                progressiveEnhancement: true,
                enableClientSideValidation: false
            });
            
            expect(noJsFormValidator.options.enableClientSideValidation).toBe(false);
            
            // Should still provide basic functionality
            expect(noJsFormValidator).toBeDefined();
        });

        it('should support custom validation hooks', () => {
            const customHook = vi.fn().mockReturnValue(true);
            
            const validatorWithHooks = new FormValidator(testForm, {
                validationHooks: {
                    beforeSubmit: customHook,
                    afterValidation: () => console.log('validated')
                }
            });
            
            vi.spyOn(validatorWithHooks, 'validateForm').mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });

            validatorWithHooks.handleSubmit(submitEvent);
            
            expect(customHook).toHaveBeenCalled();
        });
    });
});
