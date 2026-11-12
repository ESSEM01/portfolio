import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="py-16">
      <title>Page not found — Stefano Moretti</title>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2">This page does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-(--color-accent)">
        Back to home
      </Link>
    </section>
  )
}
