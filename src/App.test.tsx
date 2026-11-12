import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from './App'
import { projects } from './content/projects'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('home page', () => {
  it('shows a card for every project in the content', () => {
    renderAt('/')
    for (const project of projects) {
      expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument()
    }
  })

  it('opens every external link in a new tab with noopener', () => {
    const { container } = renderAt('/')
    const external = container.querySelectorAll('a[href^="http"]')
    expect(external.length).toBeGreaterThan(0)
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('does not publish a phone number', () => {
    const { container } = renderAt('/')
    expect(container.textContent).not.toMatch(/\+?39\s?3\d{2}/)
  })
})

describe('case study routes', () => {
  const withCaseStudy = projects.filter((p) => p.caseStudy)

  it.each(withCaseStudy.map((p) => [p.slug, p.title]))('/work/%s renders its case study', (slug, title) => {
    renderAt(`/work/${slug}`)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Decisions' })).toBeInTheDocument()
  })

  it('shows the not-found page for an unknown slug', () => {
    renderAt('/work/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('shows the not-found page for a project without a case study', () => {
    const withoutCaseStudy = projects.find((p) => !p.caseStudy)!
    renderAt(`/work/${withoutCaseStudy.slug}`)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
