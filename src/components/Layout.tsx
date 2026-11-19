import { Link, Outlet, useMatch } from 'react-router'
import { site } from '../content/site'
import { ExternalLink } from './ExternalLink'
import { ScrollManager } from './ScrollManager'

const year = new Date().getFullYear()
const column = 'mx-auto w-full max-w-5xl px-4 sm:px-8'

export function Layout() {
  // The home page's 3D crate runs edge to edge; every other page keeps the text column.
  const home = useMatch('/')

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only font-sans focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10 focus:bg-(--color-paper) focus:p-2"
      >
        Skip to content
      </a>
      <header className={`${column} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6 font-sans`}>
        <Link to="/" className="font-semibold text-(--color-ink) no-underline">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm">
            <li>
              <Link to="/#organizzatore-spesa">Projects</Link>
            </li>
            <li>
              <Link to="/#side-b">Side B</Link>
            </li>
            <li>
              <Link to="/#experience">Experience</Link>
            </li>
            <li>
              <Link to="/#contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <ScrollManager />
      <main id="main" className={home ? 'grow' : `${column} grow`}>
        <Outlet />
      </main>
      <footer
        className={`${column} flex flex-wrap gap-x-5 gap-y-1 border-t border-(--color-rule) py-8 font-sans text-sm text-(--color-muted) ${
          home ? '' : 'mt-24'
        }`}
      >
        <span>
          © {year} {site.name}
        </span>
        <a href={`mailto:${site.email}`}>Email</a>
        <ExternalLink href={site.github}>GitHub</ExternalLink>
      </footer>
    </div>
  )
}
