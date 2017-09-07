class CacheEntry {

  /**
   * Sets the value of the entry and the expiration.
   * @param {*} value The value of the cached entry.
   * @param {number=} expires The expiration of the entry (defaults to 30 days)
   */
  constructor (value, expires = 0) {

    if (expires <= 0) {
      expires = 9.461e+11;
    }

    /**
     * The value of the cache entry.
     * @type {*}
     */
    this.value = value;

    /**
     * Time this entry expires.
     * @type {number}
     */
    this.expires = Date.now() + expires;

  }

  /**
   * Checks if the entry is expired.
   * @returns {boolean}
   */
  get expired () {
    return Date.now() > this.expires;
  }
}

module.exports = CacheEntry;
