/**
 * Automated Screenshot Capture for Portfolio Website
 * Captures screenshots of all pages at multiple viewport widths
 * Usage: node screenshot.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = [
    { name: 'index', path: '/' },
    { name: 'book', path: '/book.html' },
    { name: 'books', path: '/books.html' },
];

const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
];

const OUTPUT_DIR = path.join(__dirname, 'screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        console.log('🚀 Starting screenshot capture...\n');

        for (const page of PAGES) {
            console.log(`📄 Capturing: ${page.name}`);

            for (const viewport of VIEWPORTS) {
                const browser_page = await browser.newPage();
                await browser_page.setViewport({ width: viewport.width, height: viewport.height });

                const url = `${BASE_URL}${page.path}`;

                try {
                    await browser_page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                    // Wait for animations to settle
                    await browser_page.waitForTimeout(1000);

                    const filename = `${page.name}-${viewport.name}.png`;
                    const filepath = path.join(OUTPUT_DIR, filename);

                    await browser_page.screenshot({ path: filepath, fullPage: true });
                    console.log(`   ✓ ${viewport.name.padEnd(8)} → ${filename}`);
                } catch (error) {
                    console.error(`   ✗ ${viewport.name.padEnd(8)} → Error: ${error.message}`);
                } finally {
                    await browser_page.close();
                }
            }
            console.log();
        }

        console.log(`✅ Screenshots saved to: ${OUTPUT_DIR}\n`);
        console.log('📊 Summary:');
        console.log(`   Pages: ${PAGES.length}`);
        console.log(`   Viewports: ${VIEWPORTS.length}`);
        console.log(`   Total screenshots: ${PAGES.length * VIEWPORTS.length}`);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
