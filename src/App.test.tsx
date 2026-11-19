import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from './App'
import { sideBPhotos } from './content/photos'
import { projects } from './content/projects'
import { records } from './content/records'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

async function openRecord(title: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: new RegExp(`: ${escape(title)}$`) }))
  return screen.getByRole('dialog', { name: title })
}

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// jsdom has no WebGL, so these tests run against the grid of sleeves: the same records
// and notes dialog the 3D crate uses. The 3D scene itself is checked in the browser.
describe('crate', () => {
  it('opens the record named in the URL hash', () => {
    renderAt('/#contact')
    expect(screen.getByRole('dialog', { name: 'Contact' })).toBeInTheDocument()
  })

  it('closes an open record from its close button', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const dialog = await openRecord(records[0].title)
    await user.click(within(dialog).getByRole('button', { name: 'Close record' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows every sleeve as a button', () => {
    renderAt('/')
    for (const [i, record] of records.entries()) {
      expect(screen.getByRole('button', { name: `Open record ${i + 1}: ${record.title}` })).toBeInTheDocument()
    }
  })

  it.each(projects.map((p) => [p.title, p]))('opens %s with its argument and links', async (title, project) => {
    renderAt('/')
    const dialog = await openRecord(title)
    expect(within(dialog).getByText(project.argument.conclusion)).toBeInTheDocument()
    for (const link of project.links) {
      const a = within(dialog).getByRole('link', { name: link.label })
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
    }
    if (project.caseStudy) {
      expect(within(dialog).getByRole('link', { name: 'Read the liner notes' })).toHaveAttribute('href', `/work/${project.slug}`)
    }
  })

  it('opens Side B with a credit under every photo', async () => {
    renderAt('/')
    const dialog = await openRecord('Side B: freestyle')
    const figures = dialog.querySelectorAll('figure')
    expect(figures.length).toBe(sideBPhotos.length)
    for (const figure of figures) {
      expect(figure.querySelector('img')?.getAttribute('alt')).toBeTruthy()
      expect(figure.querySelector('figcaption')).toHaveTextContent(/Photo by .*@/)
    }
  })

  it('never shows a phone number in any record', async () => {
    const { container } = renderAt('/')
    for (const record of records) {
      const dialog = await openRecord(record.title)
      expect(dialog.textContent).not.toMatch(/\+?39\s?3\d{2}/)
      await userEvent.setup().click(within(dialog).getByRole('button', { name: 'Close record' }))
    }
    expect(container.textContent).not.toMatch(/\+?39\s?3\d{2}/)
  })
})

describe('case study routes', () => {
  const withCaseStudy = projects.filter((p) => p.caseStudy)

  it.each(withCaseStudy.map((p) => [p.slug, p.title]))('/work/%s renders its case study', (slug, title) => {
    renderAt(`/work/${slug}`)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Decisions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the crate' })).toHaveAttribute('href', `/#${slug}`)
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
