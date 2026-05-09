/**
 * Generates all PWA icon sizes and iOS splash screens from the finBloom SVG.
 * Run once after cloning, or after changing the icon:
 *
 *   npm install
 *   npm run generate-icons
 */
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");
const svgPath = join(root, "src", "assets", "finbloom-icon.svg");

if (!existsSync(svgPath)) {
  console.error("❌  Source SVG not found at src/assets/finbloom-icon.svg");
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });
const svg = readFileSync(svgPath);

// ─── App icons ──────────────────────────────────────────────────────────────

const iconSizes = [72, 96, 128, 144, 152, 167, 192, 384, 512];

console.log("🌱  Generating app icons…");
for (const size of iconSizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`   ✓ icon-${size}.png`);
}

// Apple touch icon — 180×180 is the canonical modern iOS size
await sharp(svg)
  .resize(180, 180)
  .png()
  .toFile(join(iconsDir, "apple-touch-icon.png"));
console.log("   ✓ apple-touch-icon.png");

// ─── Maskable icon (safe zone = 80% of canvas) ──────────────────────────────

console.log("\n🌸  Generating maskable icon…");
const maskSize = 512;
const innerSize = Math.round(maskSize * 0.8);
const pad = Math.round((maskSize - innerSize) / 2);

const innerBuf = await sharp(svg).resize(innerSize, innerSize).png().toBuffer();

await sharp({
  create: {
    width: maskSize,
    height: maskSize,
    channels: 4,
    background: { r: 245, g: 240, b: 232, alpha: 1 }, // cream #F5F0E8
  },
})
  .composite([{ input: innerBuf, top: pad, left: pad }])
  .png()
  .toFile(join(iconsDir, "icon-maskable-512.png"));
console.log("   ✓ icon-maskable-512.png");

// ─── iOS splash screens ─────────────────────────────────────────────────────

console.log("\n🍃  Generating iOS splash screens…");

const BG = { r: 245, g: 240, b: 232, alpha: 1 }; // matches background_color in manifest
const LOGO_RATIO = 0.28; // logo occupies 28% of shortest dimension

const splashSizes = [
  { name: "splash-1290x2796.png", w: 1290, h: 2796 }, // iPhone 14 Pro Max
  { name: "splash-1179x2556.png", w: 1179, h: 2556 }, // iPhone 14 Pro
  { name: "splash-1170x2532.png", w: 1170, h: 2532 }, // iPhone 14
  { name: "splash-750x1334.png",  w: 750,  h: 1334  }, // iPhone SE
  { name: "splash-2048x2732.png", w: 2048, h: 2732  }, // iPad Pro 12.9"
  { name: "splash-1668x2388.png", w: 1668, h: 2388  }, // iPad Pro 11"
];

for (const { name, w, h } of splashSizes) {
  const logoSize = Math.round(Math.min(w, h) * LOGO_RATIO);
  const logoBuf = await sharp(svg).resize(logoSize, logoSize).png().toBuffer();

  await sharp({ create: { width: w, height: h, channels: 4, background: BG } })
    .composite([
      {
        input: logoBuf,
        left: Math.round((w - logoSize) / 2),
        top: Math.round((h - logoSize) / 2),
      },
    ])
    .png()
    .toFile(join(iconsDir, name));
  console.log(`   ✓ ${name}`);
}

console.log("\n✅  All icons generated in public/icons/");
console.log("   Commit the public/icons/ directory and deploy.");
