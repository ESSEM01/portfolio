import { Link } from 'react-router'
import { Argument } from '../../components/Argument'
import { ExternalLink } from '../../components/ExternalLink'
import type { Project } from '../../content/types'
import { useAnimatedDetails } from './useAnimatedDetails'

/**
 * Projects as an album tracklist. Each track is a native <details>, so it works with
 * the keyboard and without JavaScript; useAnimatedDetails adds the smooth open/close.
 */
export function Tracklist({ projects }: { projects: Project[] }) {
  return (
    <ol className="border-t border-(--color-rule)">
      {projects.map((project, i) => (
        <li key={project.slug} className="border-b border-(--color-rule)">
          <Track project={project} number={i + 1} defaultOpen={i === 0} />
        </li>
      ))}
    </ol>
  )
}

function Track({ project, number, defaultOpen }: { project: Project; number: number; defaultOpen: boolean }) {
  const { detailsRef, bodyRef, expanded, onSummaryClick, onToggle } = useAnimatedDetails(defaultOpen)
  const headingId = `project-${project.slug}`

  return (
    <details ref={detailsRef} open={defaultOpen} onToggle={onToggle}>
      <summary
        onClick={onSummaryClick}
        className="track-summary grid grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-baseline gap-x-3 py-5"
      >
        <span aria-hidden="true" className="font-sans text-(--color-muted) tabular-nums">
          {number}
        </span>
        <span>
          <h3 id={headingId} className="track-title inline font-sans text-xl font-semibold tracking-tight sm:text-2xl">
            {project.title}
          </h3>
          {project.kind === 'client' && (
            <span className="ml-2 font-sans text-sm text-(--color-muted)">client project</span>
          )}
        </span>
        <PlusMinus expanded={expanded} />
      </summary>

      <div ref={bodyRef} className="pb-10 sm:pl-[3.25rem]">
        <p className="measure text-(--color-muted)">{project.summary}</p>
        <div className="mt-5">
          <Argument argument={project.argument} label={project.title} />
        </div>
        <p className="measure mt-6 font-sans text-sm text-(--color-muted)">
          Produced with {project.stack.join(', ')}.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-sans text-sm">
          {project.caseStudy && (
            <Link to={`/work/${project.slug}`} viewTransition>
              Read the liner notes
            </Link>
          )}
          {project.links.map((link) => (
            <ExternalLink key={link.href} href={link.href}>
              {link.label}
            </ExternalLink>
          ))}
        </p>
      </div>
    </details>
  )
}

/** Two bars: the vertical one turns flat when the track is open, so + becomes −. */
function PlusMinus({ expanded }: { expanded: boolean }) {
  return (
    <span aria-hidden="true" className="relative h-4 w-4 self-center justify-self-end text-(--color-accent)">
      <span className="absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 rounded-full bg-current" />
      <span
        className={`absolute top-0 left-1/2 h-4 w-0.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-400 ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:transition-none ${
          expanded ? 'rotate-90' : 'rotate-0'
        }`}
      />
    </span>
  )
}
