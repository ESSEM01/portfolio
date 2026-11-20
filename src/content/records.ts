import { coverPhoto, sideBPhotos, type Photo } from './photos'
import { projects } from './projects'
import type { Project } from './types'

export type RecordKind = 'about' | 'project' | 'side-b' | 'skills' | 'experience' | 'contact'

export interface CrateRecord {
  /** Also the URL hash that scrolls the crate to this record (e.g. /#side-b). */
  id: string
  kind: RecordKind
  title: string
  /** One line under the title, next to the crate. */
  blurb: string
  cover: {
    /** Sleeve background and the disc's centre label. */
    color: string
    ink: string
    photo?: Photo
    /** Path of a 1024x774 image shown under the title band: a project screenshot or a stock photo. */
    screenshot?: string
    /** Attribution for a stock photo; its licence requires it to be shown. */
    credit?: { author: string; licence: string; href: string }
  }
  project?: Project
}

// Sleeve colours: one per record, so flipping through the crate reads as different albums.
const sleeves = [
  { color: '#6e1f2b', ink: '#fbf7f7' }, // burgundy
  { color: '#1f3a5f', ink: '#f1f4f9' }, // ink blue
  { color: '#c9962e', ink: '#1a1c20' }, // ochre
  { color: '#2f4a3a', ink: '#eef3ef' }, // forest
  { color: '#202124', ink: '#f4f4f5' }, // black
  { color: '#d9dbe0', ink: '#1a1c20' }, // pale grey
]

// Projects with a screenshot in public/screens (made by `npm run photos`).
// Organizzatore spesa and Movie List show their signed-out screens: the views behind the
// login need an account.
export const screenshotSlugs = ['organizzatore-spesa', 'marcomusacchio', 'dolce-vita-photo', 'movie-list', 'aura-studio']

const projectRecords: CrateRecord[] = projects.map((project, i) => ({
  id: project.slug,
  kind: 'project',
  title: project.title,
  blurb: project.summary,
  cover: {
    ...sleeves[(i + 1) % sleeves.length],
    screenshot: screenshotSlugs.includes(project.slug) ? `/screens/${project.slug}.webp` : undefined,
  },
  project,
}))

export const records: CrateRecord[] = [
  {
    id: 'about',
    kind: 'about',
    title: 'Premises',
    blurb: 'Who I am, in short. Open it for the full intro and my CV.',
    cover: { ...sleeves[0], photo: coverPhoto },
  },
  ...projectRecords,
  {
    id: 'side-b',
    kind: 'side-b',
    title: 'Side B: freestyle',
    blurb: 'What I do when I close the laptop.',
    cover: { color: '#202124', ink: '#f4f4f5', photo: sideBPhotos[0] },
  },
  {
    id: 'skills',
    kind: 'skills',
    title: 'Credits',
    blurb: 'Each skill, and the work where you can see it.',
    cover: {
      color: '#1f3a5f',
      ink: '#f1f4f9',
      screenshot: '/screens/turntable.webp',
      credit: {
        author: 'Adrian DuMay',
        licence: 'CC BY 2.0',
        href: 'https://commons.wikimedia.org/wiki/File:Technics_SL-1200MK2_turntable.jpg',
      },
    },
  },
  {
    id: 'experience',
    kind: 'experience',
    title: 'Discography',
    blurb: 'Where I have worked and studied.',
    cover: {
      color: '#c9962e',
      ink: '#1a1c20',
      screenshot: '/screens/boombox.webp',
      credit: {
        author: 'Rondo Estrello',
        licence: 'CC BY-SA 2.0, cropped',
        href: 'https://commons.wikimedia.org/wiki/File:Lasonic_i931_BOOMBOX!.jpg',
      },
    },
  },
  {
    id: 'contact',
    kind: 'contact',
    title: 'Contact',
    blurb: 'I am looking for a junior frontend or full-stack role.',
    cover: {
      color: '#6e1f2b',
      ink: '#fbf7f7',
      screenshot: '/screens/microphone.webp',
      credit: {
        author: 'Marcel Grieder',
        licence: 'CC BY 2.0',
        href: 'https://commons.wikimedia.org/wiki/File:Microphone_(Shure_SM58)_(4900485245).jpg',
      },
    },
  },
]

export function recordIndex(id: string) {
  return records.findIndex((r) => r.id === id)
}
