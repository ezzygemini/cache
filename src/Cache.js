const {logger} = require('ezzy-logger');
const CacheDictionary = require('./CacheDictionary');
const CacheLibrary = require('./CacheLibrary');
let defaultInstance;

class Cache {

  constructor() {

    /**
     * The cached libraries.
     * @type {{string:CacheLibrary}}
     * @private
     */
    this._libraries = {};

    /**
     * The cached libraries.
     * @type {{string:CacheDictionary}}
     * @private
     */
    this._dictionaries = {};

    /**
     * The cache timestamp.
     * @type {number}
     * @private
     */
    this._timestamp = new Date().getTime();

    /**
     * Check to disable any cache.
     * @type {boolean}
     * @private
     */
    this._disabled = false;

    // Enable the cache.
    this.enable();
  }

  /**
   * Default instantiator.
   * @returns {Cache}
   */
  static get cache() {
    if (!defaultInstance) {
      defaultInstance = new Cache();
    }
    return defaultInstance;
  }

  /**
   * Obtains the timestamp of the cache.
   * @returns {Date|number}
   * @constructor
   */
  get TS() {
    return this._timestamp;
  }

  /**
   * Sets a new timestamp.
   * @param {Date|number} date The new date.
   * @constructor
   */
  set TS(date) {
    this._timestamp = date || new Date().getTime();
  }

  /**
   * Gets a cache key.
   * @param {string} key The cache library.
   * @returns {CacheLibrary|CacheDictionary}
   */
  get(key) {
    return this.getLibrary(key) || this.getDictionary(key);
  }

  /**
   * Small TS function
   * @returns {number}
   * @private
   */
  static get _now() {
    return new Date().getTime();
  }

  /**
   * Small comparison function.
   * @param {CacheBase} lib The library to check.
   * @returns {boolean}
   * @private
   */
  static _isExpired(lib) {
    return Cache._now > lib.expiresMs;
  }

  /**
   * Flushes the cache.
   */
  flush() {
    this._libraries = {};
    this._dictionaries = {};
  }

  /**
   * Enable cache.
   */
  enable() {
    this._disabled = false;
    if (this._interval) {
      clearInterval(this._interval);
    }
    for (let lib in this._libraries) {
      if (this._libraries.hasOwnProperty(lib)) {
        this._libraries[lib].enable();
      }
    }
    // Set an interval to flush the libraries at least every 24 hours.
    this._interval = setInterval(() => {
      Object.keys(this._libraries).forEach(key => this.getLibrary(key));
      Object.keys(this._dictionaries).forEach(key => this.getLibrary(key));
      logger.deepDebug('Cache', `Cache flushed on all libraries`);
    }, 8.64e+7);
  }

  /**
   * Disable any cache.
   */
  disable() {
    this._disabled = true;
    if (this._interval) {
      clearInterval(this._interval);
    }
    for (let lib in this._libraries) {
      if (this._libraries.hasOwnProperty(lib)) {
        this._libraries[lib].disable();
      }
    }
  }

  /**
   * Obtains a cache library.
   * @param {string} key The library key.
   * @returns {CacheLibrary}
   */
  getLibrary(key = 'defaultLibrary') {
    if (!this._libraries[key] || Cache._isExpired(this._libraries[key])) {
      this._libraries[key] = new CacheLibrary(key, this._disabled);
    }
    return this._libraries[key];
  }

  /**
   * Gets a cache dictionary.
   * @param {string} key The library key.
   * @returns {CacheDictionary}
   */
  getDictionary(key = 'defaultDictionary') {
    if (!this._dictionaries[key] || Cache._isExpired(this._dictionaries[key])) {
      this._dictionaries[key] = new CacheDictionary(key);
    }
    return this._dictionaries[key];
  }

  /**
   * Deletes a key in the cache.
   * @param {string} key The cache key.
   * @returns {boolean}
   */
  remove(key) {
    if (this._libraries[key]) {
      delete this._libraries;
      return true;
    }
    if (this._dictionaries[key]) {
      delete this._dictionaries[key];
      return true;
    }
    return false;
  }

  /**
   * Removes a library.
   * @param {string} key The library key.
   * @returns {boolean}
   */
  removeLibrary(key) {
    if (this._libraries[key]) {
      delete this._libraries[key];
      return true;
    }
    return false;
  }

  /**
   * Removes a dictionary.
   * @param {string} key The dictionary key.
   * @returns {boolean}
   */
  removeDictionary(key) {
    if (this._dictionaries[key]) {
      delete this._dictionaries[key];
      return true;
    }
    return false;
  }

  /**
   * Checks if it has a library.
   * @param {string} key The name of the library.
   * @returns {boolean}
   */
  hasLibrary(key) {
    if (this._disabled) {
      return false;
    }
    return !!this._libraries[key];
  }

  /**
   * Checks to see if it has a dictionary.
   * @param {string} key The name of the dictionary.
   * @returns {boolean}
   */
  hasDictionary(key) {
    if (this._disabled) {
      return false;
    }
    return !!this._dictionaries[key];
  }

  /**
   * Returns the keys of the cache.
   * @returns {{string:CacheLibrary}}
   */
  get libraries() {
    return this._libraries;
  }

  /**
   * Returns the dictionaries.
   * @returns {{string:CacheDictionary}}
   */
  get dictionaries() {
    return this._dictionaries;
  }

}

module.exports = Cache;
