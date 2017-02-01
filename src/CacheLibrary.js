const sizeof = require('object-sizeof');
const CacheBase = require('./CacheBase');

class CacheEntry {

  /**
   * Sets the value of the entry and the expiration.
   * @param value
   * @param expires
   */
  constructor(value, expires) {
    this.value = value;
    this.expires = new Date().getTime() + (expires || 2.628e+9);
  }

  /**
   * Checks if the entry is expired.
   * @returns {boolean}
   */
  get expired() {
    return new Date().getTime() > this.expires;
  }
}

class CacheLibrary extends CacheBase {

  constructor(key) {
    super(key);

    /**
     * Cache entries.
     * @type {{}}
     */
    this.entries = {};

    /**
     * Add an interval to flush the cache every 10 minutes.
     */
    setInterval(() => {
      Object.keys(this.entries).forEach(key => this.get(key));
      logger.debug({title: 'Cache', message: `Cache flushed on ${key}`});
    }, 600000);

  }

  /**
   * Returns the cache instance.
   * @param {string} key The cache instance.
   * @returns {*}
   */
  get(key) {
    const value = this.entries[key];
    if (value && !value.expired) {
      return this.entries[key].value;
    }
    delete this.entries[key];
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
    return this.entries[key] !== undefined;
  }

  /**
   * Check if a key exists and send it or resolve the
   * promise and save it to the cache.
   * @param {string} key The cache key.
   * @param {Function<Promise>} promiseFn The promise that will return a value.
   */
  getIf(key, promiseFn) {
    if (this.has(key)) {
      return Promise.resolve(this.get(key));
    }
    return promiseFn()
      .then(data => this.add(key, data).value);
  }

  /**
   * Returns the keys of the library.
   * @returns {Array}
   */
  get keys() {
    return Object.keys(this.entries);
  }

  /**
   * The key of the library.
   * @returns {{}}
   */
  describe() {
    const keys = Object.keys(this.entries);
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
