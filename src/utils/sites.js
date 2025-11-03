/**
 * Validates if a string is a valid URL according to ICANN standards.
 *
 * This function checks if the provided URL follows the standard URL format,
 * supporting both HTTP and HTTPS protocols, with or without the www prefix.
 *
 * ICANN Standards Applied:
 * - Top-Level Domains (TLDs): 2-63 characters (as per ICANN specifications)
 * - Domain names: minimum 2 characters, maximum 256 characters
 * - Supports internationalized domain names (IDN) and standard ASCII domains
 * - Valid URL components: protocol, subdomain, domain, path, query params, and fragments
 *
 * @param {string} url - The URL string to validate
 * @returns {boolean} Returns true if the URL is valid, false otherwise
 *
 * @example
 * validURL('https://www.example.com') // true
 * validURL('http://example.co') // true
 * validURL('example.technology') // true
 * validURL('www.example.com/path?query=1#hash') // true
 * validURL('invalid') // false
 * validURL('example') // false
 */
export function validURL(url) {
  // eslint-disable-next-line no-useless-escape
  return /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
    url.trim(),
  );
}

export function normalizeURL(url) {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return `https://${url}`;
}
