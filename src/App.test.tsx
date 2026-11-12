import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from './App'
import { sideBPhotos } from './content/photos'
import { projects } from './content/projects'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function trackOf(title: string) {
  return screen.getByRole('heading', { level: 3, name: title }).closest('details')!
}

describe('home page', () => {
  it('lists every project in the tracklist', () => {
    renderAt('/')
    for (const project of projects) {
      expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument()
    }
  })

  it('opens the first track and keeps the others closed', () => {
    renderAt('/')
    const [first, ...rest] = projects
    expect(trackOf(first.title)).toHaveAttribute('open')
    for (const project of rest) {
      expect(trackOf(project.title)).not.toHaveAttribute('open')
    }
  })

  it('opens a track when its title is clicked', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const second = projects[1]
    await user.click(screen.getByRole('heading', { level: 3, name: second.title }))
    expect(trackOf(second.title)).toHaveAttribute('open')
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

  it('shows the Side B freestyle section with a credit under every photo', () => {
    renderAt('/')
    const sideB = screen.getByRole('region', { name: 'Side B: freestyle' })
    const figures = sideB.querySelectorAll('figure')
    expect(figures.length).toBe(sideBPhotos.length)
    for (const figure of figures) {
      expect(figure.querySelector('img')?.getAttribute('alt')).toBeTruthy()
      expect(figure.querySelector('figcaption')).toHaveTextContent(/Photo by .*@/)
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
