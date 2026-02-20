# Draft

Draft is a browser-native PDF editor for Markdown, plain text, and image pages.

## Current Scope

- Continuous document editing (Word/Doc-style typing flow)
- Live fixed-page preview
- Image import and placement in preview canvas
- Rulers and snap behavior for image movement
- Saved documents (local browser storage)
- Template starts and workspace settings
- PDF export and shareable online preview links

Paginator and asset-pipeline functionality has been split into a separate app.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Radix UI
- Lucide icons

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Production build (uses `/draft/` base path for GitHub Pages)
- `npm run deploy`: Publish `dist/` to the `gh-pages` branch

## Export Behavior

- Text-only documents: direct PDF file download
- Documents with images: print-ready export flow is used so image rendering is preserved (choose **Save as PDF** in the print dialog)
- Online export links: `?view=pdf&share=...` route renders a shareable preview page

## GitHub Pages Deployment

Supported deployment paths:

1. GitHub Actions deploy from `main` (recommended)
2. Manual deploy with `npm run deploy`

### One-Time Setup

1. Push repository to GitHub
2. Open `Settings > Pages`
3. Set **Source** to **GitHub Actions**
4. Live URL:

```txt
https://ironsignalworks.github.io/draft/
```

### Manual Deploy

```bash
npm run deploy
```

This publishes current `dist/` output to `gh-pages`.

## Notes

- If Pages is not updating, verify the latest GitHub Actions run succeeded
- If both `main` and `gh-pages` exist, only the configured Pages source controls what is live


