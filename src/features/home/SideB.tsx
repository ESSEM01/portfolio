import { Argument } from '../../components/Argument'
import { Credit } from '../../components/Credit'
import { photoSrcSet, sideBPhotos } from '../../content/photos'
import { freestyle } from '../../content/freestyle'

/** The flip side of the record: freestyle. */
export function SideB() {
  const [lead, ...rest] = sideBPhotos
  return (
    <section id="side-b" aria-labelledby="side-b-heading" className="mt-28 scroll-mt-6">
      <h2 id="side-b-heading" className="mb-6 font-serif text-3xl font-medium tracking-[-0.01em]">
        Side B: freestyle
      </h2>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
        <div className="flex flex-col gap-4">
          {freestyle.story.map((line) => (
            <p key={line} className="measure text-lg">
              {line}
            </p>
          ))}
          <div className="mt-4">
            <Argument argument={freestyle.argument} label="Freestyle and code" />
          </div>
        </div>
        <Figure photo={lead} sizes="(min-width: 768px) 30rem, 100vw" />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {rest.map((photo) => (
          <Figure key={photo.name} photo={photo} sizes="(min-width: 640px) 20rem, 100vw" />
        ))}
      </div>
    </section>
  )
}

function Figure({ photo, sizes }: { photo: (typeof sideBPhotos)[number]; sizes: string }) {
  return (
    <figure>
      {/* One 4:3 frame for every photo, so captions line up across the row. */}
      <div className="aspect-[4/3] overflow-hidden bg-(--color-rule)">
        <img
          src={`/photos/${photo.name}-640.webp`}
          srcSet={photoSrcSet(photo)}
          sizes={sizes}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="photo-reveal h-full w-full object-cover"
        />
      </div>
      <Credit photo={photo} className="mt-2" />
    </figure>
  )
}
