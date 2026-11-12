import type { Argument } from './types'

// From Stefano's own notes (Nov 2026); tone follows career-ops-data/voice-dna.md.
export const freestyle: { story: string[]; argument: Argument } = {
  story: [
    "I started freestyling 3 years ago, as a way to blow off steam after work. Now you'll find me in the circle at ATENEO battles around Rome.",
    "I've never won a battle, and I'm fine with that. I go for the fun first; the competition can wait.",
  ],
  argument: {
    premises: [
      'Freestyle is thought turned into language, live.',
      'Code is thought turned into language, with a compiler listening.',
    ],
    conclusion: 'Both work when thought and language stay in sync, and the person on the other end enjoys what comes out.',
  },
}
