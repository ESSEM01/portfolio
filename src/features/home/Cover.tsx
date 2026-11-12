import { Credit } from '../../components/Credit'
import { coverPhoto, photoSrcSet } from '../../content/photos'
import { site } from '../../content/site'

/**
 * The album cover: a real photo with a label band, like a record sleeve.
 * It slides out once on load (see .cover-reveal in index.css).
 */
export function Cover() {
  return (
    <figure className="w-full max-w-[28rem]">
      <div className="cover-reveal relative aspect-square overflow-hidden bg-(--color-cover)">
        <img
          src={`/photos/${coverPhoto.name}-1280.webp`}
          srcSet={photoSrcSet(coverPhoto)}
          sizes="(min-width: 768px) 28rem, 100vw"
          width={coverPhoto.width}
          height={coverPhoto.height}
          alt={coverPhoto.alt}
          fetchPriority="high"
          className="h-full w-full object-cover object-[46%_40%]"
        />
        <p className="absolute right-0 bottom-0 left-0 flex items-baseline justify-between gap-4 bg-(--color-cover) px-5 py-3 text-(--color-cover-ink)">
          <span className="font-sans font-semibold">{site.name}</span>
          <span className="font-serif text-xl italic">Premises</span>
        </p>
      </div>
      <Credit photo={coverPhoto} className="mt-2" />
    </figure>
  )
}
