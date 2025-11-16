# Portfolio Automated Screenshot Capture

Automated screenshot capture for all pages at multiple viewport sizes using Puppeteer.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start a local server (if testing locally):
```bash
# Using Python
python -m http.server 8000

# Or using Node http-server
npx http-server -c-1
```

## Usage

### Capture from local server
```bash
npm run screenshots:local
```

### Capture from remote URL
```bash
BASE_URL=https://benson.github.io npm run screenshots
```

### Run directly with Node
```bash
node screenshot.js
```

## Output

Screenshots are saved to the `screenshots/` directory with naming convention:
- `{page}-{viewport}.png`
- Example: `index-mobile.png`, `book-desktop.png`

## Viewports Captured

- **Mobile**: 375×667 (iPhone SE)
- **Tablet**: 768×1024 (iPad)
- **Desktop**: 1920×1080 (Full HD)

## Pages Captured

- `index.html` (Portfolio home)
- `book.html` (Book page)
- `books.html` (Books listing)

## Notes

- Headless browser runs in sandboxed mode
- Full-page screenshots are captured
- Network waits for idle connections before screenshotting
- 1-second delay between page load and screenshot to ensure animations settle
