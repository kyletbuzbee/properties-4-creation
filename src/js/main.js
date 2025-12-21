/**
 * Main Application Entry Point
 * Properties 4 Creations
 *
 * This file initializes all JavaScript components and features
 */

// Import components and utilities
import { PropertyFilter } from './features/PropertyFilter.js';
import { getModalInstance } from './components/Modal.js';
import { initAccordions } from './components/Accordion.js';
import { FormValidator } from './features/FormValidator.js';
import { initErrorHandler } from './utils/errorHandler.js';
import { createPropertiesErrorBoundary } from './utils/errorBoundary.js';
import { LazyLoader } from './utils/lazyLoad.js';

// Initialize error boundary first (before other components)
createPropertiesErrorBoundary();

// Initialize global error handler
initErrorHandler();

// MOBILE MENU TOGGLE
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
}

// PROPERTIES DATA
const propertiesData = [
  {
    name: 'Tyler Ranch Home',
    bedrooms: 3,
    bathrooms: 2,
    price: 'Section 8 Ready',
    tags: ['Section 8 Ready', 'Newly Renovated', 'HVAC New'],
    location: 'Tyler, TX',
    image: 'images/properties/properties-tyler-ranch-home.webp'
  },
  {
    name: 'Longview Victorian',
    bedrooms: 4,
    bathrooms: 2.5,
    price: 'HUD-VASH Ready',
    tags: ['HUD-VASH Approved', 'Historic Home', 'New Roof'],
    location: 'Longview, TX',
    image: 'images/properties/properties-longview-victorian.webp'
  },
  {
    name: 'Marshall Farmhouse',
    bedrooms: 3,
    bathrooms: 1.5,
    price: 'Section 8 Ready',
    tags: ['Section 8 Ready', 'Family Friendly', 'Yard Space'],
    location: 'Marshall, TX',
    image: 'images/properties/properties-marshall-farmhouse.webp'
  },
  {
    name: 'Kemp Townhome',
    bedrooms: 2,
    bathrooms: 1,
    price: 'Section 8/HUD-VASH',
    tags: ['Both Programs', 'Modern Build', 'Energy Efficient'],
    location: 'Kemp, TX',
    image: 'images/properties/properties-kemp-townhome.webp'
  },
  {
    name: 'Jefferson Riverfront',
    bedrooms: 3,
    bathrooms: 2,
    price: 'HUD-VASH Ready',
    tags: ['Veteran Focused', 'Scenic Location', 'Newly Renovated'],
    location: 'Jefferson, TX',
    image: 'images/properties/properties-jefferson-river-front.webp'
  },
  {
    name: 'Mineola Studio',
    bedrooms: 1,
    bathrooms: 1,
    price: 'Section 8 Ready',
    tags: ['Section 8 Ready', 'Affordable', 'Modern Amenities'],
    location: 'Mineola, TX',
    image: 'images/properties/properties-mineola-studio.webp'
  }
];

// POPULATE PROPERTIES GRID (SECURE - NO XSS VULNERABILITIES)
const propertiesGrid = document.getElementById('properties-grid');
if (propertiesGrid) {
  propertiesData.forEach((prop) => {
    const card = document.createElement('div');
    card.className = 'property-card';

    // Create image container
    const imageDiv = document.createElement('div');
    imageDiv.className = 'property-image';
    imageDiv.style.backgroundImage = `url('${prop.image}')`;
    imageDiv.style.backgroundSize = 'cover';
    imageDiv.style.backgroundPosition = 'center';
    imageDiv.setAttribute('alt', prop.name);

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'property-content';

    // Create title element (secure - uses textContent)
    const titleEl = document.createElement('h3');
    titleEl.className = 'property-title';
    titleEl.textContent = prop.name;

    // Create location element (secure)
    const locationEl = document.createElement('p');
    locationEl.style.color = 'var(--dark-gray)';
    locationEl.style.fontSize = '0.9rem';
    locationEl.style.marginBottom = '1rem';
    locationEl.textContent = prop.location;

    // Create details container
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'property-details';

    // Add beds detail
    const bedsItem = document.createElement('div');
    bedsItem.className = 'detail-item';
    const bedsLabel = document.createElement('div');
    bedsLabel.className = 'detail-label';
    bedsLabel.textContent = 'Beds';
    const bedsValue = document.createElement('div');
    bedsValue.className = 'detail-value';
    bedsValue.textContent = prop.bedrooms.toString();
    bedsItem.appendChild(bedsLabel);
    bedsItem.appendChild(bedsValue);

    // Add baths detail
    const bathsItem = document.createElement('div');
    bathsItem.className = 'detail-item';
    const bathsLabel = document.createElement('div');
    bathsLabel.className = 'detail-label';
    bathsLabel.textContent = 'Baths';
    const bathsValue = document.createElement('div');
    bathsValue.className = 'detail-value';
    bathsValue.textContent = prop.bathrooms.toString();
    bathsItem.appendChild(bathsLabel);
    bathsItem.appendChild(bathsValue);

    // Add status detail
    const statusItem = document.createElement('div');
    statusItem.className = 'detail-item';
    const statusLabel = document.createElement('div');
    statusLabel.className = 'detail-label';
    statusLabel.textContent = 'Status';
    const statusValue = document.createElement('div');
    statusValue.className = 'detail-value';
    statusValue.style.fontSize = '0.8rem';
    statusValue.style.color = 'var(--gold)';
    statusValue.textContent = prop.price;
    statusItem.appendChild(statusLabel);
    statusItem.appendChild(statusValue);

    // Add all details
    detailsDiv.appendChild(bedsItem);
    detailsDiv.appendChild(bathsItem);
    detailsDiv.appendChild(statusItem);

    // Create tags container
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'property-tags';

    // Add tags securely (escape text content)
    prop.tags.forEach((tag) => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = tag; // Secure - no HTML injection possible
      tagsDiv.appendChild(tagSpan);
    });

    // Create apply button
    const applyLink = document.createElement('a');
    applyLink.href = 'apply.html';
    applyLink.className = 'btn btn-primary property-btn';
    applyLink.textContent = 'Apply for This Home';

    // Assemble all elements
    contentDiv.appendChild(titleEl);
    contentDiv.appendChild(locationEl);
    contentDiv.appendChild(detailsDiv);
    contentDiv.appendChild(tagsDiv);
    contentDiv.appendChild(applyLink);

    card.appendChild(imageDiv);
    card.appendChild(contentDiv);

    propertiesGrid.appendChild(card);
  });
}

// COMPARISON SLIDER
const sliderContainer = document.querySelector('.slider-container');
if (sliderContainer) {
  const sliderHandle = sliderContainer.querySelector('.slider-handle');
  let isDragging = false;

  const moveSlider = (e) => {
    if (!isDragging) return;
    const rect = sliderContainer.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percentage = (x / rect.width) * 100;
    sliderHandle.style.left = `${percentage}%`;
    sliderContainer.querySelector('.slider-after').style.clipPath =
      `inset(0 0 0 ${percentage}%)`;
  };

  sliderHandle.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', moveSlider);
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch events for mobile
  sliderHandle.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    moveSlider(touch);
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// FILTER PROPERTIES
const filterBtn = document.getElementById('filter-btn');
if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    const bedroomFilter = document.getElementById('bedroom-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const searchFilter = document
      .getElementById('search-filter')
      .value.toLowerCase();

    const cards = document.querySelectorAll('.property-card');
    cards.forEach((card) => {
      const title = card
        .querySelector('.property-title')
        .textContent.toLowerCase();
      const location = card
        .querySelector('.property-content p')
        .textContent.toLowerCase();
      const bedrooms = card.querySelector('.detail-value').textContent;

      const matchesBedroom = !bedroomFilter || bedrooms === bedroomFilter;
      const matchesLocation =
        !locationFilter || location.includes(locationFilter.toLowerCase());
      const matchesSearch =
        !searchFilter ||
        title.includes(searchFilter) ||
        location.includes(searchFilter);

      if (matchesBedroom && matchesLocation && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Sanitize input function (moved to program root)
function sanitizeInput (input) {
  // Use DOMPurify if available, otherwise basic sanitization
  if (window.DOMPurify) {
    return window.DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  // Basic fallback sanitization
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// FORM VALIDATION WITH INPUT SANITIZATION
const form = document.getElementById('application-form');
if (form) {
  const successMessage = document.getElementById('success-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');

    formGroups.forEach((group) => {
      const input = group.querySelector('input, select, textarea');
      if (!input) return;

      group.classList.remove('error');

      // Sanitize input value
      const sanitizedValue = sanitizeInput(input.value);

      if (input.required && !sanitizedValue) {
        group.classList.add('error');
        isValid = false;
      } else if (
        input.type === 'email' &&
        sanitizedValue &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)
      ) {
        group.classList.add('error');
        isValid = false;
      } else if (
        input.id === 'phone' &&
        sanitizedValue &&
        !/^[0-9\-+() ]+$/.test(sanitizedValue)
      ) {
        group.classList.add('error');
        isValid = false;
      } else if (input.type === 'checkbox' && !input.checked) {
        group.classList.add('error');
        isValid = false;
      }
    });

    if (isValid) {
      successMessage.classList.add('show');
      form.style.display = 'none';

      // Production build will strip console statements
      // Development logging removed for security

      setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        successMessage.classList.remove('show');
      }, 3000);
    }
  });
}

// CONTACT FORM HANDLING
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const contactSuccess = document.getElementById('contact-success');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const contactFormGroups = contactForm.querySelectorAll('.form-group');

    contactFormGroups.forEach((group) => {
      const input = group.querySelector('input, textarea');
      if (!input) return;

      group.classList.remove('error');

      if (input.required && !input.value.trim()) {
        group.classList.add('error');
        isValid = false;
      } else if (
        input.type === 'email' &&
        input.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
      ) {
        group.classList.add('error');
        isValid = false;
      }
    });

    if (isValid) {
      contactSuccess.style.display = 'block';
      contactForm.style.display = 'none';

      // Production build will strip console statements
      // Development logging removed for security

      setTimeout(() => {
        contactForm.reset();
        contactForm.style.display = 'block';
        contactSuccess.style.display = 'none';
      }, 3000);
    }
  });
}

// ACCESSIBILITY ENHANCEMENTS
const skipLink = document.querySelector('.skip-link');
if (!skipLink) {
  const newSkipLink = document.createElement('a');
  newSkipLink.href = '#main-content';
  newSkipLink.textContent = 'Skip to main content';
  newSkipLink.className = 'skip-link';
  document.body.prepend(newSkipLink);
}

// SCROLL TO FUNCTIONALITY (Replaces inline onclick handlers)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-scroll-to')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('data-target');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// Alt text checker - Production build will strip console statements
document.querySelectorAll('img').forEach((img) => {
  if (!img.alt) {
    // Accessibility issue detected - alt text missing
    // This would be logged in development builds only
  }
});

// ============================================
// COMPONENT INITIALIZATION
// ============================================

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lazy Loading
  try {
    const lazyLoader = new LazyLoader();
    window.lazyLoader = lazyLoader;
  } catch (e) {
    // LazyLoader initialization failed silently
  }

  // Initialize Modal System
  try {
    const modal = getModalInstance();
    window.modal = modal;
  } catch (e) {
    // Modal initialization failed silently
  }

  // Initialize Accordions (FAQ page)
  try {
    const accordions = initAccordions('.accordion');
    window.accordions = accordions;
  } catch (e) {
    // Accordion initialization failed silently
  }

  // Initialize Property Filter (Properties page)
  const propertiesContainer = document.getElementById('properties-grid');
  if (propertiesContainer && propertiesData.length > 0) {
    try {
      // Transform data for PropertyFilter
      const formattedProperties = propertiesData.map((prop, index) => ({
        id: `property-${index}`,
        slug: prop.name.toLowerCase().replace(/\s+/g, '-'),
        name: prop.name,
        address: prop.location,
        city: prop.location.split(',')[0].trim(),
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: 1200 + index * 150, // Placeholder sqft
        image: prop.image,
        tags: prop.tags.map((tag) => {
          if (tag.includes('Section 8')) return 'Section 8';
          if (tag.includes('HUD-VASH')) return 'HUD-VASH';
          if (tag.includes('Pet') || tag.includes('Family'))
            return 'Pet Friendly';
          return tag;
        }),
        featured: index === 0
      }));

      const propertyFilter = new PropertyFilter(
        formattedProperties,
        '#properties-grid'
      );
      propertyFilter.init();
      window.propertyFilter = propertyFilter;
    } catch (e) {
      // PropertyFilter initialization failed silently
    }
  }

  // Initialize Form Validators
  const applicationForm = document.getElementById('application-form');
  if (applicationForm) {
    try {
      const appValidator = new FormValidator('#application-form', {
        onSubmit: async (data) => { // eslint-disable-line no-unused-vars
          // Handle form submission
          const successMessage = document.getElementById('success-message');
          if (successMessage) {
            successMessage.classList.add('show');
            applicationForm.style.display = 'none';
          }

          setTimeout(() => {
            applicationForm.reset();
            applicationForm.style.display = 'block';
            if (successMessage) {
              successMessage.classList.remove('show');
            }
          }, 3000);
        },
        onError: (errors) => { // eslint-disable-line no-unused-vars
          // Errors are handled by FormValidator UI
        }
      });
      window.applicationFormValidator = appValidator;
    } catch (e) {
      // FormValidator initialization failed silently
    }
  }

  const contactFormEl = document.getElementById('contact-form');
  if (contactFormEl) {
    try {
      const contactValidator = new FormValidator('#contact-form', {
        onSubmit: async (data) => { // eslint-disable-line no-unused-vars
          const contactSuccess = document.getElementById('contact-success');
          if (contactSuccess) {
            contactSuccess.style.display = 'block';
            contactFormEl.style.display = 'none';
          }

          setTimeout(() => {
            contactFormEl.reset();
            contactFormEl.style.display = 'block';
            if (contactSuccess) {
              contactSuccess.style.display = 'none';
            }
          }, 3000);
        }
      });
      window.contactFormValidator = contactValidator;
    } catch (e) {
      // FormValidator initialization failed silently
    }
  }

  // Keyboard navigation detection
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.body.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
});

// Export for module usage
export { propertiesData };
