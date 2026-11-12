import { Link, useParams } from 'react-router'
import { ExternalLink } from '../../components/ExternalLink'
import { findProject } from '../../content/projects'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function CaseStudyPage() {
  const { slug = '' } = useParams()
  const project = findProject(slug)
  if (!project?.caseStudy) return <NotFoundPage />

  const { problem, constraints, decisions, result } = project.caseStudy
  return (
    <article className="py-8">
      <title>{`${project.title} — Stefano Moretti`}</title>
      <Link to="/" className="text-sm text-(--color-accent)">
        ← All work
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{project.title}</h1>
      <p className="mt-2 text-(--color-muted)">{project.summary}</p>

      <h2 className="mt-8 text-xl font-semibold">Problem</h2>
      <p>{problem}</p>
      <h2 className="mt-6 text-xl font-semibold">Constraints</h2>
      <ul className="list-disc pl-5">
        {constraints.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <h2 className="mt-6 text-xl font-semibold">Decisions</h2>
      <ul className="list-disc pl-5">
        {decisions.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <h2 className="mt-6 text-xl font-semibold">Result</h2>
      <p>{result}</p>
      <h2 className="mt-6 text-xl font-semibold">Stack</h2>
      <p>{project.stack.join(' · ')}</p>
      {project.links.length > 0 && (
        <div className="mt-6 flex gap-4 text-(--color-accent)">
          {project.links.map((link) => (
            <ExternalLink key={link.href} href={link.href}>
              {link.label}
            </ExternalLink>
          ))}
        </div>
      )}
    </article>
  )
}
