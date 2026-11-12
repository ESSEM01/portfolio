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
      { label: 'Code on GitHub', href: 'https://github.com/ESSEM01/organizzatore-spesa' },
      // TODO: add the live Render URL once confirmed.
    ],
    argument: {
      premises: [
        'The weekly grocery budget is fixed.',
        'LLM calls cost money, so they need a hard cap.',
        'Business rules must be testable without the UI.',
      ],
      conclusion: 'A full-stack monorepo with a framework-free domain package and about 40 automated tests.',
    },
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
    links: [{ label: 'Visit the live site', href: 'https://marcomusacchio.com' }],
    argument: {
      premises: [
        'The site has to work in two languages.',
        'The owner is not a developer and must publish on his own.',
        'Visitor statistics without tracking cookies.',
      ],
      conclusion: 'Static Astro pages fed by Sanity, served from Cloudflare, with Umami analytics. Live in production.',
    },
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
    featured: true,
    stack: ['Astro SSR', 'Google Calendar API', 'Nodemailer', 'Netlify'],
    links: [],
    argument: {
      premises: [
        'Couples should see which dates are actually free.',
        'A public booking form attracts spam.',
      ],
      conclusion: 'Server-side availability from Google Calendar, protected by rate limiting, a honeypot and a strict CSP.',
    },
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
    links: [{ label: 'Code on GitHub', href: 'https://github.com/ESSEM01/movie-list' }],
    argument: {
      premises: ['A typed React client.', 'A REST API with a relational database.'],
      conclusion: 'React 19 and TypeScript on AdonisJS 6 and MariaDB.',
    },
  },
  {
    slug: 'aura-studio',
    title: 'Aura Studio',
    summary: 'One-page website for a recording studio, built from a visual design.',
    kind: 'personal',
    featured: false,
    stack: ['React', 'Vite', 'CSS'],
    links: [{ label: 'Code on GitHub', href: 'https://github.com/ESSEM01/aura-studio' }],
    argument: {
      premises: ['A visual design to follow closely.'],
      conclusion: 'A one-page React site matching the design.',
    },
  },
]

export function findProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug && p.caseStudy)
}

/** Display name for a project slug, used by skills evidence. */
export function projectTitle(slug: string): string | undefined {
  return projects.find((p) => p.slug === slug)?.title
}
