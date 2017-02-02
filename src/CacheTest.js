describe('Cache', () => {

  const Cache = require('./Cache');
  /**@type {Cache}*/
  let cache;

  beforeEach(() => {
    cache = new Cache();
  });

  it('should start with an empty cache', done => {
    expect(cache).toEqual(jasmine.objectContaining({
      _libraries: {},
      _dictionaries: {}
    }));
    expect(typeof cache.get('firstLibrary').expiresMs).toBe('number');
    done();
  });

  it('should be able to create a new library on-demand', done => {
    cache.getLibrary('firstLibrary');
    expect(cache.libraries).toEqual(jasmine.objectContaining({
      firstLibrary: jasmine.any(Object)
    }));
    done();
  });

  it('should be able to define a new entry accordingly', done => {
    const library = cache.getLibrary('secondLibrary');
    expect(library.has('someKey')).toBe(false);
    expect(library.get('someKey', 'asdf')).toBe('asdf');
    library.add('someKey', false);
    expect(library.has('someKey')).toBe(true);
    expect(library.get('someKey')).toBe(false);
    expect();
    done();
  });

  it('should only create a key when needed', done => {
    const library = cache.getLibrary('thirdLibrary');
    library.add('someKey', 'first');
    Promise.all([
      library.getIf('someKey', () => Promise.resolve('second'))
        .then(() => expect(library.get('someKey')).toBe('first')),
      library.getIf('undefKey', () => Promise.resolve('third'))
        .then(() => expect(library.get('undefKey')).toBe('third'))
    ]).then(done);
  });

  it('should be able to expire an entry accordingly', done => {
    const library = cache.getLibrary('secondLibrary');
    library.add('someKey', 'first', 100);
    expect(library.get('someKey')).toBe('first');
    setTimeout(() => {
      expect(library.get('someKey')).toBeUndefined();
      done();
    }, 200);
  });

});

