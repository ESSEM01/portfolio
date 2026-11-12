import '@testing-library/jest-dom/vitest'

// jsdom has no layout or scrolling; ScrollManager calls these on every route change.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}
