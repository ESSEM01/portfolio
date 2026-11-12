import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Client-side routing doesn't scroll on its own: go to the #section when the URL
 * has one (e.g. "Back to the tracklist"), otherwise to the top of the new page.
 * Smoothness comes from `scroll-behavior` in index.css, which respects reduced motion.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    // Wait a frame so the target section exists after a route change.
    const id = requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, hash])

  return null
}
