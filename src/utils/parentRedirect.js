/**
 * Asks the host (weni-webapp) to navigate to a module route.
 * Use openInNew when the target must open outside the current iframe tab.
 *
 * @param {object} options
 * @param {string} options.path - Host path in the form `module:internal/path`
 * @param {Record<string, string>} [options.query] - Query params for the host route
 * @param {boolean} [options.openInNew=false] - Open the route in a new browser tab
 */
export function redirectInParent({ path, query, openInNew = false }) {
  window.parent.postMessage(
    {
      event: 'redirect',
      path,
      ...(query && { query }),
      openInNew,
    },
    '*',
  );
}
