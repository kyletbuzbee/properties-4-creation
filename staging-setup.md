# Staging Environment Setup

This document outlines the setup for a staging environment to test changes before deploying to production.

## Overview

A staging environment allows you to:
- Test new features and changes safely
- Validate performance and security improvements
- Preview changes before production deployment
- Test deployment workflows

## Environment Configuration

### 1. Environment Variables

Create a `.env.staging` file with staging-specific configuration:

```bash
# Staging Environment
NODE_ENV=staging
DEBUG=true

# Analytics (staging IDs)
GOOGLE_ANALYTICS_ID=GA_STAGING_MEASUREMENT_ID
ENABLE_SENTRY=true
SENTRY_DSN=https://staging-sentry-dsn@sentry.io/staging-project-id

# Form Settings (staging endpoints)
FORMSPREE_PROJECT_ID=staging-formspree-project-id
CONTACT_EMAIL=staging@properties4creations.com

# Security (relaxed for testing)
CSRF_PROTECTION_ENABLED=true
HONEYPOT_ENABLED=true

# Build Settings
BUILD_MINIFY=true
STRIP_CONSOLE=true
IMAGE_OPTIMIZATION=true

# Feature Flags (enable experimental features)
ENABLE_SERVICE_WORKER=false
ENABLE_PWA=false
ENABLE_OFFLINE_MODE=false
ENABLE_PERFORMANCE_MONITORING=true
```

### 2. Staging Domain

Set up a staging subdomain:
- Production: `properties4creations.com`
- Staging: `staging.properties4creations.com`

### 3. GitHub Actions for Staging

Add staging deployment workflow:

```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build for staging
        run: npm run build:staging
        env:
          NODE_ENV: staging
          
      - name: Deploy to staging
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
          destination_dir: staging
          cname: staging.properties4creations.com
```

### 4. Build Scripts for Staging

Add to `package.json`:

```json
{
  "scripts": {
    "build:staging": "cross-env NODE_ENV=staging npm run build",
    "staging": "npm run build:staging && npm run serve:staging",
    "serve:staging": "npx serve -s _site -l 3000"
  }
}
```

### 5. Staging-Specific Code

Create `src/js/config/staging.js`:

```javascript
// Staging configuration
export const stagingConfig = {
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || 'GA_STAGING_ID',
    enableSentry: process.env.ENABLE_SENTRY === 'true'
  },
  
  forms: {
    formspreeEndpoint: process.env.FORMSPREE_PROJECT_ID || 'staging-form-id',
    contactEmail: process.env.CONTACT_EMAIL || 'staging@properties4creations.com'
  },
  
  features: {
    enableServiceWorker: process.env.ENABLE_SERVICE_WORKER === 'true',
    enablePWA: process.env.ENABLE_PWA === 'true',
    enableOfflineMode: process.env.ENABLE_OFFLINE_MODE === 'true'
  },
  
  development: {
    debug: process.env.DEBUG === 'true',
    hotReload: true
  }
};

// Override production settings for staging
if (process.env.NODE_ENV === 'staging') {
  // Enable additional logging
  console.log('[Staging] Configuration loaded:', stagingConfig);
  
  // Add staging indicators
  document.body.classList.add('staging-environment');
}
```

### 6. Staging CSS

Add visual indicators for staging environment:

```css
/* src/css/staging.css */
.staging-environment {
  position: relative;
}

.staging-environment::before {
  content: 'STAGING ENVIRONMENT';
  position: fixed;
  top: 0;
  left: 0;
  background: #ff4444;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: bold;
  z-index: 9999;
  pointer-events: none;
}

/* Reduce opacity for staging to indicate it's not production */
.staging-environment {
  opacity: 0.95;
}

.staging-environment:hover {
  opacity: 1;
}
```

### 7. Testing and Validation

#### Automated Tests
- Run all unit tests: `npm run test`
- Run integration tests: `npm run test:integration`
- Run E2E tests: `npm run test:e2e`
- Run accessibility tests: `npm run test:accessibility`
- Run performance tests: `npm run lighthouse`

#### Manual Testing Checklist
- [ ] All forms submit correctly
- [ ] Navigation works properly
- [ ] Images load and display correctly
- [ ] Mobile responsiveness is maintained
- [ ] Accessibility features work
- [ ] Analytics are tracking (staging IDs)
- [ ] Error handling works correctly

### 8. Deployment Process

1. **Feature Development**: Work on feature branches
2. **Pull Request**: Create PR to `develop` branch
3. **Staging Deployment**: Automatic deployment to staging on merge to `develop`
4. **Testing**: Manual and automated testing on staging
5. **Production Deployment**: Manual deployment to production from `main` branch

### 9. Monitoring and Logging

#### Staging Monitoring
- Set up separate monitoring dashboards
- Use staging-specific analytics IDs
- Monitor staging-specific error rates
- Track staging-specific performance metrics

#### Logging
- Enable verbose logging in staging
- Log all form submissions (staging only)
- Log all API calls and responses
- Monitor resource loading times

### 10. Rollback Procedures

#### Staging Rollback
```bash
# Revert to previous commit
git revert <commit-hash>

# Force push to staging branch
git push origin <staging-branch> --force
```

#### Production Rollback
```bash
# Revert production deployment
git revert <production-commit-hash>

# Deploy rollback
git push origin main
```

## Benefits of Staging Environment

1. **Risk Reduction**: Test changes before production
2. **Quality Assurance**: Validate functionality and performance
3. **Team Collaboration**: Share preview links for feedback
4. **Integration Testing**: Test with staging APIs and services
5. **Performance Testing**: Validate optimizations before production

## Maintenance

- Regularly update staging dependencies
- Clean up old staging deployments
- Monitor staging resource usage
- Update staging data as needed
- Review and update staging configuration

## Security Considerations

- Use separate credentials for staging
- Restrict access to staging environment
- Use staging-specific API keys
- Don't use real user data in staging
- Implement proper authentication for staging access