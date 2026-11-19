import '@testing-library/jest-dom/vitest'

// jsdom has no layout or scrolling; ScrollManager calls these on every route change.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

// jsdom has no modal dialogs: open/close by attribute and fire `close` like a browser.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}
