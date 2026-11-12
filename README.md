# Portfolio — Stefano Moretti

Personal portfolio site: selected work, case studies, skills and experience.

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router · Vitest + Testing Library · Vercel

## Run

```bash
npm install
npm run dev        # dev server
npm run test:run   # tests
npm run lint       # oxlint
npm run build      # type-check + production build
```

## Content

All text lives in typed data files in `src/content/`, not in components:

| File | What |
|---|---|
| `site.ts` | name, intro, public contact links |
| `projects.ts` | projects; those with `caseStudy` get a `/work/:slug` page |
| `experience.ts` | jobs |
| `skills.ts` | skills, each with `evidence` (project slugs / job ids that prove it — enforced by a test) |

## Routes

- `/` — home
- `/work/:slug` — case study
- anything else — 404

`vercel.json` rewrites every path to `index.html` so deep links work on refresh.
