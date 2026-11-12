import type { SkillGroup } from './types'

// Every skill points to the project slugs or job ids that prove it.
export const skillGroups: SkillGroup[] = [
  {
    label: 'Frontend',
    skills: [
      { name: 'HTML & CSS', evidence: ['key-associati', 'aura-studio'] },
      { name: 'JavaScript / TypeScript', evidence: ['organizzatore-spesa', 'movie-list'] },
      { name: 'React', evidence: ['organizzatore-spesa', 'movie-list', 'aura-studio'] },
      { name: 'Tailwind CSS', evidence: ['organizzatore-spesa'] },
      { name: 'Astro', evidence: ['marcomusacchio', 'dolce-vita-photo'] },
    ],
  },
  {
    label: 'Backend',
    skills: [
      { name: 'AdonisJS', evidence: ['organizzatore-spesa', 'movie-list'] },
      { name: 'PHP / Laravel', evidence: ['ok-one'] },
      { name: 'SQL (MySQL, MariaDB, libSQL)', evidence: ['key-associati', 'movie-list', 'organizzatore-spesa'] },
      { name: 'LLM APIs', evidence: ['organizzatore-spesa'] },
    ],
  },
  {
    label: 'Practice',
    skills: [
      { name: 'Automated testing (Vitest)', evidence: ['organizzatore-spesa', 'marcomusacchio'] },
      { name: 'Git & code review', evidence: ['ok-one'] },
      { name: 'Docker & deploys', evidence: ['organizzatore-spesa', 'marcomusacchio'] },
      { name: 'Web security basics', evidence: ['dolce-vita-photo'] },
    ],
  },
]
