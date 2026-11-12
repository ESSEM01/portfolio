import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Argument } from '../../components/Argument'
import { ExternalLink } from '../../components/ExternalLink'
import { findProject, projects } from '../../content/projects'
import { NotFoundPage } from '../not-found/NotFoundPage'

/** One block of the liner notes: label on the left, text on the right (stacked on mobile). */
function Note({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-2 border-t border-(--color-rule) py-8 md:grid-cols-[10rem_minmax(0,1fr)]">
      <h2 className="font-sans text-base font-semibold">{heading}</h2>
      <div className="measure">{children}</div>
    </section>
  )
}

export function CaseStudyPage() {
  const { slug = '' } = useParams()
  const project = findProject(slug)
  if (!project?.caseStudy) return <NotFoundPage />

  const trackNumber = projects.indexOf(project) + 1
  const { problem, constraints, decisions, result } = project.caseStudy
  return (
    <article className="pt-6">
      <title>{`${project.title}, liner notes by Stefano Moretti`}</title>
      <p className="font-sans text-sm">
        <Link to="/#work" viewTransition>
          Back to the tracklist
        </Link>
      </p>
      <p className="mt-10 font-sans text-(--color-muted)">
        Liner notes, track {trackNumber} of {projects.length}
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.015em]">
        {project.title}
      </h1>
      <p className="measure mt-4 text-lg">
        {project.kind === 'client' ? 'Client project. ' : ''}
        {project.summary}
      </p>

      <div className="mt-12">
        <Note heading="In short">
          <Argument argument={project.argument} label={project.title} />
        </Note>
        <Note heading="Problem">
          <p>{problem}</p>
        </Note>
        <Note heading="Constraints">
          <ul className="list-disc pl-5">
            {constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Note>
        <Note heading="Decisions">
          <ul className="list-disc pl-5">
            {decisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Note>
        <Note heading="Result">
          <p>{result}</p>
        </Note>
        <Note heading="Produced with">
          <p className="font-sans">{project.stack.join(', ')}</p>
        </Note>
      </div>

      {project.links.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-6 border-t border-(--color-rule) pt-8 font-sans">
          {project.links.map((link) => (
            <ExternalLink key={link.href} href={link.href}>
              {link.label}
            </ExternalLink>
          ))}
        </p>
      )}
    </article>
  )
}
