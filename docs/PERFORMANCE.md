# Performance notes

## Image strategy

The refactor uses CSS/SVG-like brand marks and avoids Base64 images. No bitmap-heavy UI library or browser PDF preview was added. Future bitmap screenshots should use `next/image` with explicit width and height and lazy loading when offscreen.

## Font strategy

The existing font stack is retained with `display=swap` on Google Fonts. A production deployment can move to `next/font` or local WOFF2 files for tighter control and fewer external requests.

## Bundle strategy

The app avoids large UI frameworks, charting packages, date libraries, and client-side PDF parsing. Components are small TypeScript/React modules and tables are rendered with semantic HTML plus horizontal scrolling.

## Dynamic import strategy

No heavy PDF preview exists in this pass. If a PDF preview/evidence viewer is added, it should be dynamically imported only on review routes and rendered off the main dashboard path.

## Backend extraction strategy

PDF extraction stays on the FastAPI backend. The current demo uses deterministic CTME data to model the real workflow while avoiding expensive browser parsing and unstable external AI calls.

## Cookie policy

Only small session identifiers should be stored client side. Extracted contract data is fetched from the API and must not be stored in cookies.

## Caching/deployment notes

Next.js production builds should be served with Brotli/Gzip. Static assets can receive long-lived cache headers. API responses for active transaction workspaces should be short-lived or no-store because review and task changes need to appear promptly.

## Intentionally not added

Tailwind, component libraries, PDF.js, chart libraries, auth providers, billing, email sending, Softr, Airtable, Handwrytten, and Make.com were intentionally not added to keep the custom demo focused, small, and maintainable.
