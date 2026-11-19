// Pure screen maths, kept free of three.js so the page shell can use it without loading the 3D bundle.

export interface OpenLayout {
  /** Side of one page of the opened record, in px. */
  page: number
  /** Screen position of the right page's bottom centre (the record's origin). */
  originX: number
  originY: number
  /** Where the HTML notes sheet goes, relative to the scene container. */
  sheet: { left: number; top: number; width: number; height: number }
}

/**
 * Screen layout of an opened record, shared by the 3D scene and the HTML sheet.
 * Wide: the book on the left, the sheet coming out of the right page.
 * Narrow: the book on top, the sheet below it.
 */
export function openLayout(width: number, height: number): OpenLayout {
  if (width < 768) {
    const page = Math.min((width - 24) / 2, height * 0.24)
    const pageTop = page * 0.5 + 12
    const top = pageTop + page + 16
    return {
      page,
      originX: width / 2 + page / 2,
      originY: pageTop + page,
      sheet: { left: 0, top, width, height: height - top },
    }
  }
  const margin = 32
  const page = Math.min(height * 0.5, (width - margin * 2) * 0.3, 420)
  const pageLeft = margin + page
  const pageTop = Math.max(page * 0.5 + 12, (height - page) / 2)
  const left = pageLeft + page * 0.06
  return {
    page,
    originX: pageLeft + page / 2,
    originY: pageTop + page,
    sheet: { left, top: pageTop, width: Math.min(width - margin - left, 760), height: height - 16 - pageTop },
  }
}
