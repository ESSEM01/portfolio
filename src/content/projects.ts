import type { Project } from './types'

// Case-study text is a first draft from the project READMEs; to be rewritten in the content phase.
export const projects: Project[] = [
  {
    slug: 'organizzatore-spesa',
    title: 'Organizzatore spesa',
    summary:
      'Budget-driven grocery planner that matches local supermarket offers and suggests recipes with an LLM, under a fixed spending cap.',
    kind: 'personal',
    featured: true,
    stack: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'AdonisJS', 'libSQL', 'Anthropic API', 'Vitest', 'Docker', 'Render'],
    links: [
      { label: 'Code', href: 'https://github.com/ESSEM01/organizzatore-spesa' },
      // TODO: add the live Render URL once confirmed.
    ],
    caseStudy: {
      problem: 'Planning a weekly grocery list that respects a budget while using what is on offer nearby.',
      constraints: ['Free-tier hosting', 'LLM costs must stay capped', 'Single developer'],
      decisions: [
        'Monorepo with a framework-free domain package, so business rules are tested in isolation.',
        'Spending cap enforced server-side before every LLM call.',
      ],
      result: 'Working full-stack app with about 40 automated tests, deployed with a Render blueprint.',
    },
  },
  {
    slug: 'marcomusacchio',
    title: 'marcomusacchio.com',
    summary: 'Bilingual academic website with a headless CMS so the owner can publish without a developer.',
    kind: 'client',
    featured: true,
    stack: ['Astro', 'Sanity', 'Cloudflare Workers', 'Umami', 'Vitest'],
    links: [{ label: 'Live site', href: 'https://marcomusacchio.com' }],
    caseStudy: {
      problem: 'An academic needed a fast bilingual site he could update himself.',
      constraints: ['Two languages', 'Non-technical editor', 'Privacy-friendly analytics'],
      decisions: ['Static Astro pages fed by Sanity Studio', 'Deployed on Cloudflare', 'Umami instead of Google Analytics'],
      result: 'Live in production; the client publishes content on his own.',
    },
  },
  {
    slug: 'dolce-vita-photo',
    title: 'Dolce Vita Photo',
    summary: 'Wedding photographer website with an online booking flow connected to Google Calendar.',
    kind: 'client',
    featured: false,
    stack: ['Astro SSR', 'Google Calendar API', 'Nodemailer', 'Netlify'],
    links: [],
    caseStudy: {
      problem: 'A photographer wanted clients to request available dates without back-and-forth emails.',
      constraints: ['Public booking form exposed to spam', 'Real calendar availability'],
      decisions: ['Server-side availability check against Google Calendar', 'Rate limiting, honeypot field and a strict CSP'],
      result: 'Portfolio and booking in one site.',
    },
  },
  {
    slug: 'movie-list',
    title: 'Movie List',
    summary: 'Full-stack app to save and manage favourite movies.',
    kind: 'personal',
    featured: false,
    stack: ['React 19', 'TypeScript', 'React Router', 'AdonisJS 6', 'MariaDB'],
    links: [{ label: 'Code', href: 'https://github.com/ESSEM01/movie-list' }],
  },
  {
    slug: 'aura-studio',
    title: 'Aura Studio',
    summary: 'One-page website for a recording studio, built from a visual design.',
    kind: 'personal',
    featured: false,
    stack: ['React', 'Vite', 'CSS'],
    links: [{ label: 'Code', href: 'https://github.com/ESSEM01/aura-studio' }],
  },
]

export function findProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug && p.caseStudy)
}
