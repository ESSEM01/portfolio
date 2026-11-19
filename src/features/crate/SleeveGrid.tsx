import { records } from '../../content/records'
import { site } from '../../content/site'
import { Sleeve } from './Sleeve'

/**
 * The crate without 3D: every sleeve in a grid. Shown when WebGL is missing,
 * when the visitor asks for reduced motion, or if the 3D scene fails.
 */
export function SleeveGrid({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <section aria-labelledby="thesis" className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-8">
      <h1 id="thesis" className="max-w-[20ch] font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.015em]">
        {site.thesis}
      </h1>
      <p className="mt-2 font-sans text-(--color-muted)">
        {site.name}, {site.role.toLowerCase()} in {site.location}
      </p>
      <ol className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {records.map((record, i) => (
          <li key={record.id}>
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Open record ${i + 1}: ${record.title}`}
              className="block aspect-square w-full text-left"
            >
              <Sleeve record={record} number={i + 1} total={records.length} />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
