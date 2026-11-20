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

/**
 * Stain of the crate. A dark, low-saturation walnut sits with the site's ink, paper and
 * burgundy; raw orange pine fought with them. The dark theme gets a lighter stain so the
 * crate still reads against the near-black page.
 */
export const WOOD_STAINS = {
  light: ['#4d3d33', '#44352c', '#57463b', '#3e3129'],
  dark: ['#6f5f54', '#64554b', '#7a695d', '#5c4e45'],
}

/**
 * One wooden plank, drawn procedurally: long wavy grain, a knot or two, darker worn edges
 * and fine speckle. Returns the colour map and a matching bump map so light catches the
 * grain. Each `seed` gives a different plank, so the crate isn't made of identical boards.
 */
export function plankTextures(seed: number, tones: string[]) {
  const [colorEl, c] = canvas(1024, 256)
  const [bumpEl, b] = canvas(1024, 256)
  let state = seed * 7919 + 13
  const rand = () => ((state = (state * 9301 + 49297) % 233280) / 233280)

  c.fillStyle = tones[seed % tones.length]
  c.fillRect(0, 0, 1024, 256)
  b.fillStyle = '#8a8a8a'
  b.fillRect(0, 0, 1024, 256)

  // Broad bands of lighter and darker wood along the plank.
  for (let i = 0; i < 9; i++) {
    const y = rand() * 256
    const h = 14 + rand() * 46
    c.fillStyle = rand() > 0.5 ? `rgba(235, 222, 208, ${0.04 + rand() * 0.06})` : `rgba(20, 14, 10, ${0.06 + rand() * 0.12})`
    c.fillRect(0, y, 1024, h)
  }

  // Grain: many thin lines that wander slightly.
  for (let i = 0; i < 190; i++) {
    const y = rand() * 256
    const amp = 1 + rand() * 5
    const freq = 0.003 + rand() * 0.012
    const phase = rand() * 20
    const dark = rand() > 0.25
    const alpha = 0.06 + rand() * 0.24
    const width = 0.5 + rand() * 1.6
    c.strokeStyle = dark ? `rgba(20, 13, 9, ${alpha * 1.2})` : `rgba(232, 218, 202, ${alpha * 0.5})`
    b.strokeStyle = dark ? `rgba(40, 40, 40, ${alpha * 1.6})` : `rgba(210, 210, 210, ${alpha})`
    c.lineWidth = b.lineWidth = width
    c.beginPath()
    b.beginPath()
    for (let x = 0; x <= 1024; x += 8) {
      const yy = y + Math.sin(x * freq + phase) * amp
      c.lineTo(x, yy)
      b.lineTo(x, yy)
    }
    c.stroke()
    b.stroke()
  }

  // Knots: dark ovals with rings around them.
  const knots = seed % 3
  for (let k = 0; k < knots; k++) {
    const kx = 120 + rand() * 780
    const ky = 50 + rand() * 150
    const r = 8 + rand() * 12
    for (let ring = 5; ring >= 0; ring--) {
      c.strokeStyle = `rgba(16, 10, 7, ${0.12 + (5 - ring) * 0.07})`
      b.strokeStyle = `rgba(30, 30, 30, ${0.1 + (5 - ring) * 0.08})`
      c.lineWidth = b.lineWidth = 1.5
      for (const ctx of [c, b]) {
        ctx.beginPath()
        ctx.ellipse(kx, ky, r * (1 + ring * 0.75), r * (0.5 + ring * 0.3), 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    c.fillStyle = 'rgba(14, 9, 6, 0.8)'
    c.beginPath()
    c.ellipse(kx, ky, r, r * 0.55, 0, 0, Math.PI * 2)
    c.fill()
  }

  // Speckle, like open pores.
  for (let i = 0; i < 1400; i++) {
    c.fillStyle = `rgba(14, 9, 6, ${0.06 + rand() * 0.16})`
    c.fillRect(rand() * 1024, rand() * 256, 1 + rand() * 3, 1)
  }

  // Worn, darker edges and ends, where a sawn plank picks up dirt.
  for (const ctx of [c, b]) {
    const edge = ctx.createLinearGradient(0, 0, 0, 256)
    edge.addColorStop(0, 'rgba(10, 7, 5, 0.5)')
    edge.addColorStop(0.07, 'rgba(10, 7, 5, 0)')
    edge.addColorStop(0.93, 'rgba(10, 7, 5, 0)')
    edge.addColorStop(1, 'rgba(10, 7, 5, 0.55)')
    ctx.fillStyle = edge
    ctx.fillRect(0, 0, 1024, 256)
    const ends = ctx.createLinearGradient(0, 0, 1024, 0)
    ends.addColorStop(0, 'rgba(10, 7, 5, 0.4)')
    ends.addColorStop(0.03, 'rgba(10, 7, 5, 0)')
    ends.addColorStop(0.97, 'rgba(10, 7, 5, 0)')
    ends.addColorStop(1, 'rgba(10, 7, 5, 0.4)')
    ctx.fillStyle = ends
    ctx.fillRect(0, 0, 1024, 256)
  }

  const map = toTexture(colorEl)
  const bump = new THREE.CanvasTexture(bumpEl)
  bump.anisotropy = 8
  return { map, bump }
}
