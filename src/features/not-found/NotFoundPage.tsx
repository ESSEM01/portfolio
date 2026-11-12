import { Link } from 'react-router'
import { Argument } from '../../components/Argument'

export function NotFoundPage() {
  return (
    <section className="pt-16">
      <title>Page not found, Stefano Moretti</title>
      <h1 className="mb-8 font-serif text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] font-medium">Page not found</h1>
      <Argument
        label="Page not found"
        argument={{
          premises: ['You followed a link to this address.', 'No page lives at this address.'],
          conclusion: 'The link is wrong or the page has moved.',
        }}
      />
      <p className="mt-8 font-sans">
        <Link to="/">Back to home</Link>
      </p>
    </section>
  )
}
