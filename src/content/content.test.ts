/// <reference types="node" />
import { existsSync } from 'node:fs'
import { experience } from './experience'
import { coverPhoto, sideBPhotos } from './photos'
import { projects } from './projects'
import { skillGroups } from './skills'

describe('photos', () => {
  const all = [coverPhoto, ...sideBPhotos]

  it('has both web sizes on disk for every photo', () => {
    for (const photo of all) {
      for (const width of [640, 1280]) {
        expect(existsSync(`public/photos/${photo.name}-${width}.webp`), `${photo.name}-${width}`).toBe(true)
      }
    }
  })

  it('credits a photographer and describes every photo', () => {
    for (const photo of all) {
      expect(photo.alt.length, photo.name).toBeGreaterThan(20)
      expect(photo.credit.name, photo.name).toMatch(/@/)
      expect(photo.credit.href, photo.name).toMatch(/^https:\/\/www\.instagram\.com\//)
    }
  })
})

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
