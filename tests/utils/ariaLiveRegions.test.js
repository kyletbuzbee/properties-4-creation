/**
 * ARIA Live Regions Unit Tests
 * Properties 4 Creations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AriaLiveRegions, createAriaLiveRegions, getGlobalAriaLiveRegions, announce } from '../../src/js/utils/ariaLiveRegions.js';

describe('AriaLiveRegions', () => {
  let ariaLiveRegions;

  beforeEach(() => {
    // Clear any previous instances
    delete window._ariaLiveRegions;
    delete window.announce;
    
    // Create fresh instance for each test
    ariaLiveRegions = new AriaLiveRegions({
      maxQueueSize: 5,
      announcementDelay: 50
    });
  });

  afterEach(() => {
    ariaLiveRegions.destroy();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const regions = new AriaLiveRegions();
      expect(regions.options.containerId).toBe('aria-live-container');
      expect(regions.options.politeRegionId).toBe('aria-live-polite');
      expect(regions.options.assertiveRegionId).toBe('aria-live-assertive');
      expect(regions.options.maxQueueSize).toBe(10);
      expect(regions.options.announcementDelay).toBe(100);
      expect(regions.announcementQueue).toEqual([]);
      expect(regions.isProcessing).toBe(false);
      regions.destroy();
    });

    it('should initialize with custom options', () => {
      const regions = new AriaLiveRegions({
        maxQueueSize: 3,
        announcementDelay: 25
      });
      expect(regions.options.maxQueueSize).toBe(3);
      expect(regions.options.announcementDelay).toBe(25);
      regions.destroy();
    });
  });

  describe('init', () => {
    it('should create region container', () => {
      expect(ariaLiveRegions.regionContainer).toBeDefined();
      expect(ariaLiveRegions.regionContainer.id).toBe('aria-live-container');
    });

    it('should create live regions', () => {
      expect(ariaLiveRegions.politeRegion).toBeDefined();
      expect(ariaLiveRegions.assertiveRegion).toBeDefined();
      expect(ariaLiveRegions.politeRegion.getAttribute('aria-live')).toBe('polite');
      expect(ariaLiveRegions.assertiveRegion.getAttribute('aria-live')).toBe('assertive');
    });

    it('should append regions to container', () => {
      expect(ariaLiveRegions.regionContainer.children.length).toBe(2);
    });
  });

  describe('announce', () => {
    it('should add announcement to queue', () => {
      ariaLiveRegions.announce('Test message');
      
      expect(ariaLiveRegions.announcementQueue).toHaveLength(1);
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Test message');
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('polite');
    });

    it('should use assertive priority when specified', () => {
      ariaLiveRegions.announce('Error message', 'assertive');
      
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('assertive');
    });

    it('should sanitize message content', () => {
      ariaLiveRegions.announce('<script>alert(\'xss\')</script>Clean message');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Clean message');
      expect(ariaLiveRegions.announcementQueue[0].message).not.toContain('<script>');
    });

    it('should limit queue size', () => {
      // Fill queue to capacity
      for (let i = 0; i < 6; i++) {
        ariaLiveRegions.announce(`Message ${i}`);
      }
      
      // Should only keep the last 5 messages
      expect(ariaLiveRegions.announcementQueue).toHaveLength(5);
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Message 1');
    });

    it('should start processing when queue is not empty', () => {
      const processQueueSpy = vi.spyOn(ariaLiveRegions, 'processQueue');
      
      ariaLiveRegions.announce('Test message');
      
      expect(processQueueSpy).toHaveBeenCalled();
      
      processQueueSpy.mockRestore();
    });
  });

  describe('processQueue', () => {
    it('should not process empty queue', async () => {
      ariaLiveRegions.announcementQueue = [];
      ariaLiveRegions.isProcessing = false;
      
      await ariaLiveRegions.processQueue();
      
      expect(ariaLiveRegions.isProcessing).toBe(false);
    });

    it('should not process when already processing', async () => {
      ariaLiveRegions.announcementQueue = [{ message: 'Test', priority: 'polite' }];
      ariaLiveRegions.isProcessing = true;
      
      await ariaLiveRegions.processQueue();
      
      expect(ariaLiveRegions.isProcessing).toBe(true);
    });

    it('should process announcements in queue', async () => {
      ariaLiveRegions.announcementQueue = [
        { message: 'Message 1', priority: 'polite', timestamp: Date.now() },
        { message: 'Message 2', priority: 'assertive', timestamp: Date.now() }
      ];
      
      await ariaLiveRegions.processQueue();
      
      expect(ariaLiveRegions.announcementQueue).toHaveLength(0);
      expect(ariaLiveRegions.isProcessing).toBe(false);
    });

    it('should add delays between announcements', async () => {
      const delaySpy = vi.spyOn(ariaLiveRegions, 'delay').mockResolvedValue();
      
      ariaLiveRegions.announcementQueue = [
        { message: 'Message 1', priority: 'polite', timestamp: Date.now() },
        { message: 'Message 2', priority: 'polite', timestamp: Date.now() }
      ];
      
      await ariaLiveRegions.processQueue();
      
      expect(delaySpy).toHaveBeenCalledWith(200);
      
      delaySpy.mockRestore();
    });
  });

  describe('deliverAnnouncement', () => {
    it('should deliver to polite region for polite priority', async () => {
      const announcement = { message: 'Test message', priority: 'polite' };
      
      await ariaLiveRegions.deliverAnnouncement(announcement);
      
      expect(ariaLiveRegions.politeRegion.textContent).toBe('Test message');
      expect(ariaLiveRegions.assertiveRegion.textContent).toBe('');
    });

    it('should deliver to assertive region for assertive priority', async () => {
      const announcement = { message: 'Error message', priority: 'assertive' };
      
      await ariaLiveRegions.deliverAnnouncement(announcement);
      
      expect(ariaLiveRegions.assertiveRegion.textContent).toBe('Error message');
      expect(ariaLiveRegions.politeRegion.textContent).toBe('');
    });

    it('should clear region before setting content', async () => {
      ariaLiveRegions.politeRegion.textContent = 'Previous message';
      
      const announcement = { message: 'New message', priority: 'polite' };
      await ariaLiveRegions.deliverAnnouncement(announcement);
      
      expect(ariaLiveRegions.politeRegion.textContent).toBe('New message');
    });
  });

  describe('announceValidationError', () => {
    it('should announce validation error with assertive priority', () => {
      ariaLiveRegions.announceValidationError('Email', 'Please enter a valid email');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Error in Email: Please enter a valid email');
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('assertive');
    });
  });

  describe('announceValidationSuccess', () => {
    it('should announce validation success with polite priority', () => {
      ariaLiveRegions.announceValidationSuccess('Email');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Email is now valid');
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('polite');
    });
  });

  describe('announceFormStatus', () => {
    it('should use assertive priority for error status', () => {
      ariaLiveRegions.announceFormStatus('error', 'Form submission failed');
      
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('assertive');
    });

    it('should use polite priority for success and loading status', () => {
      ariaLiveRegions.announceFormStatus('success', 'Form submitted successfully');
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('polite');
      
      ariaLiveRegions.announcementQueue = [];
      ariaLiveRegions.announceFormStatus('loading', 'Submitting form...');
      expect(ariaLiveRegions.announcementQueue[0].priority).toBe('polite');
    });
  });

  describe('announceFilterResults', () => {
    it('should announce no results found', () => {
      ariaLiveRegions.announceFilterResults(0, 'bedrooms');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('No results found for bedrooms');
    });

    it('should announce single result', () => {
      ariaLiveRegions.announceFilterResults(1, 'location');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('1 result found for location');
    });

    it('should announce multiple results', () => {
      ariaLiveRegions.announceFilterResults(5, 'price range');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('5 results found for price range');
    });
  });

  describe('announcePageNavigation', () => {
    it('should announce page navigation', () => {
      ariaLiveRegions.announcePageNavigation('Properties');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Navigated to Properties page');
    });
  });

  describe('announceModalState', () => {
    it('should announce modal opened', () => {
      ariaLiveRegions.announceModalState('opened', 'Contact Form');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Contact Form modal opened');
    });

    it('should announce modal closed', () => {
      ariaLiveRegions.announceModalState('closed', 'Property Details');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Property Details modal closed');
    });
  });

  describe('announceContentUpdate', () => {
    it('should announce content updates', () => {
      ariaLiveRegions.announceContentUpdate('Property List', '3 properties added');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Property List updated: 3 properties added');
    });
  });

  describe('clearQueue', () => {
    it('should clear announcement queue', () => {
      ariaLiveRegions.announcementQueue = [{ message: 'Test' }];
      ariaLiveRegions.isProcessing = true;
      
      ariaLiveRegions.clearQueue();
      
      expect(ariaLiveRegions.announcementQueue).toEqual([]);
      expect(ariaLiveRegions.isProcessing).toBe(false);
    });
  });

  describe('clearRegion', () => {
    it('should clear polite region', () => {
      ariaLiveRegions.politeRegion.textContent = 'Test message';
      ariaLiveRegions.clearRegion('polite');
      
      expect(ariaLiveRegions.politeRegion.textContent).toBe('');
    });

    it('should clear assertive region', () => {
      ariaLiveRegions.assertiveRegion.textContent = 'Error message';
      ariaLiveRegions.clearRegion('assertive');
      
      expect(ariaLiveRegions.assertiveRegion.textContent).toBe('');
    });
  });

  describe('clearAllRegions', () => {
    it('should clear both regions', () => {
      ariaLiveRegions.politeRegion.textContent = 'Polite message';
      ariaLiveRegions.assertiveRegion.textContent = 'Assertive message';
      
      ariaLiveRegions.clearAllRegions();
      
      expect(ariaLiveRegions.politeRegion.textContent).toBe('');
      expect(ariaLiveRegions.assertiveRegion.textContent).toBe('');
    });
  });

  describe('sanitizeMessage', () => {
    it('should remove script tags', () => {
      const result = ariaLiveRegions.sanitizeMessage('<script>alert('xss')</script>Clean text');
      expect(result).toBe('Clean text');
    });

    it('should remove HTML tags', () => {
      const result = ariaLiveRegions.sanitizeMessage('<div>Text content</div>');
      expect(result).toBe('Text content');
    });

    it('should handle non-string input', () => {
      expect(ariaLiveRegions.sanitizeMessage(null)).toBe('');
      expect(ariaLiveRegions.sanitizeMessage(undefined)).toBe('');
      expect(ariaLiveRegions.sanitizeMessage(123)).toBe('');
    });

    it('should trim whitespace', () => {
      const result = ariaLiveRegions.sanitizeMessage('  Trimmed text  ');
      expect(result).toBe('Trimmed text');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = ariaLiveRegions.generateId();
      const id2 = ariaLiveRegions.generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^announcement_\d+_[a-z0-9]+$/);
    });
  });

  describe('delay', () => {
    it('should resolve after specified delay', async () => {
      const start = Date.now();
      await ariaLiveRegions.delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90);
    });
  });

  describe('getQueueStatus', () => {
    it('should return queue status information', () => {
      ariaLiveRegions.announcementQueue = [{ message: 'Test' }];
      
      const status = ariaLiveRegions.getQueueStatus();
      
      expect(status.queueLength).toBe(1);
      expect(status.isProcessing).toBe(false);
      expect(status.maxQueueSize).toBe(10);
      expect(status.regionsReady.polite).toBe(true);
      expect(status.regionsReady.assertive).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clear queue and remove container', () => {
      ariaLiveRegions.announcementQueue = [{ message: 'Test' }];
      ariaLiveRegions.isProcessing = true;
      
      ariaLiveRegions.destroy();
      
      expect(ariaLiveRegions.announcementQueue).toEqual([]);
      expect(ariaLiveRegions.isProcessing).toBe(false);
      expect(ariaLiveRegions.regionContainer).toBeNull();
      expect(ariaLiveRegions.politeRegion).toBeNull();
      expect(ariaLiveRegions.assertiveRegion).toBeNull();
    });

    it('should remove container from DOM', () => {
      const container = document.getElementById('aria-live-container');
      
      ariaLiveRegions.destroy();
      
      expect(container).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message gracefully', () => {
      ariaLiveRegions.announce('');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      ariaLiveRegions.announce(longMessage);
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe(longMessage);
    });

    it('should handle special characters', () => {
      ariaLiveRegions.announce('Message with émojis 🚨 and spëcial chars');
      
      expect(ariaLiveRegions.announcementQueue[0].message).toBe('Message with émojis 🚨 and spëcial chars');
    });

    it('should handle rapid successive announcements', async () => {
      const announcements = ['Message 1', 'Message 2', 'Message 3'];
      
      announcements.forEach(msg => {
        ariaLiveRegions.announce(msg);
      });
      
      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(ariaLiveRegions.announcementQueue).toHaveLength(0);
    });
  });
});

describe('Factory Functions', () => {
  afterEach(() => {
    delete window._ariaLiveRegions;
    delete window.announce;
  });

  describe('createAriaLiveRegions', () => {
    it('should create new instance with options', () => {
      const regions = createAriaLiveRegions({ maxQueueSize: 3 });
      
      expect(regions).toBeInstanceOf(AriaLiveRegions);
      expect(regions.options.maxQueueSize).toBe(3);
      
      regions.destroy();
    });
  });

  describe('getGlobalAriaLiveRegions', () => {
    it('should create instance on first call', () => {
      const regions = getGlobalAriaLiveRegions();
      
      expect(regions).toBeInstanceOf(AriaLiveRegions);
      expect(window._ariaLiveRegions).toBe(regions);
      
      regions.destroy();
    });

    it('should return existing instance on subsequent calls', () => {
      const regions1 = getGlobalAriaLiveRegions();
      const regions2 = getGlobalAriaLiveRegions();
      
      expect(regions1).toBe(regions2);
      expect(window._ariaLiveRegions).toBe(regions1);
      
      regions1.destroy();
    });

    it('should pass options to new instance', () => {
      const regions = getGlobalAriaLiveRegions({ maxQueueSize: 5 });
      
      expect(regions.options.maxQueueSize).toBe(5);
      
      regions.destroy();
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    getGlobalAriaLiveRegions();
  });

  afterEach(() => {
    delete window._ariaLiveRegions;
    delete window.announce;
  });

  describe('announce.validationError', () => {
    it('should announce validation error', () => {
      announce.validationError('Email', 'Invalid email format');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].message).toBe('Error in Email: Invalid email format');
      expect(regions.announcementQueue[0].priority).toBe('assertive');
    });
  });

  describe('announce.validationSuccess', () => {
    it('should announce validation success', () => {
      announce.validationSuccess('Phone');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].message).toBe('Phone is now valid');
      expect(regions.announcementQueue[0].priority).toBe('polite');
    });
  });

  describe('announce.formStatus', () => {
    it('should announce form status with appropriate priority', () => {
      announce.formStatus('success', 'Form submitted');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].message).toBe('Form submitted');
      expect(regions.announcementQueue[0].priority).toBe('polite');
    });
  });

  describe('announce.filterResults', () => {
    it('should announce filter results', () => {
      announce.filterResults(3, 'bedrooms');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].message).toBe('3 results found for bedrooms');
    });
  });

  describe('announce.general', () => {
    it('should make general announcement', () => {
      announce.general('Page loaded', 'polite');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].message).toBe('Page loaded');
      expect(regions.announcementQueue[0].priority).toBe('polite');
    });

    it('should use default priority when not specified', () => {
      announce.general('Default priority message');
      
      const regions = window._ariaLiveRegions;
      expect(regions.announcementQueue[0].priority).toBe('polite');
    });
  });
});

describe('ARIA Live Regions Integration', () => {
  it('should work with form validation scenario', async () => {
    const regions = getGlobalAriaLiveRegions();
    
    // Simulate form validation errors
    announce.validationError('Email', 'Please enter a valid email');
    announce.validationError('Phone', 'Phone number is required');
    
    // Simulate validation success
    announce.validationSuccess('Email');
    
    // Wait for announcements to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(regions.announcementQueue).toHaveLength(0);
    
    regions.destroy();
  });

  it('should work with property filter scenario', async () => {
    const regions = getGlobalAriaLiveRegions();
    
    // Simulate filter application
    announce.filterResults(0, '2 bedrooms in Tyler');
    
    // Simulate filter update with results
    announce.filterResults(3, '2 bedrooms in Tyler');
    
    // Wait for announcements to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(regions.announcementQueue).toHaveLength(0);
    
    regions.destroy();
  });
});
