import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { recordIndex, records } from '../../content/records'
import { site } from '../../content/site'
import { openLayout } from '../crate3d/sheetLayout'
import { RecordDialog } from './RecordDialog'
import type { SheetRect } from './RecordDialog'
import { SleeveGrid } from './SleeveGrid'

// three.js is heavy: it loads only when the 3D crate is actually shown.
const Crate3D = lazy(() => import('../crate3d/Crate3D'))

function canUse3D() {
  if (typeof WebGLRenderingContext === 'undefined') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * The home page: a crate of records. In 3D you hover a record to lift it and read its
 * title, and click to pull it out and open it like a book. Every record is also a plain
 * HTML button (the index), and without WebGL the crate becomes a grid of sleeves.
 */
export function CrateHome() {
  const [use3D, setUse3D] = useState(canUse3D)
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const [sheet, setSheet] = useState<SheetRect | undefined>()
  const container = useRef<HTMLElement>(null)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const total = records.length

  // /#side-b (menu, "Back to the crate") opens that record. State is adjusted during
  // render when the hash changes, rather than in an effect.
  const [seenHash, setSeenHash] = useState('')
  if (hash !== seenHash) {
    setSeenHash(hash)
    const index = recordIndex(decodeURIComponent(hash.slice(1)))
    if (index >= 0) {
      setSelected(index)
      setOpen(index)
    }
  }

  // The notes sheet sits next to the opened 3D record; keep it there on resize.
  useEffect(() => {
    if (!use3D || open === null) return
    const place = () => {
      const box = container.current?.getBoundingClientRect()
      if (!box) return
      const s = openLayout(box.width, box.height).sheet
      setSheet({ left: box.left + s.left, top: box.top + s.top, width: s.width, height: s.height })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [use3D, open])

  const close = () => {
    setOpen(null)
    if (hash) navigate('/', { replace: true })
  }

  const dialog = (
    <RecordDialog
      record={open === null ? null : records[open]}
      number={(open ?? 0) + 1}
      total={total}
      sheet={use3D ? sheet : undefined}
      onClose={close}
    />
  )

  if (!use3D) {
    return (
      <>
        <SleeveGrid onOpen={setOpen} />
        {dialog}
      </>
    )
  }

  const front = records[selected]
  const step = (by: number) => setSelected((i) => (i + by + total) % total)

  return (
    <section ref={container} aria-labelledby="thesis" className="relative h-[max(34rem,calc(100dvh-5.5rem))] overflow-hidden">
      <SceneBoundary onError={() => setUse3D(false)}>
        <Suspense fallback={null}>
          <Crate3D selected={selected} open={open} onSelect={setSelected} onOpen={setOpen} onClose={close} />
        </Suspense>
      </SceneBoundary>

      {/* Text over the scene. Only the controls take pointer events, the rest lets the crate through. */}
      <div
        className={`pointer-events-none absolute inset-0 mx-auto flex max-w-5xl flex-col justify-between px-4 py-4 transition-opacity duration-300 sm:px-8 md:justify-center md:gap-8 ${
          open === null ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="md:max-w-[24rem]">
          <h1 id="thesis" className="font-serif text-xl leading-[1.1] font-medium tracking-[-0.015em] md:text-[clamp(1.75rem,3.2vw,2.5rem)]">
            {site.thesis}
          </h1>
          <p className="mt-2 hidden font-sans text-(--color-muted) md:block">
            {site.name}, {site.role.toLowerCase()} in {site.location}
          </p>
        </div>

        <div className="md:max-w-[24rem]">
          <div aria-live="polite" className="font-sans">
            <p className="text-sm text-(--color-muted) tabular-nums">
              {String(selected + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <h2 className="font-serif text-2xl font-medium md:text-3xl">{front.title}</h2>
            <p className="mt-1 line-clamp-2 font-serif text-(--color-muted)">{front.blurb}</p>
          </div>
          <p className="pointer-events-auto mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm">
            <button type="button" onClick={() => step(-1)} aria-label="Previous record" className="crate-button">
              ←
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next record" className="crate-button">
              →
            </button>
            <button type="button" onClick={() => setOpen(selected)} className="text-(--color-accent) underline underline-offset-4">
              Open this record
            </button>
          </p>
          <p className="mt-2 hidden font-sans text-sm text-(--color-muted) md:block">
            Hover a record to lift it, click to open it.
          </p>

          <nav aria-label="Records in the crate" className="pointer-events-auto mt-6 hidden md:block">
            <ol className="columns-2 gap-x-6 font-sans text-sm leading-7">
              {records.map((record, i) => (
                <li key={record.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    onFocus={() => setSelected(i)}
                    onPointerEnter={() => setSelected(i)}
                    aria-current={i === selected ? 'true' : undefined}
                    className={`text-left ${i === selected ? 'font-semibold text-(--color-ink)' : 'text-(--color-muted)'}`}
                  >
                    <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    {record.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
      {dialog}
    </section>
  )
}

/** If the 3D scene throws (lost WebGL context, old GPU), fall back to the grid. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
