const Cache = require('./Cache');
/**@type {Cache}*/
let cache;
let library;

describe('Cache', () => {

  beforeEach(() => cache = new Cache());

  it('should start with an empty cache', done => {
    expect(cache).toEqual(jasmine.objectContaining({
      _libraries: {},
      _dictionaries: {}
    }));
    expect(typeof cache.get().expiresMs).toBe('number');
    done();
  });

  describe('lirary tests', () => {

    beforeEach(() => library = cache.getLibrary());

    it('should be able to create a new library on-demand', done => {
      cache.getLibrary('firstLibrary');
      cache.getDictionary('firstDictionary');
      expect(cache.hasLibrary('firstLibrary')).toBe(true);
      expect(cache.hasDictionary('firstDictionary')).toBe(true);
      expect(cache.libraries).toEqual(jasmine.objectContaining({
        firstLibrary: jasmine.any(Object)
      }));
      expect(cache.dictionaries).toEqual(jasmine.objectContaining({
        firstDictionary: jasmine.any(Object)
      }));
      done();
    });

    it('should be able to define a new entry accordingly', done => {
      expect(library.has('someKey')).toBe(false);
      expect(library.get('someKey', 'asdf')).toBe('asdf');
      library.add('someKey', 123);
      expect(library.has('someKey')).toBe(true);
      expect(library.get('someKey')).toBe(123);
      done();
    });

    it('should only create a key when needed', done => {
      library.add('someKey', 'first');
      Promise.all([
        library.getKeyOrResolve('someKey', () => Promise.resolve('second'))
          .then(() => expect(library.get('someKey')).toBe('first')),
        library.getKeyOrResolve('undefKey', () => Promise.resolve('third'))
          .then(() => expect(library.get('undefKey')).toBe('third'))
      ]).then(done);
    });

    it('should be able to expire an entry accordingly', done => {
      library.add('someKey', 'first', 100);
      expect(library.get('someKey')).toBe('first');
      setTimeout(() => {
        expect(library.get('someKey')).toBeUndefined();
        done();
      }, 200);
    });

    it('should disable cache properly', done => {
      expect(library.has('someKey')).toBe(false);
      library.add('someKey', 123);
      expect(library.has('someKey')).toBe(true);
      expect(library.keys).toEqual(['someKey']);
      cache.disable();
      expect(library.has('someKey')).toBe(false);
      expect(library.keys).toEqual([]);
      cache.enable();
      // Promise checks
      library.getKeyOrResolve('a', () => Promise.resolve(1))
        .then(result => expect(result).toBe(1))
        .then(() => library.getKeyOrResolve('a', () => Promise.resolve(2)))
        .then(result => expect(result).toBe(1))
        .then(() => cache.disable())
        .then(result => library.getKeyOrResolve('a', () => Promise.resolve(3)))
        .then(result => expect(result).toBe(3))
        .then(result => library.getKeyOrResolve('a', () => Promise.resolve(4)))
        .then(result => expect(result).toBe(4))
        .then(result => cache.enable())
        .then(() => library.getKeyOrResolve('a', () => Promise.resolve(5)))
        .then(result => expect(result).toBe(4))
        .then(done);
    });

    it('should flush the cache properly', done => {
      const library = cache.getLibrary('flushTest');
      expect(library.has('someKey')).toBe(false);
      library.add('someKey', 123);
      expect(library.has('someKey')).toBe(true);
      library.flush();
      expect(library.has('someKey')).toBe(false);
      expect(cache.hasLibrary('flushTest')).toBe(true);
      cache.flush();
      expect(cache.hasLibrary('flushTest')).toBe(false);
      done();
    });

  });

});
