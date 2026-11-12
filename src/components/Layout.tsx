import { Link, Outlet } from 'react-router'
import { site } from '../content/site'
import { ExternalLink } from './ExternalLink'

const year = new Date().getFullYear()

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 sm:px-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-(--color-surface) focus:p-2"
      >
        Skip to content
      </a>
      <header className="flex items-center justify-between py-6">
        <Link to="/" className="font-semibold">
          {site.name}
        </Link>
        <nav aria-label="Main" className="flex gap-4 text-sm">
          <Link to="/#work">Work</Link>
          <Link to="/#experience">Experience</Link>
          <Link to="/#contact">Contact</Link>
        </nav>
      </header>
      <main id="main" className="grow">
        <Outlet />
      </main>
      <footer className="flex flex-wrap gap-4 py-8 text-sm text-(--color-muted)">
        <span>© {year} {site.name}</span>
        <ExternalLink href={site.github}>GitHub</ExternalLink>
      </footer>
    </div>
  )
}
