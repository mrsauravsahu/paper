#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const puppeteer  = require('puppeteer');

const BASE_DIR   = path.join(os().homedir(), '.mrsauravsahu', 'paper');
const EXAMPLES   = path.join(BASE_DIR, 'examples');
const PAPER_BIN  = path.join(BASE_DIR, 'paper');
const OUT_DIR    = path.join(__dirname, 'out');
const EDITOR_URL = 'http://localhost:3000';

function os() { return require('os'); }

function usage() {
  console.error('Usage: node e2e/index.js <examples/file.md> [--threshold=0.1]');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) usage();

  const mdArg = args.find(a => a.endsWith('.md'));
  const thresholdArg = args.find(a => a.startsWith('--threshold='));
  const threshold = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : 0.1;

  if (!mdArg) usage();

  const mdPath  = path.resolve(mdArg);
  const mdName  = path.basename(mdPath);
  const stem    = mdName.replace(/\.md$/, '');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pdfPath     = path.join(EXAMPLES, `${stem}.pdf`);
  const pdfPngPath  = path.join(OUT_DIR, `${stem}-pdf.png`);
  const prevPngPath = path.join(OUT_DIR, `${stem}-preview.png`);
  const diffPngPath = path.join(OUT_DIR, `${stem}-diff.png`);

  // Step 1: generate PDF
  console.log(`[1/4] Generating PDF from ${mdName}…`);
  execFileSync(PAPER_BIN, [mdPath, '-o', pdfPath, '-n'], { stdio: 'inherit' });

  // Step 2: PDF first page → PNG via ghostscript
  console.log('[2/4] Converting PDF page 1 to PNG…');
  execFileSync('gs', [
    '-dNOPAUSE', '-dBATCH', '-dFirstPage=1', '-dLastPage=1',
    '-sDEVICE=png16m', '-r150',
    `-sOutputFile=${pdfPngPath}`,
    pdfPath,
  ], { stdio: 'inherit' });

  // Step 3: screenshot preview pane via puppeteer
  console.log('[3/4] Screenshotting editor preview…');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1275, height: 1650, deviceScaleFactor: 1 });
  await page.goto(`${EDITOR_URL}/?file=${encodeURIComponent(mdName)}&fullscreen`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#preview', { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: prevPngPath, clip: { x: 0, y: 0, width: 1275, height: 1650 } });
  await browser.close();

  // Step 4: diff — resize both to common dimensions via ImageMagick
  console.log('[4/4] Diffing images…');
  const width  = 1275;
  const height = 1650;
  const pdfResized  = path.join(OUT_DIR, `${stem}-pdf-resized.png`);
  const prevResized = path.join(OUT_DIR, `${stem}-preview-resized.png`);
  execFileSync('magick', [pdfPngPath,  '-resize', `${width}x${height}!`, pdfResized]);
  execFileSync('magick', [prevPngPath, '-resize', `${width}x${height}!`, prevResized]);

  const pdfImg  = PNG.sync.read(fs.readFileSync(pdfResized));
  const prevImg = PNG.sync.read(fs.readFileSync(prevResized));

  const diff = new PNG({ width, height });
  const mismatch = pixelmatch(
    pdfImg.data, prevImg.data, diff.data,
    width, height,
    { threshold }
  );

  fs.writeFileSync(diffPngPath, PNG.sync.write(diff));

  const total   = width * height;
  const pct     = ((mismatch / total) * 100).toFixed(2);
  const passed  = mismatch === 0;

  console.log('');
  console.log(`Result:   ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Mismatch: ${mismatch} px / ${total} px (${pct}%)`);
  console.log(`Diff:     ${diffPngPath}`);
  console.log('');

  process.exit(passed ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
