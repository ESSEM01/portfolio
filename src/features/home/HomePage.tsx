import { ExternalLink } from '../../components/ExternalLink'
import { experience } from '../../content/experience'
import { projects } from '../../content/projects'
import { site } from '../../content/site'
import { skillGroups } from '../../content/skills'
import { ProjectCard } from '../work/ProjectCard'

function formatMonth(ym: string) {
  const [year, month] = ym.split('-').map(Number)
  return new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// Section layout is a skeleton; visual design comes in the design phase.
export function HomePage() {
  const featured = projects.filter((p) => p.featured)
  const others = projects.filter((p) => !p.featured)

  return (
    <>
      <section aria-labelledby="hero" className="py-12">
        <h1 id="hero" className="text-4xl font-bold">
          {site.name}
        </h1>
        <p className="mt-2 text-lg">
          {site.role} · {site.location}
        </p>
        <p className="mt-4 max-w-prose">{site.intro}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-(--color-accent)">
          <a href="#work">View work</a>
          <ExternalLink href={site.github}>GitHub</ExternalLink>
          <a href={site.cvPath} download>
            Download CV
          </a>
        </div>
      </section>

      <section id="work" aria-labelledby="work-heading" className="py-8">
        <h2 id="work-heading" className="text-2xl font-semibold">
          Selected work
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {others.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <section aria-labelledby="skills-heading" className="py-8">
        <h2 id="skills-heading" className="text-2xl font-semibold">
          Skills
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <h3 className="font-semibold">{group.label}</h3>
              <ul className="mt-2">
                {group.skills.map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="experience" aria-labelledby="experience-heading" className="py-8">
        <h2 id="experience-heading" className="text-2xl font-semibold">
          Experience
        </h2>
        <ol className="mt-4 flex flex-col gap-6">
          {experience.map((job) => (
            <li key={job.id}>
              <h3 className="font-semibold">
                {job.role}, {job.company}
              </h3>
              <p className="text-sm text-(--color-muted)">
                {formatMonth(job.start)} – {job.end ? formatMonth(job.end) : 'Present'} · {job.location}
              </p>
              <ul className="mt-2 list-disc pl-5">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="py-8">
        <h2 id="contact-heading" className="text-2xl font-semibold">
          Contact
        </h2>
        <p className="mt-2">
          Open to junior frontend and full-stack roles.{' '}
          <a href={`mailto:${site.email}`} className="text-(--color-accent)">
            {site.email}
          </a>
        </p>
      </section>
    </>
  )
}
