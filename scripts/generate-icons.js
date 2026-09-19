/**
 * Run this script once to generate PWA PNG icons from icon.svg.
 * Usage: node scripts/generate-icons.js
 * Requires: npm install sharp (run once, not saved to package.json)
 */
const sharp = require('sharp')
const path = require('path')

const svgPath = path.join(__dirname, '../public/icons/icon.svg')
const outDir = path.join(__dirname, '../public/icons')

const sizes = [192, 512]

async function main() {
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`))
    console.log(`✅ Generated icon-${size}x${size}.png`)
  }

  // Maskable icon (slightly padded)
  await sharp(svgPath)
    .resize(460, 460)
    .extend({ top: 26, bottom: 26, left: 26, right: 26, background: '#4f46e5' })
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-maskable-512x512.png'))
  console.log('✅ Generated icon-maskable-512x512.png')
  console.log('\nDone! PWA icons are ready.')
}

main().catch(console.error)
