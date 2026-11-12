import { ExternalLink } from '../../components/ExternalLink'
import { experience } from '../../content/experience'
import { projects, projectTitle } from '../../content/projects'
import { site } from '../../content/site'
import { skillGroups } from '../../content/skills'
import { Tracklist } from '../work/Tracklist'
import { Cover } from './Cover'
import { SideB } from './SideB'

function year(ym: string) {
  return ym.slice(0, 4)
}

function evidenceName(ref: string) {
  return projectTitle(ref) ?? experience.find((job) => job.id === ref)?.company ?? ref
}

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="mb-6 font-serif text-3xl font-medium tracking-[-0.01em]">
      {children}
    </h2>
  )
}

export function HomePage() {
  return (
    <>
      <title>{`${site.name}, web developer`}</title>

      <section
        aria-labelledby="thesis"
        className="grid items-end gap-8 pt-6 pb-20 sm:pb-28 md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] md:gap-12"
      >
        <Cover />
        <div className="md:pb-8">
          <h1
            id="thesis"
            className="hero-line max-w-[18ch] font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] font-medium tracking-[-0.015em]"
          >
            {site.thesis}
          </h1>
          <p className="hero-line hero-line-2 measure mt-6 text-lg">{site.intro}</p>
          <p className="hero-line hero-line-3 mt-6 flex flex-wrap gap-x-6 gap-y-2 font-sans">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <ExternalLink href={site.github}>GitHub</ExternalLink>
            <a href={site.cvPath} download>
              Download CV (PDF)
            </a>
          </p>
        </div>
      </section>

      <section id="work" aria-labelledby="work-heading" className="scroll-mt-6">
        <SectionHeading id="work-heading">Side A: tracklist</SectionHeading>
        <Tracklist projects={projects} />
      </section>

      <SideB />

      <section aria-labelledby="credits-heading" className="mt-28">
        <SectionHeading id="credits-heading">Credits</SectionHeading>
        <p className="measure mb-8 text-(--color-muted)">Each skill, and the work where you can see it.</p>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-3">
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
      </section>

      <section id="experience" aria-labelledby="experience-heading" className="mt-28 scroll-mt-6">
        <SectionHeading id="experience-heading">Discography</SectionHeading>
        <ol className="flex flex-col gap-12">
          {experience.map((job) => (
            <li key={job.id} className="grid gap-x-10 gap-y-1 md:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="font-serif text-2xl leading-tight text-(--color-muted) tabular-nums">
                {year(job.start)}–{job.end ? year(job.end) : 'now'}
              </p>
              <div className="measure">
                <h3 className="font-sans text-lg font-semibold">
                  {job.role}, {job.company}
                </h3>
                <ul className="mt-2 flex flex-col gap-1">
                  {job.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
          <li className="grid gap-x-10 gap-y-1 md:grid-cols-[10rem_minmax(0,1fr)]">
            <p className="font-serif text-2xl leading-tight text-(--color-muted) tabular-nums">2019–now</p>
            <div className="measure">
              <h3 className="font-sans text-lg font-semibold">BA Philosophy, Roma Tre University</h3>
              <p className="mt-2">Philosophy of science, philosophy of language, aesthetics.</p>
            </div>
          </li>
        </ol>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="mt-28 scroll-mt-6">
        <SectionHeading id="contact-heading">Contact</SectionHeading>
        <p className="measure text-lg">
          I am looking for a junior frontend or full-stack role. The quickest way to reach me is email.
        </p>
        <p className="mt-4 font-serif text-[clamp(1.375rem,4vw,2rem)] break-words">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </section>
    </>
  )
}
