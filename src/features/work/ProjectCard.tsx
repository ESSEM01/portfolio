import { Link } from 'react-router'
import { ExternalLink } from '../../components/ExternalLink'
import type { Project } from '../../content/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article aria-labelledby={`project-${project.slug}`} className="rounded-lg border border-(--color-muted)/30 p-5">
      <h3 id={`project-${project.slug}`} className="text-lg font-semibold">
        {project.title}
      </h3>
      {project.kind === 'client' && <p className="text-xs uppercase text-(--color-muted)">Client work</p>}
      <p className="mt-2">{project.summary}</p>
      <ul aria-label="Stack" className="mt-3 flex flex-wrap gap-2 text-xs text-(--color-muted)">
        {project.stack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-(--color-accent)">
        {project.caseStudy && <Link to={`/work/${project.slug}`}>Read case study</Link>}
        {project.links.map((link) => (
          <ExternalLink key={link.href} href={link.href}>
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </article>
  )
}
