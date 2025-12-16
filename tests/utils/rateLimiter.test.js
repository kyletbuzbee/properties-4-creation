/**
 * RateLimiter Unit Tests
 * Properties 4 Creations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter, createFormRateLimiter, createContactFormRateLimiter, createApplicationRateLimiter } from '../../src/js/utils/rateLimiter.js';

describe('RateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
    
    // Create fresh instance for each test
    rateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
  });

  afterEach(() => {
    rateLimiter.destroy();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const limiter = new RateLimiter();
      expect(limiter.maxAttempts).toBe(5);
      expect(limiter.windowMs).toBe(60000);
      expect(limiter.attempts).toBeInstanceOf(Map);
      expect(limiter.cleanupInterval).not.toBeNull();
      limiter.destroy();
    });

    it('should initialize with custom values', () => {
      const limiter = new RateLimiter(2, 300000);
      expect(limiter.maxAttempts).toBe(2);
      expect(limiter.windowMs).toBe(300000);
      limiter.destroy();
    });
  });

  describe('isAllowed', () => {
    it('should allow requests under the limit', () => {
      const result = rateLimiter.isAllowed('test-user');
      expect(result.allowed).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.remainingAttempts).toBe(2);
    });

    it('should allow multiple requests under the limit', () => {
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      
      const result = rateLimiter.isAllowed('test-user');
      expect(result.allowed).toBe(true);
      expect(result.attempts).toBe(3);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should deny requests over the limit', () => {
      // Fill up to the limit
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      
      // This should be denied
      const result = rateLimiter.isAllowed('test-user');
      expect(result.allowed).toBe(false);
      expect(result.attempts).toBe(3);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should handle different users independently', () => {
      const result1 = rateLimiter.isAllowed('user-1');
      const result2 = rateLimiter.isAllowed('user-2');
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result1.attempts).toBe(1);
      expect(result2.attempts).toBe(1);
    });

    it('should clean up expired attempts', () => {
      // Manually add expired attempts
      const now = Date.now();
      const expiredTime = now - (60000 + 1000); // 61 seconds ago
      
      rateLimiter.attempts.set('test-user', [expiredTime, now - 1000]);
      
      const result = rateLimiter.isAllowed('test-user');
      expect(result.attempts).toBe(1); // Only recent attempt should count
    });
  });

  describe('getUserIdentifier', () => {
    it('should return a user identifier', () => {
      const identifier = rateLimiter.getUserIdentifier();
      expect(typeof identifier).toBe('string');
      expect(identifier.length).toBeGreaterThan(0);
    });

    it('should return consistent identifiers for same session', () => {
      const identifier1 = rateLimiter.getUserIdentifier();
      const identifier2 = rateLimiter.getUserIdentifier();
      expect(identifier1).toBe(identifier2);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return correct remaining attempts', () => {
      expect(rateLimiter.getRemainingAttempts('test-user')).toBe(3);
      
      rateLimiter.isAllowed('test-user');
      expect(rateLimiter.getRemainingAttempts('test-user')).toBe(2);
      
      rateLimiter.isAllowed('test-user');
      expect(rateLimiter.getRemainingAttempts('test-user')).toBe(1);
    });

    it('should return 0 when limit is reached', () => {
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      
      expect(rateLimiter.getRemainingAttempts('test-user')).toBe(0);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when not rate limited', () => {
      const timeUntilReset = rateLimiter.getTimeUntilReset('test-user');
      expect(timeUntilReset).toBe(0);
    });

    it('should return positive time when rate limited', () => {
      // Fill up to the limit
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed('test-user');
      }
      
      const timeUntilReset = rateLimiter.getTimeUntilReset('test-user');
      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(60);
    });
  });

  describe('resetUserAttempts', () => {
    it('should reset attempts for a user', () => {
      rateLimiter.isAllowed('test-user');
      rateLimiter.isAllowed('test-user');
      
      expect(rateLimiter.getAttemptCount('test-user')).toBe(2);
      
      rateLimiter.resetUserAttempts('test-user');
      
      expect(rateLimiter.getAttemptCount('test-user')).toBe(0);
      expect(rateLimiter.getRemainingAttempts('test-user')).toBe(3);
    });
  });

  describe('getAttemptCount', () => {
    it('should return correct attempt count', () => {
      expect(rateLimiter.getAttemptCount('test-user')).toBe(0);
      
      rateLimiter.isAllowed('test-user');
      expect(rateLimiter.getAttemptCount('test-user')).toBe(1);
      
      rateLimiter.isAllowed('test-user');
      expect(rateLimiter.getAttemptCount('test-user')).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', () => {
      const now = Date.now();
      const expiredTime = now - (60000 + 1000); // 61 seconds ago
      const recentTime = now - 1000; // 1 second ago
      
      rateLimiter.attempts.set('expired-user', [expiredTime]);
      rateLimiter.attempts.set('recent-user', [recentTime]);
      
      rateLimiter.cleanup();
      
      expect(rateLimiter.attempts.has('expired-user')).toBe(false);
      expect(rateLimiter.attempts.has('recent-user')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      rateLimiter.isAllowed('user-1');
      rateLimiter.isAllowed('user-1');
      rateLimiter.isAllowed('user-2');
      
      const stats = rateLimiter.getStats();
      
      expect(stats.totalActiveUsers).toBe(2);
      expect(stats.totalAttempts).toBe(3);
      expect(stats.maxAttempts).toBe(3);
      expect(stats.windowMs).toBe(60000);
      expect(stats.mapSize).toBe(2);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      expect(rateLimiter.cleanupInterval).not.toBeNull();
      
      rateLimiter.destroy();
      
      expect(rateLimiter.cleanupInterval).toBeNull();
      expect(rateLimiter.attempts.size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null or empty user key gracefully', () => {
      expect(() => rateLimiter.isAllowed(null)).not.toThrow();
      expect(() => rateLimiter.isAllowed('')).not.toThrow();
    });

    it('should handle very long user keys', () => {
      const longKey = 'a'.repeat(1000);
      expect(() => rateLimiter.isAllowed(longKey)).not.toThrow();
    });

    it('should handle rapid successive calls', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.isAllowed('rapid-user'));
      }
      
      expect(results[0].allowed).toBe(true);
      expect(results[2].allowed).toBe(true);
      expect(results[3].allowed).toBe(false);
    });
  });
});

describe('Factory Functions', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('createFormRateLimiter', () => {
    it('should create a rate limiter with form defaults', () => {
      const limiter = createFormRateLimiter();
      expect(limiter.maxAttempts).toBe(3);
      expect(limiter.windowMs).toBe(60000);
      limiter.destroy();
    });
  });

  describe('createContactFormRateLimiter', () => {
    it('should create a more restrictive rate limiter', () => {
      const limiter = createContactFormRateLimiter();
      expect(limiter.maxAttempts).toBe(2);
      expect(limiter.windowMs).toBe(300000); // 5 minutes
      limiter.destroy();
    });
  });

  describe('createApplicationRateLimiter', () => {
    it('should create a moderate rate limiter', () => {
      const limiter = createApplicationRateLimiter();
      expect(limiter.maxAttempts).toBe(5);
      expect(limiter.windowMs).toBe(600000); // 10 minutes
      limiter.destroy();
    });
  });
});

describe('RateLimiter Integration', () => {
  it('should work with FormValidator integration scenario', () => {
    const formLimiter = createFormRateLimiter();
    const userKey = 'test-user@example.com';
    
    // Simulate form submissions
    const submission1 = formLimiter.isAllowed(userKey);
    const submission2 = formLimiter.isAllowed(userKey);
    const submission3 = formLimiter.isAllowed(userKey);
    const submission4 = formLimiter.isAllowed(userKey); // This should fail
    
    expect(submission1.allowed).toBe(true);
    expect(submission2.allowed).toBe(true);
    expect(submission3.allowed).toBe(true);
    expect(submission4.allowed).toBe(false);
    expect(submission4.retryAfter).toBeGreaterThan(0);
    
    // Test remaining attempts
    expect(formLimiter.getRemainingAttempts(userKey)).toBe(0);
    
    formLimiter.destroy();
  });
});
