/**
 * Test Setup File
 * Properties 4 Creations
 * 
 * Global test configuration and utilities
 */

// Mock DOM environment for testing
import { JSDOM } from 'jsdom';

// Create a DOM environment for testing
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Test Environment</title>
    </head>
    <body>
      <div id="app"></div>
      <form id="test-form">
        <input type="text" id="test-input" name="test" required>
        <input type="email" id="email-input" name="email">
        <button type="submit">Submit</button>
      </form>
      <div class="form-group">
        <input type="text" class="form-control">
        <span class="form-error" role="alert"></span>
      </div>
    </body>
  </html>
`, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.n.navigator;
globalavigator = dom.window.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = dom.window.document.body.innerHTML;
  
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Utility functions for tests
global.createMockElement = (tag = 'div', attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

global.createMockForm = (fields = []) => {
  const form = document.createElement('form');
  form.id = 'mock-form';
  
  fields.forEach(field => {
    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.name = field.name;
    input.required = field.required || false;
    if (field.value) input.value = field.value;
    form.appendChild(input);
  });
  
  return form;
};

global.waitFor = (condition, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
};

// Mock intersection observer for lazy loading tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock resize observer for component tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

console.log('Test environment initialized');
