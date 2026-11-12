import { Link, Outlet } from 'react-router'
import { site } from '../content/site'
import { ExternalLink } from './ExternalLink'
import { ScrollManager } from './ScrollManager'

const year = new Date().getFullYear()

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-8">
      <a
        href="#main"
        className="sr-only font-sans focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10 focus:bg-(--color-paper) focus:p-2"
      >
        Skip to content
      </a>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6 font-sans">
        <Link to="/" className="font-semibold text-(--color-ink) no-underline">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm">
            <li>
              <Link to="/#work">Side A</Link>
            </li>
            <li>
              <Link to="/#side-b">Side B</Link>
            </li>
            <li>
              <Link to="/#experience">Discography</Link>
            </li>
            <li>
              <Link to="/#contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <ScrollManager />
      <main id="main" className="grow">
        <Outlet />
      </main>
      <footer className="mt-24 flex flex-wrap gap-x-5 gap-y-1 border-t border-(--color-rule) py-8 font-sans text-sm text-(--color-muted)">
        <span>
          © {year} {site.name}
        </span>
        <a href={`mailto:${site.email}`}>Email</a>
        <ExternalLink href={site.github}>GitHub</ExternalLink>
      </footer>
    </div>
  )
}
