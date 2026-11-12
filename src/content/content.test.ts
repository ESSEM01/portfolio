import { experience } from './experience'
import { projects } from './projects'
import { skillGroups } from './skills'

describe('content integrity', () => {
  it('has unique project slugs', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('backs every skill with at least one existing project or job', () => {
    const known = new Set([...projects.map((p) => p.slug), ...experience.map((j) => j.id)])
    for (const group of skillGroups) {
      for (const skill of group.skills) {
        expect(skill.evidence.length, skill.name).toBeGreaterThan(0)
        for (const ref of skill.evidence) {
          expect(known.has(ref), `${skill.name} -> ${ref}`).toBe(true)
        }
      }
    }
  })

  it('uses https for every project link', () => {
    for (const link of projects.flatMap((p) => p.links)) {
      expect(link.href).toMatch(/^https:\/\//)
    }
  })
})
