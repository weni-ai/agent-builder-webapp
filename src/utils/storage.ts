/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility for managing localStorage with module-specific prefixes
 * to avoid conflicts between Module Federation modules
 */

const MODULE_PREFIX = 'agentBuilder_';

class ModuleStorage {
  private prefix: string;
  private useSession: boolean;

  constructor(prefix = MODULE_PREFIX, useSession = false) {
    this.prefix = prefix;
    this.useSession = useSession;
  }

  /** Get prefixed key */
  _getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /** Set item in localStorage with module prefix */
  setItem(key: string, value: any) {
    const prefixedKey = this._getPrefixedKey(key);
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (this.useSession) {
      window.sessionStorage.setItem(prefixedKey, serializedValue);
    } else {
      window.localStorage.setItem(prefixedKey, serializedValue);
    }
  }

  /** Get item from localStorage with module prefix */
  getItem(key: string, defaultValue = null) {
    const prefixedKey = this._getPrefixedKey(key);
    const value = this.useSession
      ? window.sessionStorage.getItem(prefixedKey)
      : window.localStorage.getItem(prefixedKey);

    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /** Remove item from localStorage with module prefix */
  removeItem(key: string) {
    const prefixedKey = this._getPrefixedKey(key);
    if (this.useSession) {
      window.sessionStorage.removeItem(prefixedKey);
    } else {
      window.localStorage.removeItem(prefixedKey);
    }
  }

  /** Clear all items with this module's prefix */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = this.useSession
        ? window.sessionStorage.key(i)
        : window.localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => {
      if (this.useSession) {
        window.sessionStorage.removeItem(key);
      } else {
        window.localStorage.removeItem(key);
      }
    });
  }
}

export const moduleStorage = new ModuleStorage(MODULE_PREFIX, false);

export { ModuleStorage };
