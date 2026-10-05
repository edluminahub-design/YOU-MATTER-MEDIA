import '@testing-library/jest-dom/vitest'

// jsdom ships no IntersectionObserver. The reveal hook falls back to showing
// content outright when the constructor is missing, which is the behaviour we
// want under test: assertions run against visible content.
//
// jsdom also has no matchMedia, which the motion config reads as "reduced
// motion": navigation happens immediately, with no curtain and no timers, so
// route tests can assert on the new page as soon as a click resolves.
//
// window.scrollTo exists in jsdom but only logs "not implemented"; the router's
// scroll restoration calls it on every navigation.
window.scrollTo = () => {}
