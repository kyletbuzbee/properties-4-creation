# Design Principles - Properties 4 Creations

## Overview

This document outlines the design principles, visual language, and guidelines for the Properties 4 Creations housing platform serving **families and veterans** in East Texas. These principles ensure consistency, accessibility, and a professional user experience across all touchpoints.

---

## Core Values

### 1. Family & Veteran-First Design
- Design with dignity, respect, and accessibility as primary concerns for all families and veterans
- Use clear, straightforward language without jargon
- Provide multiple pathways to complete tasks
- Ensure all critical information is easily discoverable
- Consider diverse family structures and needs
- Honor veteran service while welcoming all eligible families

### 2. Transparency & Trust
- Clear information hierarchy with honest communication
- No hidden fees, terms, or conditions
- Progress indicators for multi-step processes
- Consistent, predictable interface patterns

### 3. Accessibility (WCAG 2.2 AA)
- Minimum 4.5:1 contrast ratio for all text
- 44x44px minimum touch targets
- Full keyboard navigation support
- Screen reader compatibility
- Respect user preferences (reduced motion, color scheme)

### 4. Performance
- Core Web Vitals compliance (LCP <2.5s, FID <100ms, CLS <0.1)
- Progressive enhancement approach
- Offline-first PWA capabilities
- Optimized images and assets

---

## Visual Language

### Color Palette

#### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#0B1120` | Brand, headers, CTAs, primary text |
| Gold | `#C28E5A` | Accents, highlights, interactive elements |
| Beige | `#F5F5F0` | Backgrounds, cards |

#### Semantic Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Error | `#D32F2F` | Error states, destructive actions |
| Success | `#388E3C` | Success states, confirmations |
| Warning | `#F57C00` | Warnings, cautions |
| Info | `#1976D2` | Informational messages |

#### Neutral Colors
- White (`#FFFFFF`) - Card backgrounds, text on dark
- Gray scale (`#F9FAFB` to `#111827`) - Borders, secondary text, dividers
- Black (`#000000`) - High contrast text when needed

### Typography

#### Font Families
- **Headings**: Merriweather (serif) - Conveys trust and professionalism
- **Body**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto) - Optimal readability
- **Code**: Monaco, Courier New (monospace) - Technical content

#### Type Scale
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Captions, labels |
| sm | 0.875rem (14px) | 1.25rem | Secondary text |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Lead paragraphs |
| xl | 1.25rem (20px) | 1.75rem | H4 headings |
| 2xl | 1.5rem (24px) | 2rem | H3 headings |
| 3xl | 1.875rem (30px) | 2.25rem | H2 headings |
| 4xl | 2.25rem (36px) | 2.5rem | H1 headings |
| 5xl | 3rem (48px) | 1 | Hero titles |

### Spacing System

Based on an 8px grid system for consistent rhythm:

| Token | Value | Usage |
|-------|-------|-------|
| spacing-1 | 0.25rem (4px) | Tight spacing, icons |
| spacing-2 | 0.5rem (8px) | Inline elements |
| spacing-3 | 0.75rem (12px) | Small gaps |
| spacing-4 | 1rem (16px) | Standard spacing |
| spacing-6 | 1.5rem (24px) | Section padding |
| spacing-8 | 2rem (32px) | Large gaps |
| spacing-12 | 3rem (48px) | Section margins |
| spacing-16 | 4rem (64px) | Page sections |

### Shadows

| Level | Usage |
|-------|-------|
| xs | Subtle depth for inputs |
| sm | Cards at rest |
| md | Cards on hover |
| lg | Modals, dropdowns |
| xl | Floating elements |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.125rem | Subtle rounding |
| base | 0.25rem | Inputs, small elements |
| md | 0.375rem | Buttons |
| lg | 0.5rem | Cards |
| xl | 0.75rem | Large cards |
| full | 9999px | Pills, avatars |

---

## Component Guidelines

### Buttons

#### Variants
1. **Primary** - Main CTAs (gold background, navy text)
2. **Secondary** - Secondary actions (navy outline)
3. **Tertiary** - Low-emphasis actions (text only)
4. **Danger** - Destructive actions (red)

#### States
- Default, Hover, Active, Focus, Disabled, Loading

#### Sizing
- Small: 36px height, 14px text
- Medium: 44px height, 16px text (default)
- Large: 52px height, 18px text

#### Rules
- Always include visible focus indicator
- Minimum 44x44px touch target
- Use loading state for async actions
- Include icon + text for important actions

### Cards

#### Property Cards
- Image with lazy loading
- Title (H3)
- Address
- Features (beds, baths, sqft)
- Tags (Section 8, HUD-VASH, Pet Friendly)
- CTA button

#### Hover Effects
- Subtle lift (translateY -4px)
- Shadow increase
- Image zoom (scale 1.05)

### Forms

#### Input Fields
- Clear labels above inputs
- Placeholder text for examples only
- Error messages below with icon
- Success state on valid input
- 16px minimum font size (prevents iOS zoom)

#### Validation
- Real-time validation on blur
- Clear error messages with recovery path
- Use aria-live for screen reader announcements

### Navigation

#### Header
- Sticky on scroll
- Glass morphism effect
- Mobile hamburger menu at 768px
- Skip navigation link

#### Mobile Menu
- Full-screen overlay
- Focus trap when open
- Close on Escape key
- Animate from left

---

## Motion Guidelines

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| instant | 0ms | Immediate feedback |
| fast | 150ms | Micro-interactions |
| base | 250ms | Standard transitions |
| slow | 350ms | Complex animations |
| slower | 500ms | Page transitions |

### Easing
| Token | Value | Usage |
|-------|-------|-------|
| easeOut | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| easeIn | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| easeInOut | cubic-bezier(0.4, 0, 0.2, 1) | Move animations |
| bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Playful feedback |

### Reduced Motion
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints
| Name | Value | Target |
|------|-------|--------|
| xs | 320px | Small phones |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Mobile-First Approach
Write base styles for mobile, then add complexity:
```css
/* Mobile (default) */
.grid { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Accessibility Checklist

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (AA)
- [ ] Large text contrast ratio ≥ 3:1
- [ ] Non-text contrast ratio ≥ 3:1
- [ ] Don't rely on color alone for meaning

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] Skip navigation link
- [ ] Escape closes modals/menus

### Screen Readers
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Alt text for images
- [ ] ARIA labels for icons/buttons
- [ ] Live regions for dynamic content

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages linked with aria-describedby
- [ ] Required fields marked with aria-required
- [ ] Form validation announced

### Touch
- [ ] 44x44px minimum touch targets
- [ ] 8px minimum spacing between targets
- [ ] No hover-only interactions

---

## File Naming Conventions

### Images
```
[type]-[location]-[description].[ext]
```
Examples:
- `hero-home-banner.webp`
- `properties-tyler-ranch-home.webp`
- `icon-section-8.svg`

### CSS Classes (BEM)
```
.block__element--modifier
```
Examples:
- `.property-card`
- `.property-card__image`
- `.property-card--featured`

### JavaScript
```
camelCase for variables/functions
PascalCase for classes
UPPER_SNAKE_CASE for constants
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial design system documentation |

---

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
