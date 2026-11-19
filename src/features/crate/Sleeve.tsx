import { photoSrcSet } from '../../content/photos'
import type { CrateRecord } from '../../content/records'
import { site } from '../../content/site'

/** The record sleeve: a photo with a label band, or a typographic cover. */
export function Sleeve({ record, number, total }: { record: CrateRecord; number: number; total: number }) {
  const { color, ink, photo, screenshot } = record.cover
  const style = { backgroundColor: color, color: ink }

  if (screenshot) {
    // Same proportions as the 3D cover: a title band on top, the screenshot under it.
    return (
      <div className="@container flex h-full w-full flex-col overflow-hidden" style={style}>
        <div className="flex h-[24.4%] shrink-0 flex-col justify-between px-[7cqi] pt-[5cqi] pb-[3cqi]">
          <span className="flex items-baseline justify-between font-sans text-[3.4cqi] tabular-nums opacity-80">
            <span>{site.name}</span>
            <span>
              {number}/{total}
            </span>
          </span>
          <span className="font-serif text-[8cqi] leading-none font-medium tracking-[-0.015em] whitespace-nowrap">
            {record.title}
          </span>
        </div>
        <img
          src={screenshot}
          width={1024}
          height={774}
          alt=""
          loading="lazy"
          draggable={false}
          className="min-h-0 w-full grow object-cover object-top"
        />
      </div>
    )
  }

  if (photo) {
    return (
      <div className="relative h-full w-full overflow-hidden" style={style}>
        <img
          src={`/photos/${photo.name}-1280.webp`}
          srcSet={photoSrcSet(photo)}
          sizes="(min-width: 768px) 30rem, 80vw"
          width={photo.width}
          height={photo.height}
          alt=""
          draggable={false}
          className="h-full w-full object-cover object-[46%_40%]"
        />
        <span className="absolute right-0 bottom-0 left-0 flex items-baseline justify-between gap-4 px-5 py-3" style={style}>
          <span className="font-sans text-sm font-semibold">{site.name}</span>
          <span className="font-serif text-lg italic">{record.title}</span>
        </span>
      </div>
    )
  }

  return (
    // Type is sized in container units (cqi) so the cover scales as one piece,
    // from the small sleeve in the dialog to the big one in the crate.
    <div className="@container h-full w-full overflow-hidden" style={style}>
      <div className="flex h-full flex-col justify-between p-[7cqi]">
        <span className="flex items-baseline justify-between font-sans text-[3.6cqi] tabular-nums opacity-80">
          <span>{site.name}</span>
          <span>
            {number}/{total}
          </span>
        </span>
        <span className="font-serif text-[9.5cqi] leading-[1.05] font-medium tracking-[-0.015em]">
          {/* A zero-width space after the dot lets "marcomusacchio.com" wrap at ".com". */}
          {record.title.replace('.', '.​')}
        </span>
        <span className="font-sans text-[3.6cqi] opacity-80">
          {record.project ? record.project.stack.slice(0, 3).join(', ') : record.blurb}
        </span>
      </div>
    </div>
  )
}

/** The black disc that slides out of the sleeve when a record is opened. */
export function Disc({ record }: { record: CrateRecord }) {
  return (
    <span aria-hidden="true" className="disc block aspect-square w-full rounded-full">
      <span
        className="absolute inset-[33%] flex items-center justify-center rounded-full p-2 text-center font-sans text-[0.6rem] leading-tight font-semibold"
        style={{ backgroundColor: record.cover.color, color: record.cover.ink }}
      >
        {record.title}
      </span>
      <span className="absolute inset-[48.5%] rounded-full bg-(--color-paper)" />
    </span>
  )
}
