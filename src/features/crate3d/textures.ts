import * as THREE from 'three'
import type { CrateRecord } from '../../content/records'
import { site } from '../../content/site'

const SERIF = '"Literata Variable", Georgia, serif'
const SANS = '"Instrument Sans Variable", system-ui, sans-serif'
const SIZE = 1024

/** Make sure the web fonts are ready before drawing text into canvases. */
export async function loadFonts() {
  await Promise.all([
    document.fonts.load(`500 96px ${SERIF}`),
    document.fonts.load(`italic 500 96px ${SERIF}`),
    document.fonts.load(`600 40px ${SANS}`),
  ]).catch(() => undefined)
}

/** Drawing code works in 1024-unit coordinates; the bitmap is 75% of that to save GPU memory. */
const RESOLUTION = 0.75

function canvas(width = SIZE, height = SIZE) {
  const el = document.createElement('canvas')
  el.width = Math.round(width * RESOLUTION)
  el.height = Math.round(height * RESOLUTION)
  const ctx = el.getContext('2d')!
  ctx.scale(RESOLUTION, RESOLUTION)
  return [el, ctx] as const
}

function toTexture(el: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(el)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Split text into at most `maxLines` lines that fit `maxWidth`, shrinking the font if needed. */
function fitText(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, min: number, maxWidth: number, maxLines: number) {
  for (let px = start; px >= min; px -= 4) {
    ctx.font = font(px)
    const words = text.replace('.', '. ').split(' ')
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const next = line ? (line.endsWith('.') ? line + word : `${line} ${word}`) : word
      if (ctx.measureText(next).width <= maxWidth) line = next
      else {
        lines.push(line)
        line = word
      }
    }
    lines.push(line)
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) return { px, lines }
  }
  ctx.font = font(min)
  return { px: min, lines: [text] }
}

/**
 * The front of a sleeve. The title sits in the top band on purpose: in the crate only
 * the top of each record shows, and a lifted record reveals exactly that band.
 */
export async function coverTexture(record: CrateRecord, number: number, total: number) {
  const [el, ctx] = canvas()
  const { color, ink, photo, screenshot } = record.cover
  const pad = 72
  const BAND = 250

  ctx.fillStyle = color
  ctx.fillRect(0, 0, SIZE, SIZE)

  if (photo) {
    const img = await loadImage(`/photos/${photo.name}-1280.webp`).catch(() => null)
    if (img) {
      // object-fit: cover, biased toward the face like the CSS version.
      const scale = Math.max(SIZE / img.width, SIZE / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (SIZE - w) * 0.46, (SIZE - h) * 0.4, w, h)
    }
    ctx.fillStyle = color
    ctx.fillRect(0, 0, SIZE, BAND)
  } else if (screenshot) {
    // Screenshots are pre-cropped to exactly the area under the band.
    const img = await loadImage(screenshot).catch(() => null)
    if (img) ctx.drawImage(img, 0, BAND, SIZE, SIZE - BAND)
  }

  ctx.fillStyle = ink
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 34px ${SANS}`
  ctx.globalAlpha = 0.8
  ctx.fillText(site.name, pad, pad + 10)
  const count = `${number}/${total}`
  ctx.fillText(count, SIZE - pad - ctx.measureText(count).width, pad + 10)
  ctx.globalAlpha = 1

  // With an image the title has to stay on one line inside the band.
  const hasImage = Boolean(photo || screenshot)
  const { px, lines } = fitText(ctx, record.title, (p) => `500 ${p}px ${SERIF}`, hasImage ? 88 : 112, 56, SIZE - pad * 2, hasImage ? 1 : 2)
  lines.forEach((line, i) => ctx.fillText(line, pad, pad + 60 + px * 0.9 + i * px * 1.05))

  if (!hasImage) {
    ctx.font = `500 34px ${SANS}`
    ctx.globalAlpha = 0.8
    const footer = record.project ? record.project.stack.slice(0, 4).join(', ') : record.blurb
    const { lines: foot } = fitText(ctx, footer, (p) => `500 ${p}px ${SANS}`, 34, 26, SIZE - pad * 2, 2)
    foot.forEach((line, i) => ctx.fillText(line, pad, SIZE - pad - (foot.length - 1 - i) * 42))
    ctx.globalAlpha = 1
  }

  return toTexture(el)
}

/**
 * Inside of the front cover: the left page when the record is open like a book.
 * Records with a screenshot or photo show it large here, since the front cover has
 * turned away. The image is drawn in when it has loaded.
 */
export function innerLeftTexture(record: CrateRecord, number: number, total: number) {
  const [el, ctx] = canvas()
  const pad = 64
  const spine = 28
  const { photo, screenshot } = record.cover
  const imageSrc = screenshot ?? (photo ? `/photos/${photo.name}-1280.webp` : null)

  ctx.fillStyle = '#eceef1'
  ctx.fillRect(0, 0, SIZE, SIZE)
  // A strip in the record's colour along the spine.
  ctx.fillStyle = record.cover.color
  ctx.fillRect(SIZE - spine, 0, spine, SIZE)

  ctx.fillStyle = '#5a616b'
  ctx.font = `600 32px ${SANS}`
  ctx.fillText(`Record ${number} of ${total}`, pad, pad + 16)
  ctx.fillStyle = '#1a1c20'

  if (!imageSrc) {
    const { px, lines } = fitText(ctx, record.title, (p) => `500 ${p}px ${SERIF}`, 104, 60, SIZE - pad * 2 - spine, 3)
    lines.forEach((line, i) => ctx.fillText(line, pad, pad + 110 + px * 0.9 + i * px * 1.05))
    ctx.fillStyle = '#5a616b'
    const { lines: blurb } = fitText(ctx, record.blurb, (p) => `500 ${p}px ${SERIF}`, 46, 36, SIZE - pad * 2 - spine, 5)
    blurb.forEach((line, i) => ctx.fillText(line, pad, SIZE - pad - (blurb.length - 1 - i) * 60))
    return toTexture(el)
  }

  const { px } = fitText(ctx, record.title, (p) => `500 ${p}px ${SERIF}`, 68, 44, SIZE - pad * 2 - spine, 1)
  ctx.fillText(record.title, pad, pad + 30 + px)
  // No blurb here: it would crowd the image, and the notes sheet already has it.

  // Image area: full width up to the spine, 1024:774 like the screenshots.
  const box = { x: 0, y: 190, w: SIZE - spine, h: Math.round(((SIZE - spine) * 774) / 1024) }
  ctx.fillStyle = '#d9dbe0'
  ctx.fillRect(box.x, box.y, box.w, box.h)
  const texture = toTexture(el)
  loadImage(imageSrc)
    .then((img) => {
      // object-fit: cover into the box (photos are cropped, screenshots already match).
      const scale = Math.max(box.w / img.width, box.h / img.height)
      const sw = box.w / scale
      const sh = box.h / scale
      ctx.drawImage(img, (img.width - sw) * 0.46, (img.height - sh) * 0.35, sw, sh, box.x, box.y, box.w, box.h)
      texture.needsUpdate = true
    })
    .catch(() => undefined)
  return texture
}

/** Plain inner paper (the right page sits under the HTML notes). */
export function paperTexture() {
  const [el, ctx] = canvas(64, 64)
  ctx.fillStyle = '#f6f7f8'
  ctx.fillRect(0, 0, 64, 64)
  return toTexture(el)
}

/** The disc's paper label. */
export function labelTexture(record: CrateRecord) {
  const [el, ctx] = canvas(512, 512)
  ctx.fillStyle = record.cover.color
  ctx.beginPath()
  ctx.arc(256, 256, 256, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = record.cover.ink
  ctx.textAlign = 'center'
  const { px, lines } = fitText(ctx, record.title, (p) => `600 ${p}px ${SANS}`, 56, 30, 360, 2)
  lines.forEach((line, i) => ctx.fillText(line, 256, 150 + i * px * 1.1))
  ctx.font = `500 30px ${SANS}`
  ctx.fillText(site.name, 256, 400)
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(256, 256, 14, 0, Math.PI * 2)
  ctx.fill()
  return toTexture(el)
}

/** Fine concentric grooves for the vinyl surface. */
export function grooveTexture() {
  const [el, ctx] = canvas(512, 512)
  ctx.fillStyle = '#121214'
  ctx.fillRect(0, 0, 512, 512)
  for (let r = 256; r > 90; r -= 3) {
    ctx.strokeStyle = r % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.arc(256, 256, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  return toTexture(el)
}

/** Procedural wood grain for the crate: warm planks with wavy darker lines. */
export function woodTexture() {
  const [el, ctx] = canvas(1024, 256)
  ctx.fillStyle = '#9a6a42'
  ctx.fillRect(0, 0, 1024, 256)
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 70; i++) {
    const y = rand() * 256
    const amp = 2 + rand() * 6
    const freq = 0.004 + rand() * 0.01
    ctx.strokeStyle = `rgba(${60 + rand() * 30}, ${35 + rand() * 20}, ${15 + rand() * 10}, ${0.15 + rand() * 0.3})`
    ctx.lineWidth = 0.6 + rand() * 2
    ctx.beginPath()
    for (let x = 0; x <= 1024; x += 8) ctx.lineTo(x, y + Math.sin(x * freq + i) * amp)
    ctx.stroke()
  }
  const texture = toTexture(el)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}
