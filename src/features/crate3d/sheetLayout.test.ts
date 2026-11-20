import { openLayout } from './sheetLayout'

describe('openLayout (desktop)', () => {
  it.each([1024, 1280, 1440, 1920, 2560])('centres the cover and notes block at %ipx wide', (width) => {
    const { page, originX, sheet } = openLayout(width, 800)
    // The block runs from the open cover's left edge to the sheet's right edge.
    const left = originX - page / 2 - page
    const right = sheet.left + sheet.width
    expect(left).toBeCloseTo(width - right, 5)
    expect(left).toBeGreaterThanOrEqual(32)
  })
})
