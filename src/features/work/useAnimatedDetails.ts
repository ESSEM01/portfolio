import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

const DURATION = 420
const EASING = 'cubic-bezier(0.22, 0.8, 0.24, 1)'

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Smooth open/close for a native <details>: animates its height and fades the body,
 * instead of the browser's instant show/hide. Without the Web Animations API or with
 * reduced motion, the native toggle runs unchanged.
 *
 * The source of truth is the element itself (`open` plus a data-closing flag while a
 * close is running), so a click in the middle of an animation reverses it cleanly.
 */
export function useAnimatedDetails(defaultOpen: boolean) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const running = useRef<Animation[]>([])
  const [expanded, setExpanded] = useState(defaultOpen)

  function onSummaryClick(event: MouseEvent) {
    const details = detailsRef.current
    const body = bodyRef.current
    if (!details || !body || typeof details.animate !== 'function' || prefersReducedMotion()) {
      return // native toggle; onToggle syncs the icon
    }
    event.preventDefault()

    const closing = details.dataset.closing === 'true'
    const opening = !details.open || closing
    const startHeight = details.getBoundingClientRect().height
    running.current.forEach((a) => a.cancel())
    running.current = []

    setExpanded(opening)
    if (opening) {
      delete details.dataset.closing
      details.open = true
    } else {
      details.dataset.closing = 'true'
    }

    const summaryHeight = details.querySelector('summary')!.getBoundingClientRect().height
    const endHeight = opening ? summaryHeight + body.getBoundingClientRect().height : summaryHeight

    details.style.overflow = 'hidden'
    const height = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: DURATION, easing: EASING },
    )
    const fade = body.animate(
      opening
        ? { opacity: [0, 1], transform: ['translateY(-0.5rem)', 'translateY(0)'] }
        : { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-0.5rem)'] },
      { duration: opening ? DURATION : DURATION * 0.6, easing: EASING, fill: 'both' },
    )
    running.current = [height, fade]

    // Runs once, from whichever fires first. A background tab may never deliver
    // `finish` events, so the timer guarantees the track doesn't stay half-closed.
    const settle = () => {
      if (running.current[0] !== height) return // a newer click took over
      if (!opening) {
        details.open = false
        delete details.dataset.closing
      }
      details.style.overflow = ''
      height.cancel()
      fade.cancel()
      running.current = []
    }
    height.onfinish = settle
    window.setTimeout(settle, DURATION + 60)
  }

  // Keeps the +/− in sync with native toggles (no-JS fallback, find-in-page).
  function onToggle() {
    const details = detailsRef.current
    if (details && running.current.length === 0) setExpanded(details.open)
  }

  return { detailsRef, bodyRef, expanded, onSummaryClick, onToggle }
}
