import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Component Integration Test</title>
</head>
<body>
    <header>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/properties">Properties</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main id="main">
        <section class="property-filter">
            <h2>Find Your Home</h2>
            <form id="property-search-form">
                <input type="text" id="search-location" placeholder="Location">
                <select id="property-type">
                    <option value="">All Types</option>
                    <option value="ranch">Ranch</option>
                    <option value="victorian">Victorian</option>
                    <option value="townhome">Townhome</option>
                </select>
                <button type="submit">Search Properties</button>
            </form>
            <div id="filter-results" aria-live="polite"></div>
        </section>
        
        <section class="property-listings">
            <div class="property-card" data-property-id="1">
                <h3>Tyler Ranch Home</h3>
                <p class="location">Tyler, TX</p>
                <button class="view-details-btn" data-property-id="1">View Details</button>
            </div>
            <div class="property-card" data-property-id="2">
                <h3>Longview Victorian</h3>
                <p class="location">Longview, TX</p>
                <button class="view-details-btn" data-property-id="2">View Details</button>
            </div>
        </section>
        
        <section class="contact-form-section">
            <h2>Get Started Today</h2>
            <form id="contact-form">
                <input type="email" id="contact-email" name="email" required>
                <input type="text" id="contact-name" name="name" required>
                <textarea id="contact-message" name="message" required></textarea>
                <button type="submit">Send Message</button>
                <div class="form-status" aria-live="polite"></div>
            </form>
        </section>
    </main>
    
    <div id="modal-overlay" class="modal-overlay" style="display: none;">
        <div class="modal-content" role="dialog" aria-labelledby="modal-title">
            <h2 id="modal-title">Property Details</h2>
            <div id="modal-body"></div>
            <button id="modal-close" aria-label="Close modal">×</button>
        </div>
    </div>
    
    <div id="aria-live-announcer" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px;"></div>
    <div id="aria-live-alerts" aria-live="assertive" aria-atomic="true" style="position: absolute; left: -10000px;"></div>
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

// Import modules after DOM setup
let PropertyFilter;
let Modal;
let FormValidator;
let AriaLiveRegions;
let RateLimiter;

describe('Component Integration Tests', () => {
    let propertyFilter;
    let modal;
    let formValidator;
    let searchForm;
    let contactForm;
    let propertyCards;
    let modalOverlay;
    let searchInput;
    let propertyTypeSelect;
    let contactEmail;
    let contactName;
    let contactMessage;
    let formStatus;

    beforeAll(async () => {
        // Import modules
        const PropertyFilterModule = await import('../../src/js/features/PropertyFilter.js');
        const ModalModule = await import('../../src/js/components/Modal.js');
        const FormValidatorModule = await import('../../src/js/features/FormValidator.js');
        const AriaLiveRegionsModule = await import('../../src/js/utils/ariaLiveRegions.js');
        const RateLimiterModule = await import('../../src/js/utils/rateLimiter.js');
        
        PropertyFilter = PropertyFilterModule.default;
        Modal = ModalModule.default;
        FormValidator = FormValidatorModule.default;
        AriaLiveRegions = AriaLiveRegionsModule.default;
        RateLimiter = RateLimiterModule.RateLimiter;
    });

    beforeEach(() => {
        // Reset DOM state
        document.body.innerHTML = `
            <header>
                <nav aria-label="Main navigation">
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/properties">Properties</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </nav>
            </header>
            
            <main id="main">
                <section class="property-filter">
                    <h2>Find Your Home</h2>
                    <form id="property-search-form">
                        <input type="text" id="search-location" placeholder="Location">
                        <select id="property-type">
                            <option value="">All Types</option>
                            <option value="ranch">Ranch</option>
                            <option value="victorian">Victorian</option>
                            <option value="townhome">Townhome</option>
                        </select>
                        <button type="submit">Search Properties</button>
                    </form>
                    <div id="filter-results" aria-live="polite"></div>
                </section>
                
                <section class="property-listings">
                    <div class="property-card" data-property-id="1">
                        <h3>Tyler Ranch Home</h3>
                        <p class="location">Tyler, TX</p>
                        <button class="view-details-btn" data-property-id="1">View Details</button>
                    </div>
                    <div class="property-card" data-property-id="2">
                        <h3>Longview Victorian</h3>
                        <p class="location">Longview, TX</p>
                        <button class="view-details-btn" data-property-id="2">View Details</button>
                    </div>
                </section>
                
                <section class="contact-form-section">
                    <h2>Get Started Today</h2>
                    <form id="contact-form">
                        <input type="email" id="contact-email" name="email" required>
                        <input type="text" id="contact-name" name="name" required>
                        <textarea id="contact-message" name="message" required></textarea>
                        <button type="submit">Send Message</button>
                        <div class="form-status" aria-live="polite"></div>
                    </form>
                </section>
            </main>
            
            <div id="modal-overlay" class="modal-overlay" style="display: none;">
                <div class="modal-content" role="dialog" aria-labelledby="modal-title">
                    <h2 id="modal-title">Property Details</h2>
                    <div id="modal-body"></div>
                    <button id="modal-close" aria-label="Close modal">×</button>
                </div>
            </div>
            
            <div id="aria-live-announcer" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px;"></div>
            <div id="aria-live-alerts" aria-live="assertive" aria-atomic="true" style="position: absolute; left: -10000px;"></div>
        `;

        // Get elements
        searchForm = document.getElementById('property-search-form');
        contactForm = document.getElementById('contact-form');
        propertyCards = document.querySelectorAll('.property-card');
        modalOverlay = document.getElementById('modal-overlay');
        searchInput = document.getElementById('search-location');
        propertyTypeSelect = document.getElementById('property-type');
        contactEmail = document.getElementById('contact-email');
        contactName = document.getElementById('contact-name');
        contactMessage = document.getElementById('contact-message');
        formStatus = document.querySelector('.form-status');

        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        if (propertyFilter) {
            propertyFilter.destroy();
        }
        if (modal) {
            modal.destroy();
        }
        if (formValidator) {
            formValidator.destroy();
        }
    });

    describe('PropertyFilter + Modal Integration', () => {
        beforeEach(() => {
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
        });

        it('should integrate property filter with modal for property details', () => {
            const showModalSpy = vi.spyOn(modal, 'show');
            const filterPropertiesSpy = vi.spyOn(propertyFilter, 'filterProperties');
            
            // Simulate property search
            searchInput.value = 'Tyler';
            propertyTypeSelect.value = 'ranch';
            
            propertyFilter.filterProperties();
            
            expect(filterPropertiesSpy).toHaveBeenCalled();
            
            // Click on property card to open modal
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            
            viewButton.click();
            
            expect(showModalSpy).toHaveBeenCalled();
        });

        it('should announce filter results with ARIA live regions', () => {
            const announceSpy = vi.spyOn(AriaLiveRegions, 'getInstance');
            
            searchInput.value = 'Longview';
            propertyFilter.filterProperties();
            
            expect(announceSpy).toHaveBeenCalled();
        });

        it('should handle modal opening with proper focus management', () => {
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            
            viewButton.click();
            
            expect(modalOverlay.style.display).not.toBe('none');
            
            // Check if modal content is loaded
            const modalBody = document.getElementById('modal-body');
            expect(modalBody).toBeDefined();
        });

        it('should handle modal closing with proper focus return', () => {
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            const closeButton = document.getElementById('modal-close');
            
            // Open modal
            viewButton.click();
            expect(modalOverlay.style.display).not.toBe('none');
            
            // Close modal
            closeButton.click();
            expect(modalOverlay.style.display).toBe('none');
        });

        it('should prevent multiple modal openings', () => {
            const firstCard = propertyCards[0];
            const secondCard = propertyCards[1];
            const viewButton1 = firstCard.querySelector('.view-details-btn');
            const viewButton2 = secondCard.querySelector('.view-details-btn');
            
            // Open first modal
            viewButton1.click();
            expect(modalOverlay.style.display).not.toBe('none');
            
            // Try to open second modal (should close first)
            viewButton2.click();
            expect(modalOverlay.style.display).not.toBe('none');
        });
    });

    describe('FormValidator + ARIA Live Regions Integration', () => {
        beforeEach(() => {
            formValidator = new FormValidator(contactForm);
        });

        it('should integrate form validation with ARIA announcements', () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            // Test invalid email
            contactEmail.value = 'invalid-email';
            contactEmail.dispatchEvent(new Event('blur'));
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('email'),
                'assertive'
            );
            
            // Test valid email
            vi.clearAllMocks();
            contactEmail.value = 'test@example.com';
            contactEmail.dispatchEvent(new Event('blur'));
            
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('email'),
                'polite'
            );
        });

        it('should handle form submission with rate limiting and ARIA feedback', async () => {
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            isAllowedSpy.mockReturnValue(true);
            
            // Fill valid form data
            contactEmail.value = 'test@example.com';
            contactName.value = 'John Doe';
            contactMessage.value = 'Test message';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            // Should check rate limiting
            expect(isAllowedSpy).toHaveBeenCalled();
            
            // Should announce submission status
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });

        it('should handle rate limit exceeded with ARIA announcements', async () => {
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            isAllowedSpy.mockReturnValue(false);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            expect(submitEvent.preventDefault).toHaveBeenCalled();
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('rate limit'),
                'assertive'
            );
        });
    });

    describe('Multi-Component Workflow Integration', () => {
        beforeEach(() => {
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
        });

        it('should handle complete user journey: search -> view -> contact', async () => {
            const announceSpy = vi.spyOn(formValidator.ariaLive, 'announce');
            
            // 1. Search for properties
            searchInput.value = 'Tyler';
            propertyTypeSelect.value = 'ranch';
            propertyFilter.filterProperties();
            
            // 2. View property details in modal
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            viewButton.click();
            
            expect(modalOverlay.style.display).not.toBe('none');
            
            // 3. Close modal and fill contact form
            const closeButton = document.getElementById('modal-close');
            closeButton.click();
            expect(modalOverlay.style.display).toBe('none');
            
            // 4. Fill contact form
            contactEmail.value = 'interested@example.com';
            contactName.value = 'Jane Smith';
            contactMessage.value = 'I am interested in the Tyler Ranch property';
            
            // 5. Submit form
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            const recordAttemptSpy = vi.spyOn(formValidator.rateLimiter, 'recordAttempt');
            isAllowedSpy.mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            // Should complete full workflow
            expect(isAllowedSpy).toHaveBeenCalled();
            expect(recordAttemptSpy).toHaveBeenCalled();
            expect(announceSpy).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });

        it('should handle error scenarios across multiple components', async () => {
            // Simulate network error in form submission
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            
            contactEmail.value = 'test@example.com';
            contactName.value = 'John Doe';
            contactMessage.value = 'Test message';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            // Should handle error gracefully
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('error'),
                'assertive'
            );
            
            // Should still allow user to retry search and view properties
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            expect(() => {
                viewButton.click();
            }).not.toThrow();
        });
    });

    describe('Error Boundary + Component Integration', () => {
        it('should handle component errors gracefully', () => {
            // Simulate a component error
            const originalFilterProperties = PropertyFilter.prototype.filterProperties;
            PropertyFilter.prototype.filterProperties = vi.fn().mockImplementation(() => {
                throw new Error('Simulated filter error');
            });
            
            propertyFilter = new PropertyFilter(searchForm);
            
            // Should not crash the application
            expect(() => {
                propertyFilter.filterProperties();
            }).toThrow('Simulated filter error');
            
            // Should allow other components to continue working
            modal = new Modal('#modal-overlay');
            expect(modal).toBeDefined();
            
            // Restore original method
            PropertyFilter.prototype.filterProperties = originalFilterProperties;
        });

        it('should handle modal errors without affecting form validation', () => {
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
            
            // Simulate modal error
            const originalShow = Modal.prototype.show;
            Modal.prototype.show = vi.fn().mockImplementation(() => {
                throw new Error('Modal error');
            });
            
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            
            expect(() => {
                viewButton.click();
            }).toThrow('Modal error');
            
            // Form validation should still work
            contactEmail.value = 'test@example.com';
            expect(() => {
                contactEmail.dispatchEvent(new Event('blur'));
            }).not.toThrow();
            
            // Restore original method
            Modal.prototype.show = originalShow;
        });
    });

    describe('Accessibility Integration Across Components', () => {
        beforeEach(() => {
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
        });

        it('should maintain proper ARIA states across component interactions', () => {
            // Check initial ARIA states
            const filterResults = document.getElementById('filter-results');
            expect(filterResults.getAttribute('aria-live')).toBe('polite');
            
            const modalContent = document.querySelector('.modal-content');
            expect(modalContent.getAttribute('role')).toBe('dialog');
            
            const contactFormElement = document.getElementById('contact-form');
            expect(contactFormElement.getAttribute('aria-live')).toBe('polite');
            
            // Interact with components and verify ARIA states persist
            searchInput.value = 'test';
            propertyFilter.filterProperties();
            
            expect(filterResults.getAttribute('aria-live')).toBe('polite');
            
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            viewButton.click();
            
            expect(modalContent.getAttribute('role')).toBe('dialog');
        });

        it('should announce state changes with appropriate priorities', () => {
            const politeAnnouncer = document.getElementById('aria-live-announcer');
            const assertiveAnnouncer = document.getElementById('aria-live-alerts');
            
            // Filter results should use polite announcements
            searchInput.value = 'Longview';
            propertyFilter.filterProperties();
            
            // Form validation errors should use assertive announcements
            contactEmail.value = 'invalid-email';
            contactEmail.dispatchEvent(new Event('blur'));
            
            // Success messages should use polite announcements
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            isAllowedSpy.mockReturnValue(true);
            
            contactEmail.value = 'test@example.com';
            contactName.value = 'John Doe';
            contactMessage.value = 'Test message';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            formValidator.handleSubmit(submitEvent);
            
            // Should announce to appropriate live regions
            expect(politeAnnouncer).toBeDefined();
            expect(assertiveAnnouncer).toBeDefined();
        });

        it('should handle keyboard navigation across components', () => {
            // Test tab navigation through components
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            
            // Simulate keyboard navigation
            viewButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            
            expect(modalOverlay.style.display).not.toBe('none');
            
            // Test escape key to close modal
            const closeButton = document.getElementById('modal-close');
            closeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            
            expect(modalOverlay.style.display).toBe('none');
        });
    });

    describe('Performance and Memory Management Integration', () => {
        it('should cleanup all components properly', () => {
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
            
            const removeEventListenerSpy = vi.spyOn(searchForm, 'removeEventListener');
            const removeEventListenerSpy2 = vi.spyOn(contactForm, 'removeEventListener');
            const cleanupSpy = vi.spyOn(propertyFilter.rateLimiter, 'cleanup');
            
            // Destroy all components
            propertyFilter.destroy();
            modal.destroy();
            formValidator.destroy();
            
            expect(removeEventListenerSpy).toHaveBeenCalled();
            expect(removeEventListenerSpy2).toHaveBeenCalled();
            expect(cleanupSpy).toHaveBeenCalled();
        });

        it('should handle rapid component interactions without memory leaks', () => {
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
            
            // Simulate rapid interactions
            for (let i = 0; i < 50; i++) {
                searchInput.value = `search${i}`;
                propertyFilter.filterProperties();
                
                const card = propertyCards[i % propertyCards.length];
                const button = card.querySelector('.view-details-btn');
                button.click();
                
                if (i % 10 === 0) {
                    const closeButton = document.getElementById('modal-close');
                    closeButton.click();
                }
                
                contactEmail.value = `test${i}@example.com`;
                contactEmail.dispatchEvent(new Event('input'));
            }
            
            // Components should still function
            expect(propertyFilter).toBeDefined();
            expect(modal).toBeDefined();
            expect(formValidator).toBeDefined();
        });
    });

    describe('External Service Integration', () => {
        it('should integrate property search with external API', async () => {
            propertyFilter = new PropertyFilter(searchForm, {
                apiEndpoint: '/api/properties/search'
            });
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    properties: [
                        { id: 1, name: 'Tyler Ranch', location: 'Tyler, TX' },
                        { id: 2, name: 'Longview Victorian', location: 'Longview, TX' }
                    ]
                })
            });
            
            searchInput.value = 'Tyler';
            propertyFilter.filterProperties();
            
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/properties/search',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should integrate form submission with external service', async () => {
            formValidator = new FormValidator(contactForm, {
                endpoint: 'https://script.google.com/macros/s/AKfyc/exec'
            });
            
            contactEmail.value = 'test@example.com';
            contactName.value = 'John Doe';
            contactMessage.value = 'Test message';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            expect(global.fetch).toHaveBeenCalledWith(
                'https://script.google.com/macros/s/AKfyc/exec',
                expect.objectContaining({
                    method: 'POST'
                })
            );
        });
    });

    describe('Cross-Browser Compatibility Integration', () => {
        it('should work with polyfilled browser APIs', () => {
            // Mock older browser environment
            const originalFetch = global.fetch;
            global.fetch = undefined;
            
            // Should still work with XMLHttpRequest fallback
            propertyFilter = new PropertyFilter(searchForm);
            modal = new Modal('#modal-overlay');
            formValidator = new FormValidator(contactForm);
            
            expect(propertyFilter).toBeDefined();
            expect(modal).toBeDefined();
            expect(formValidator).toBeDefined();
            
            // Restore fetch
            global.fetch = originalFetch;
        });

        it('should handle missing IntersectionObserver gracefully', () => {
            const originalIntersectionObserver = global.IntersectionObserver;
            global.IntersectionObserver = undefined;
            
            expect(() => {
                propertyFilter = new PropertyFilter(searchForm);
                modal = new Modal('#modal-overlay');
                formValidator = new FormValidator(contactForm);
            }).not.toThrow();
            
            // Restore
            global.IntersectionObserver = originalIntersectionObserver;
        });
    });

    describe('Real-World Usage Scenarios', () => {
        it('should handle complete property browsing and inquiry workflow', async () => {
            // Setup realistic property data
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    properties: [
                        {
                            id: 1,
                            name: 'Tyler Ranch Home',
                            location: 'Tyler, TX',
                            type: 'ranch',
                            price: '$250,000',
                            bedrooms: 3,
                            bathrooms: 2
                        }
                    ]
                })
            });
            
            // User browses properties
            searchInput.value = 'Tyler';
            propertyTypeSelect.value = 'ranch';
            propertyFilter.filterProperties();
            
            // User views property details
            const firstCard = propertyCards[0];
            const viewButton = firstCard.querySelector('.view-details-btn');
            viewButton.click();
            
            expect(modalOverlay.style.display).not.toBe('none');
            
            // User inquiries about property
            const closeButton = document.getElementById('modal-close');
            closeButton.click();
            
            contactEmail.value = 'buyer@example.com';
            contactName.value = 'Potential Buyer';
            contactMessage.value = 'I am interested in the Tyler Ranch property. Please contact me with more details.';
            
            const isAllowedSpy = vi.spyOn(formValidator.rateLimiter, 'isAllowed');
            isAllowedSpy.mockReturnValue(true);
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            // Should complete workflow successfully
            expect(isAllowedSpy).toHaveBeenCalled();
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });

        it('should handle error recovery in real-world scenarios', async () => {
            // Simulate network failure
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            
            // User tries to search
            searchInput.value = 'Longview';
            propertyFilter.filterProperties();
            
            // Should handle gracefully and allow retry
            expect(() => {
                searchInput.value = 'Tyler';
                propertyFilter.filterProperties();
            }).not.toThrow();
            
            // Simulate form submission failure
            global.fetch.mockRejectedValueOnce(new Error('Server error'));
            
            contactEmail.value = 'test@example.com';
            contactName.value = 'John Doe';
            contactMessage.value = 'Test message';
            
            const submitEvent = new Event('submit', { bubbles: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                writable: true,
                value: vi.fn()
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            // Should allow retry
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });
            
            await formValidator.handleSubmit(submitEvent);
            
            expect(formValidator.ariaLive.announce).toHaveBeenCalledWith(
                expect.stringContaining('success'),
                'polite'
            );
        });
    });
});
