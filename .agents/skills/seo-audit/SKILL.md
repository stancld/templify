---
name: seo-audit
description: Performs comprehensive SEO audit for Google Search and AI-powered search engines (ChatGPT, Perplexity, Claude). Use when asked to audit SEO, optimize for search, or improve discoverability.
---

# SEO Audit Skill

Performs an ultra-detailed technical and on-page SEO audit optimized for both traditional search engines and AI-powered search/chat systems.

## When to Use

- User asks to "audit SEO" or "check SEO issues"
- User wants to optimize for Google, Bing, or AI search
- User asks about search visibility or discoverability
- Before deploying a website to production

## Audit Process

Go through the website in extreme detail. Ultra think about this. Find ALL technical and on-page SEO issues.

### Phase 1: Technical SEO Foundation

#### 1.1 Crawlability & Indexing
- [ ] Check for `robots.txt` in `/public/robots.txt`
- [ ] Verify XML sitemap exists and is valid
- [ ] Check for proper canonical URLs
- [ ] Verify no accidental `noindex` tags
- [ ] Check for orphaned pages (no internal links)

#### 1.2 Performance & Core Web Vitals
- [ ] Analyze bundle size (target < 200KB initial JS)
- [ ] Check for code-splitting and lazy loading
- [ ] Verify image optimization (WebP, lazy loading, sizing)
- [ ] Check for render-blocking resources
- [ ] Verify proper caching headers

#### 1.3 Mobile & Accessibility
- [ ] Verify responsive meta viewport tag
- [ ] Check touch target sizes (min 44x44px)
- [ ] Verify semantic HTML structure
- [ ] Check color contrast ratios
- [ ] Verify keyboard navigation support

### Phase 2: On-Page SEO

#### 2.1 Meta Tags (in `index.html` or per-page)
```html
<!-- Essential -->
<title>Primary Keyword - Brand Name</title>
<meta name="description" content="150-160 chars, include keywords naturally">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/og-image.png">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://example.com/twitter-image.png">
```

#### 2.2 Heading Structure
- [ ] Single `<h1>` per page with primary keyword
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] Descriptive headings (not "Section 1")
- [ ] Keywords in headings where natural

#### 2.3 Content Quality
- [ ] Unique, valuable content on each page
- [ ] Internal linking between related pages
- [ ] External links to authoritative sources
- [ ] Alt text for all images

### Phase 3: Schema Markup (Structured Data)

Add JSON-LD schema to `index.html` for rich snippets:

#### 3.1 WebApplication Schema (for SaaS/Tools)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "App Name",
  "description": "What it does",
  "url": "https://example.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

#### 3.2 Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/handle",
    "https://github.com/handle"
  ]
}
```

#### 3.3 FAQ Schema (if applicable)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Question text?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Answer text."
    }
  }]
}
```

### Phase 4: AI Search Optimization (LLM/ChatGPT/Perplexity)

AI-powered search engines extract and cite information differently than traditional crawlers.

#### 4.1 Content Structure for AI
- [ ] Use clear, factual statements that can be quoted
- [ ] Structure content with clear Q&A patterns
- [ ] Include "What is X?" and "How to Y?" sections
- [ ] Use bullet points and numbered lists
- [ ] Provide concise definitions and explanations

#### 4.2 Cite-Worthy Information
- [ ] Include unique data, statistics, or insights
- [ ] Provide step-by-step instructions
- [ ] Add comparison tables
- [ ] Include pricing and feature information
- [ ] Date content when relevant for freshness

#### 4.3 Entity Clarity
- [ ] Clearly state what the product/service IS
- [ ] Define the target audience explicitly
- [ ] List specific use cases
- [ ] Compare to known alternatives (helps AI categorize)

#### 4.4 llms.txt (Optional - Emerging Standard)
Create `/public/llms.txt` for AI crawlers:
```
# App Name

> Brief description of what this is

## About
Detailed description for AI systems.

## Features
- Feature 1: Description
- Feature 2: Description

## Use Cases
- Use case 1
- Use case 2
```

### Phase 5: Files Checklist

Generate or verify these files exist:

| File | Purpose |
|------|---------|
| `/public/robots.txt` | Crawler instructions |
| `/public/sitemap.xml` | Page discovery |
| `/public/favicon.ico` | Browser tab icon |
| `/public/apple-touch-icon.png` | iOS home screen |
| `/public/og-image.png` | Social sharing (1200x630) |
| `/public/llms.txt` | AI search optimization |

## Output Format

After completing the audit, provide:

1. **Critical Issues** - Must fix before launch
2. **High Priority** - Significant SEO impact
3. **Medium Priority** - Improvements for better ranking
4. **Low Priority** - Nice to have optimizations
5. **Implementation Plan** - Ordered list of fixes with code snippets

## Quick Commands

Run these to check common issues:

```bash
# Check for meta tags in index.html
grep -E "<title>|<meta" index.html

# Find images without alt text
grep -r "<img" src/ | grep -v "alt="

# Check bundle size
npm run build && ls -la dist/assets/*.js

# Validate HTML structure
npx html-validate dist/index.html
```
