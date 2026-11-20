import { useEffect, useRef } from 'react'
import { ExternalLink } from '../../components/ExternalLink'
import type { CrateRecord } from '../../content/records'
import { RecordContent } from './RecordContent'
import { Disc, Sleeve } from './Sleeve'

export interface SheetRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * An opened record's notes. Native <dialog>: focus stays inside, Esc closes it, and the
 * page behind is inert.
 * - With `sheet` (3D crate): a paper insert placed next to the opened 3D record.
 * - Without (grid fallback): a full panel with its own sleeve and disc.
 */
export function RecordDialog({
  record,
  number,
  total,
  sheet,
  ready = true,
  onClose,
}: {
  record: CrateRecord | null
  number: number
  total: number
  sheet?: SheetRect
  /** Sheet only: false while the 3D record is still coming forward and opening. */
  ready?: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (record && !dialog.open) dialog.showModal()
    if (!record && dialog.open) dialog.close()
  }, [record])

  return (
    <dialog
      ref={ref}
      aria-labelledby="record-title"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (e.target === e.currentTarget) onClose()
      }}
      style={sheet ? { ...sheet, right: 'auto', bottom: 'auto' } : undefined}
      className={
        sheet
          ? `record-dialog record-sheet ${ready ? 'is-ready' : ''} fixed m-0 max-h-none max-w-none bg-transparent p-0 text-(--color-ink) backdrop:bg-transparent`
          : 'record-dialog m-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-(--color-ink) backdrop:bg-black/60 sm:h-[min(92dvh,60rem)] sm:w-[min(94vw,62rem)]'
      }
    >
      {record && (
        <div
          className={`h-full overflow-y-auto bg-(--color-paper) px-4 pt-4 pb-12 sm:px-10 ${
            sheet ? 'shadow-[0_20px_60px_-20px_rgb(0_0_0/0.45)] ring-1 ring-(--color-rule) sm:pt-6' : 'sm:pt-8'
          }`}
        >
          <div className="flex items-center justify-between font-sans text-sm text-(--color-muted) tabular-nums">
            <span>
              Record {number} of {total}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-(--color-ink) hover:bg-(--color-rule)"
              aria-label="Close record"
            >
              Close ✕
            </button>
          </div>

          {!sheet && (
            // Sleeve on the left, the disc sliding out to the right of it.
            <div className="relative mt-6 mb-10 w-[min(62vw,19rem)]">
              <div className="disc-slot absolute top-[3%] left-[6%] w-[94%]">
                <div className="disc-spin relative">
                  <Disc record={record} />
                </div>
              </div>
              <div className="relative aspect-square shadow-[0_18px_40px_-18px_rgb(0_0_0/0.5)]">
                <Sleeve record={record} number={number} total={total} />
              </div>
            </div>
          )}

          <h2
            id="record-title"
            className={`font-serif leading-[1.1] font-medium tracking-[-0.015em] ${
              sheet ? 'mt-4 text-[clamp(1.75rem,4vw,2.5rem)]' : 'text-[clamp(2rem,5vw,3rem)]'
            }`}
          >
            {record.title}
          </h2>
          <div className="record-notes mt-6">
            <RecordContent record={record} />
            <CoverCredit record={record} />
          </div>
        </div>
      )}
    </dialog>
  )
}

/** Who took the photo on this record's cover, when it isn't a screenshot. */
function CoverCredit({ record }: { record: CrateRecord }) {
  const { credit, photo } = record.cover
  if (!credit && !photo) return null
  return (
    <p className="mt-10 font-sans text-xs text-(--color-muted)">
      Cover photo by{' '}
      {credit ? (
        <>
          <ExternalLink href={credit.href}>{credit.author}</ExternalLink>, {credit.licence}, via Wikimedia Commons
        </>
      ) : (
        <ExternalLink href={photo!.credit.href}>{photo!.credit.name}</ExternalLink>
      )}
      .
    </p>
  )
}
