# CSS Path Fix Plan for Properties 4 Creations

## Problem Analysis

The CSS issues are caused by path mismatches between different deployment directories and inconsistent HTML references:

1. **Path Inconsistencies**: HTML files reference CSS/JS at different paths (`css/`, `public/css/`, `/css/`)
2. **Deployment Confusion**: Two potential output directories (`site/` vs `docs/`) with different structures
3. **Eleventy Configuration**: Passthrough copy settings don't match HTML references
4. **GitHub Pages Settings**: Likely serving from one directory while links point to another

## Current State Analysis

### Eleventy Configuration (Correct)
```javascript
// .eleventy.js lines 6-9
eleventyConfig.addPassthroughCopy("src/css", "css");
eleventyConfig.addPassthroughCopy("src/js", "js");
eleventyConfig.addPassthroughCopy("src/images", "images");
eleventyConfig.addPassthroughCopy("src/manifest.json", "manifest.json");
```

This configuration copies files to root-level directories (`css/`, `js/`, `images/`), NOT to `public/` subdirectories.

### Source Files (Correct)
- `src/_includes/layouts/base.html`: Uses `/js/accessibility-enhanced.js` and `/js/main.js` ✅
- `src/_includes/meta.html`: Uses `/css/main.css` ✅

### Problem Files (Incorrect)
- `docs/index.html`: Uses `css/style.css` (missing leading slash) and `public/js/main.js` (wrong path) ❌
- Other files in `docs/` directory likely have similar issues

## Solution Strategy

### 1. Standardize on Root-Relative Paths
All CSS/JS references should use root-relative paths with leading slashes:
- `/css/main.css` ✅
- `/js/main.js` ✅
- `/images/logo.svg` ✅

### 2. Fix Deployment Configuration
Ensure GitHub Pages serves from the `site/` directory (Eleventy's output)

### 3. Remove Conflicting docs/ Directory
The `docs/` directory appears to be an alternative build that conflicts with the main site structure.

## Implementation Plan

### Phase 1: Path Correction
1. **Update all HTML files in docs/ directory** to use root-relative paths
2. **Remove or consolidate docs/ directory** to avoid confusion
3. **Ensure CNAME file** is in the correct location

### Phase 2: Configuration Verification
1. **Verify Eleventy configuration** is correct (already is)
2. **Check GitHub Pages settings** to ensure serving from `site/` directory
3. **Update package.json scripts** if needed for proper deployment

### Phase 3: Testing and Validation
1. **Clean rebuild** the site
2. **Verify file structure** in output directory
3. **Test locally** with `npm run dev`
4. **Check for 404 errors** in browser console

## Specific File Changes Required

### docs/index.html
```html
<!-- Line 41: Change from -->
<link rel="stylesheet" href="css/style.css">
<!-- To -->
<link rel="stylesheet" href="/css/style.css">

<!-- Line 226: Change from -->
<script src="public/js/main.js"></script>
<!-- To -->
<script src="/js/main.js"></script>
```

### All other HTML files in docs/
Similar changes needed for any files referencing:
- `css/` → `/css/`
- `public/css/` → `/css/`
- `public/js/` → `/js/`
- `images/` → `/images/`

## Expected File Structure After Fix

```
_site/
├── css/
│   ├── main.css
│   ├── style.css
│   └── ...
├── js/
│   ├── main.js
│   ├── accessibility-enhanced.js
│   └── ...
├── images/
│   ├── logo/
│   ├── banners/
│   └── ...
├── index.html
├── properties.html
├── about.html
└── ...
```

## Verification Steps

1. **Build the site**: `npm run build`
2. **Check output**: `ls -la _site/css/` should show CSS files
3. **Test locally**: `npm run dev` and check browser console for 404 errors
4. **Check paths**: Navigate to `http://localhost:8080/css/main.css` should load
5. **Validate HTML**: Ensure all pages load with proper styling

## Deployment Checklist

1. [ ] All HTML files use root-relative paths (`/css/`, `/js/`, `/images/`)
2. [ ] Eleventy configuration copies files to correct locations
3. [ ] GitHub Pages serves from `site/` directory
4. [ ] CNAME file is in root of output directory
5. [ ] No conflicting `docs/` directory files
6. [ ] All CSS/JS files are present in output
7. [ ] No 404 errors in browser console
8. [ ] Site loads properly with all styling applied

## Rollback Plan

If issues occur after deployment:
1. Revert to previous commit
2. Check GitHub Pages settings
3. Verify file permissions
4. Test with simple HTML file first
5. Gradually reintroduce changes

## Success Criteria

- All pages load with proper CSS styling
- No 404 errors for CSS/JS files
- Consistent path structure across all HTML files
- Successful deployment to GitHub Pages
- Site passes accessibility and performance tests