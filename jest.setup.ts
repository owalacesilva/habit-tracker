import '@testing-library/jest-dom'

// Node-environment suites (see the `@jest-environment node` docblock) have no DOM.
if (typeof window !== 'undefined') {
  // jsdom does not implement matchMedia, which layout-aware components may read.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
