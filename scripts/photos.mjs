// Resizes the chosen raw photos (in _inbox, gitignored) into web-ready WebP files in public/photos.
// Run with: npm run photos
import { existsSync } from 'node:fs'
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

// Project screenshots for the record covers: the top of each page, cropped to the
// area under the cover's title band (1024x774) so nothing important is hidden.
const SCREENS_SRC = '_inbox/screens'
const SCREENS_OUT = 'public/screens'
const screens = ['marcomusacchio', 'dolce-vita-photo', 'movie-list', 'aura-studio', 'organizzatore-spesa']

await mkdir(SCREENS_OUT, { recursive: true })
for (const slug of screens) {
  if (!existsSync(`${SCREENS_SRC}/${slug}.png`)) continue
  const image = sharp(`${SCREENS_SRC}/${slug}.png`)
  const { width } = await image.metadata()
  const info = await image
    .extract({ left: 0, top: 0, width, height: Math.round((width * 774) / 1024) })
    .resize({ width: 1024 })
    .webp({ quality: 78 })
    .toFile(`${SCREENS_OUT}/${slug}.webp`)
  console.log(`screens/${slug}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`)
}
