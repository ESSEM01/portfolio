import { Link } from 'react-router'
import { Argument } from '../../components/Argument'
import { Credit } from '../../components/Credit'
import { ExternalLink } from '../../components/ExternalLink'
import { experience } from '../../content/experience'
import { freestyle } from '../../content/freestyle'
import { photoSrcSet, sideBPhotos } from '../../content/photos'
import { projectTitle } from '../../content/projects'
import type { CrateRecord } from '../../content/records'
import { site } from '../../content/site'
import { skillGroups } from '../../content/skills'
import type { Project } from '../../content/types'

/** What's inside each record once it's opened. */
export function RecordContent({ record }: { record: CrateRecord }) {
  switch (record.kind) {
    case 'about':
      return <About />
    case 'project':
      return <ProjectNotes project={record.project!} />
    case 'side-b':
      return <SideB />
    case 'skills':
      return <Skills />
    case 'experience':
      return <Experience />
    case 'contact':
      return <Contact />
  }
}

function About() {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.15] font-medium">{site.thesis}</p>
      <p className="measure text-lg">{site.intro}</p>
      <p className="flex flex-wrap gap-x-6 gap-y-2 font-sans">
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <ExternalLink href={site.github}>GitHub</ExternalLink>
        <a href={site.cvPath} download>
          Download CV (PDF)
        </a>
      </p>
    </div>
  )
}

function ProjectNotes({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="measure text-lg">
        {project.kind === 'client' ? 'Client project. ' : ''}
        {project.summary}
      </p>
      <Argument argument={project.argument} label={project.title} />
      <p className="measure font-sans text-sm text-(--color-muted)">Produced with {project.stack.join(', ')}.</p>
      <p className="flex flex-wrap gap-x-5 gap-y-1 font-sans">
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
  )
}

function SideB() {
  return (
    <div className="flex flex-col gap-5">
      {freestyle.story.map((line) => (
        <p key={line} className="measure text-lg">
          {line}
        </p>
      ))}
      <Argument argument={freestyle.argument} label="Freestyle and code" />
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {sideBPhotos.map((photo) => (
          <figure key={photo.name}>
            <div className="aspect-[4/3] overflow-hidden bg-(--color-rule)">
              <img
                src={`/photos/${photo.name}-640.webp`}
                srcSet={photoSrcSet(photo)}
                sizes="(min-width: 640px) 20rem, 90vw"
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <Credit photo={photo} className="mt-2" />
          </figure>
        ))}
      </div>
    </div>
  )
}

function evidenceName(ref: string) {
  return projectTitle(ref) ?? experience.find((job) => job.id === ref)?.company ?? ref
}

function Skills() {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
      {skillGroups.map((group) => (
        <div key={group.label}>
          <h3 className="border-b border-(--color-rule) pb-2 font-sans font-semibold">{group.label}</h3>
          <dl className="mt-3 flex flex-col gap-3">
            {group.skills.map((s) => (
              <div key={s.name}>
                <dt className="leading-snug">{s.name}</dt>
                <dd className="font-sans text-sm text-(--color-muted)">{s.evidence.map(evidenceName).join(', ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function year(ym: string) {
  return ym.slice(0, 4)
}

function Experience() {
  const rows = [
    ...experience.map((job) => ({
      key: job.id,
      years: `${year(job.start)}–${job.end ? year(job.end) : 'now'}`,
      title: `${job.role}, ${job.company}`,
      lines: job.highlights,
    })),
    {
      key: 'roma-tre',
      years: '2019–now',
      title: 'BA Philosophy, Roma Tre University',
      lines: ['Philosophy of science, philosophy of language, aesthetics.'],
    },
  ]
  return (
    <ol className="flex flex-col gap-8">
      {rows.map((row) => (
        <li key={row.key} className="grid gap-x-8 gap-y-1 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <p className="font-serif text-xl leading-tight text-(--color-muted) tabular-nums">{row.years}</p>
          <div>
            <h3 className="font-sans text-lg font-semibold">{row.title}</h3>
            <ul className="mt-1 flex flex-col gap-1">
              {row.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Contact() {
  return (
    <div className="flex flex-col gap-4">
      <p className="measure text-lg">
        I am looking for a junior frontend or full-stack role. The quickest way to reach me is email.
      </p>
      <p className="font-serif text-[clamp(1.375rem,4vw,2rem)] break-words">
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <p className="flex flex-wrap gap-x-6 font-sans">
        <ExternalLink href={site.github}>GitHub</ExternalLink>
        <a href={site.cvPath} download>
          Download CV (PDF)
        </a>
      </p>
    </div>
  )
}
