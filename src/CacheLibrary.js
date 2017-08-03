const {logger} = require('logger');
const sizeof = require('object-sizeof');
const CacheBase = require('./CacheBase');
const CacheEntry = require('./CacheEntry');

class CacheLibrary extends CacheBase {

  constructor(key, disabled) {
    super(key);

    /**
     * Cache entries.
     * @type {{}}
     */
    this.entries = {};

    /**
     * A small flag to enable/disable globally.
     * @type {boolean}
     * @private
     */
    this._disabled = disabled;

    // Enable the library.
    if (disabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Flushes the cache.
   */
  flush() {
    this.entries = {};
  }

  /**
   * Enable this library.
   */
  enable() {
    this._disabled = false;
    if (this._interval) {
      clearTimeout(this._interval);
    }
    // Add an interval to flush the cache every 10 minutes.
    this._interval = setInterval(() => {
      Object.keys(this.entries).forEach(key => {
        if (this.entries[key] && this.entries[key].expired) {
          delete this.entries[key];
          logger.deepDebug('Cache', `Cache key ${key} deleted`);
        }
      });
    }, 600000);
  }

  /**
   * Disable this cache library.
   */
  disable() {
    this._disabled = true;
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  /**
   * Returns the cache instance.
   * @param {string} key The cache instance.
   * @param {*=} defaultValue The default value.
   * @returns {*}
   */
  get(key, defaultValue) {
    const value = this.entries[key];
    if (value && !value.expired) {
      return this.entries[key].value;
    }
    delete this.entries[key];
    return defaultValue;
  }

  /**
   * Puts a value in the cache.
   * @param {string} key The key of the cache.
   * @param {*} value The value of the cache.
   * @param {number=} expires The number of milliseconds to expire.
   * @returns {CacheEntry}
   */
  add(key, value, expires) {
    this.entries[key] = new CacheEntry(value, expires);
    return this.entries[key];
  }

  /**
   * Remov a key from the cache.
   * @param {string} key The chache key.
   * @returns {boolean}
   */
  remove(key) {
    if (this.entries[key] === undefined) {
      return false;
    }
    delete this.entries[key];
    return true;
  }

  /**
   * Tells if the cache has a certain key.
   * @param {string} key The key
   * @returns {boolean}
   */
  has(key) {
    return !this._disabled &&
      this.entries[key] !== undefined && !this.entries[key].expired;
  }

  /**
   * Check if a key exists and returns it. If not, the second argument
   * will tried to be resolved.
   * @param {string} key The cache key.
   * @param {Function<Promise>} promiseFn The promise that will return a value.
   * @param {number=} expires The timeout number of ms to expire the entry.
   * @returns {*}
   */
  getKeyOrResolve(key, promiseFn, expires) {
    if (this.has(key)) {
      return this.get(key);
    }
    return this.add(key, promiseFn(), expires).value;
  }

  /**
   * Shortcut to the long getKeyOrResolve method.
   * @param {*} args The arguments to pass.
   * @returns {*}
   */
  getOrElse(...args) {
    return this.getKeyOrResolve.apply(this, args);
  }

  /**
   * Returns the keys of the library.
   * @returns {Array}
   */
  get keys() {
    if (!this._disabled) {
      return [];
    }
    return Object.keys(this.entries);
  }

  /**
   * The key of the library.
   * @returns {{}}
   */
  describe() {
    const keys = this._disabled ? [] : Object.keys(this.entries);
    const entries = {};
    for (let entry of keys) {
      entries[entry] = {
        size: sizeof(this.get(entry)),
        flush: `?flush=${this.key}&entry=${entry}`
      };
    }
    return Object.assign(super.describe(), {
      name: this.key,
      entries,
      length: keys.length
    });
  }
}

module.exports = CacheLibrary;
