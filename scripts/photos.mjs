// Resizes the chosen raw photos (in _inbox, gitignored) into web-ready WebP files in public/photos.
// Run with: npm run photos
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = '_inbox/instagram'
const OUT = 'public/photos'
const WIDTHS = [640, 1280]

// file in _inbox -> public name
const photos = {
  'ig-26.jpg': 'battle-laugh',
  'ig-11.jpg': 'backyard-stage',
  'ig-24.jpg': 'ateneo-mic',
  'ig-22.jpg': 'ateneo-profile',
  'ig-20.jpg': 'ateneo-point',
}

await mkdir(OUT, { recursive: true })
for (const [file, name] of Object.entries(photos)) {
  for (const width of WIDTHS) {
    const info = await sharp(`${SRC}/${file}`)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(`${OUT}/${name}-${width}.webp`)
    console.log(`${name}-${width}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`)
  }
}
