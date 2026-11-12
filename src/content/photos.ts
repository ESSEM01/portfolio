export interface PhotoCredit {
  name: string
  href: string
}

export interface Photo {
  /** Base name in public/photos; files exist at -640.webp and -1280.webp. */
  name: string
  alt: string
  width: number
  height: number
  credit: PhotoCredit
  /** Where the event happened, shown in the caption. */
  place: string
}

const dylan = { name: '@dylan.biasciutti.ph', href: 'https://www.instagram.com/dylan.biasciutti.ph/' }
const mmaricore = { name: '@mmaricore', href: 'https://www.instagram.com/mmaricore/' }
// The ATENEO posts don't name the photographer; credit the collective until we know.
const ateneo = { name: 'ATENEO (@ateneorm)', href: 'https://www.instagram.com/ateneorm/' }

export const coverPhoto: Photo = {
  name: 'battle-laugh',
  alt: 'Stefano laughing mid-verse in a freestyle circle, crowd and graffiti behind him. Black and white.',
  width: 1280,
  height: 960,
  credit: dylan,
  place: 'ATENEO x BRIK54, Rome, May 2025',
}

export const sideBPhotos: Photo[] = [
  {
    name: 'backyard-stage',
    alt: 'Stefano rapping into a microphone on stage under coloured lights.',
    width: 1280,
    height: 853,
    credit: mmaricore,
    place: 'ATENEO x Backyard, FusoLab, Rome',
  },
  {
    name: 'ateneo-mic',
    alt: 'Stefano rapping into a microphone, close up, crowd listening. Black and white.',
    width: 1280,
    height: 853,
    credit: ateneo,
    place: 'ATENEO, M7 Club, Rome, May 2025',
  },
  {
    name: 'ateneo-profile',
    alt: 'Stefano in profile, arm stretched out mid-verse, graffiti wall behind. Black and white.',
    width: 1280,
    height: 959,
    credit: ateneo,
    place: 'ATENEO, Ponte Lungo, Rome, May 2025',
  },
  {
    name: 'ateneo-point',
    alt: 'Stefano from behind, pointing at his opponent during a battle. Black and white.',
    width: 1280,
    height: 959,
    credit: dylan,
    place: 'ATENEO x World Street, Ponte Lungo, Rome',
  },
]

export function photoSrcSet(photo: Photo) {
  return `/photos/${photo.name}-640.webp 640w, /photos/${photo.name}-1280.webp 1280w`
}
