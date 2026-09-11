/*
 * One-off brand-asset generator. NOT part of any build — run manually with
 *   node scripts/make-brand-assets.mjs
 * from server/. Uses the sharp already in server/package.json rather than
 * adding a dependency. Rasterizes the favicon SVG into client/public/.
 * Commit the outputs; this script exists so they can be regenerated.
 */

import sharp from "sharp";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// server/scripts/ → repo root (the script's inputs and outputs live in client/).
const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const PUBLIC_DIR = path.join(ROOT, "client", "public");

const svg = await readFile(path.join(PUBLIC_DIR, "favicon.svg"));

async function render(name, width, height, opts = {}) {
  const out = path.join(PUBLIC_DIR, name);
  await sharp(svg, { density: 300 })
    .resize(width, height, { fit: "contain", background: opts.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : undefined })
    .png()
    .toFile(out);
  console.log(`wrote ${name}`);
}

// Social preview card. Transparent background so the brand gradient shows.
await render("og.png", 1200, 630, { transparent: true });
// Apple touch icon must be opaque.
await render("apple-touch-icon.png", 180, 180);
await render("favicon-32.png", 32, 32, { transparent: true });
await render("favicon-16.png", 16, 16, { transparent: true });

// The /about portrait: an 8 MB PNG is the LCP element. Resized to webp at a
// width nobody displays beyond (900px, q80), which keeps the crop-circle look
// at the sizes the page actually renders.
const aboutSrc = path.join(PUBLIC_DIR, "aboutme.png");
try {
  await sharp(aboutSrc).resize({ width: 900 }).webp({ quality: 80 }).toFile(path.join(PUBLIC_DIR, "aboutme.webp"));
  await unlink(aboutSrc);
  console.log("wrote aboutme.webp, removed aboutme.png");
} catch (err) {
  console.warn(`aboutme.png not processed: ${err.message}`);
}

// Unreferenced since the favicon migration — dead weight in the repo.
try {
  await unlink(path.join(PUBLIC_DIR, "icons.svg"));
  console.log("removed icons.svg");
} catch {
  // already gone
}
