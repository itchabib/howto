# Updates

This commit adds several improvements to the site:

- Accessible language selector and skip-to-content link (injected via assets/ui-enhancements.js)
- robots.txt and sitemap.xml for search engines
- Privacy & Analytics page with recommendations and a sample snippet
- CI: link checker (lychee) and accessibility checks (pa11y) workflows

Notes
- The link checker ignores assets to reduce noise. Adjust .github/workflows/link-check.yml if needed.
- The accessibility workflow runs pa11y against key pages using a simple http-server.

If you'd like, I can tweak the pa11y rules or add more pages to the checks.
