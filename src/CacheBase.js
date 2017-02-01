const humanize = require('humanize');
const sizeof = require('object-sizeof');

class CacheBase {

  constructor(key) {

    /**
     * The cache key.
     * @type {string}
     */
    this.key = key;

    /**
     * The cache duration.
     * @type {number}
     */
    this.duration = 8.64e+7;

    /**
     * The time created.
     * @type {Date}
     */
    this.created = new Date();

    /**
     * The expiration date in milliseconds.
     * @type {number}
     */
    this.expiresMs = this.created.getTime() + this.duration;

    /**
     * The time it expires.
     * @type {number}
     */
    this.expires = new Date(this.expiresMs);

  }

  /**
   * Returns a description of the library.
   * @returns {{}}
   */
  describe() {
    return {
      expires: humanize.date('Y-m-d H:i:s', this.expires),
      size: sizeof(this),
      flushUrl: `?flush=${this.key}`,
      type: this.constructor.name
    };
  }

}

module.exports = CacheBase;
