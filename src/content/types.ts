export type ProjectKind = 'personal' | 'client'

export interface ProjectLink {
  label: string
  href: string
}

export interface CaseStudy {
  problem: string
  constraints: string[]
  decisions: string[]
  result: string
}

/** A project read as a short proof: what had to hold, and what followed. */
export interface Argument {
  premises: string[]
  conclusion: string
}

export interface Project {
  slug: string
  title: string
  summary: string
  kind: ProjectKind
  featured: boolean
  stack: string[]
  links: ProjectLink[]
  argument: Argument
  /** Only flagship projects get a /work/:slug page. */
  caseStudy?: CaseStudy
}

export interface Job {
  id: string
  company: string
  role: string
  location: string
  start: string
  end: string | null
  highlights: string[]
}

export interface Skill {
  name: string
  /** Project slugs or job ids that prove the skill. Must not be empty. */
  evidence: string[]
}

export interface SkillGroup {
  label: string
  skills: Skill[]
}
