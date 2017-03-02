const Trie = require('node-trie');
const CacheBase = require('./CacheBase');

class CacheDictionary extends CacheBase {

  constructor(key) {
    super(key);
    this.trie = new Trie();
  }

  /**
   * Flushes the trie.
   */
  flush() {
    this.trie = new Trie();
  }

  /**
   * Adds a string to the trie.
   * @param {string} value The value.
   */
  add(value) {
    this.trie.add(value, value);
  }

  /**
   * Gets a list of strings based on trie.
   * @param {string} prefix The prefix of the dictionary.
   */
  get(prefix) {
    return this.trie.get(prefix);
  }

}

module.exports = CacheDictionary;

