import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Brand SVG template with clean padding and modern aesthetics
function createLogoSvg(size: number, isMaskable: boolean = false): Buffer {
  const padding = isMaskable ? size * 0.22 : size * 0.12;
  const innerSize = size - padding * 2;
  const cornerRadius = isMaskable ? 0 : size * 0.22; // Maskable icons should have full bleed or solid bg

  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#006d37" />
          <stop offset="100%" stop-color="#004d26" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2ecc71" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#2ecc71" stop-opacity="0.05" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="${size * 0.03}" stdDeviation="${size * 0.04}" flood-color="#000" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- Background Box -->
      <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bgGrad)" />

      <!-- Decorative Inner Ring -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${innerSize * 0.46}" fill="none" stroke="url(#ringGrad)" stroke-width="${Math.max(2, size * 0.025)}" />

      <!-- Storefront Icon (MdStorefront inspired vector) -->
      <g transform="translate(${padding}, ${padding})" filter="url(#shadow)">
        <svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" fill="#ffffff"/>
          <path d="M12 18H6v-4h6v4z" fill="#6bfe9c" opacity="0.3"/>
        </svg>
      </g>
    </svg>
  `);
}

async function generateIcons() {
  console.log("Generating high-resolution PWA icons with sharp...");

  const icons = [
    { name: "icon-192x192.png", size: 192, maskable: false },
    { name: "icon-512x512.png", size: 512, maskable: false },
    { name: "maskable-icon-512x512.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: false },
    { name: "favicon-32x32.png", size: 32, maskable: false },
    { name: "favicon-16x16.png", size: 16, maskable: false },
  ];

  for (const icon of icons) {
    const filePath = path.join(ICONS_DIR, icon.name);
    const svgBuffer = createLogoSvg(icon.size, icon.maskable);

    await sharp(svgBuffer)
      .png({ quality: 100 })
      .toFile(filePath);

    console.log(`✓ Created ${icon.name} (${icon.size}x${icon.size}${icon.maskable ? ", maskable" : ""})`);
  }

  console.log("All PWA icons generated successfully inside /public/icons!");
}

generateIcons().catch((err) => {
  console.error("Failed to generate PWA icons:", err);
  process.exit(1);
});
