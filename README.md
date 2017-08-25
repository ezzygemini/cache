# ezzy-cache
[![Build Status](https://travis-ci.org/ezzygemini/ezzy-cache.svg?branch=master)](https://travis-ci.org/ezzygemini/ezzy-cache)
[![Coverage Status](https://coveralls.io/repos/github/ezzygemini/ezzy-cache/badge.svg?branch=master)](https://coveralls.io/github/ezzygemini/ezzy-cache?branch=master)

A small library to handle a lightweight memory cache.


#### New Cache Library
```javascript
    const Cache = require('ezzy-cache');
    const cache = new Cache();
    
    // or 
    
    const {cache} = require('ezzy-cache');
    
    // or
    
    const cache = require('ezzy-cache').cache;
```

#### Get a Library or a Dictionary

###### Library
A library is simply a scope in where the cache items will be stored.
It's helpful to separate cache libraries so we can flush them separately
and allow them to timeout at different times.

###### Dictionary
A dictionary is a cached trie that reads large amounts of data fast without
much usage. This could be used with autocomplete features.

```javascript
    const {cache} = require('ezzy-cache');

    // If myLibrary doesn't exist, it is created on the fly
    const lib = cache.getLibrary('myLibrary');
    
    // If myLibrary doesn't exist, it is created on the fly
    const lib = cache.getDictionary('myDictionary');
```

#### CacheLibrary Supporting methods

```javascript
    const {cache} = require('ezzy-cache');
    const cacheLibrary = cache.getLibrary('myLib');
```

###### disable()
Disables the library. Keys will return as undefined.

###### enable()
Enables the library after it's been disabled. Keys will be available as usual.

###### flush()
Flushes all the entries.

###### keys
This is a getter method that returns the keys available.

###### add(key, value[, timeout])
Adds a key to the library.

###### remove(key)
Removes a key from the library.

###### getOrElse(key, promiseFn [, timeout])
* In my opinion, the most useful method *
With this method, you can pass a second argument function that will be processed 
ONLY if the key is not resolved. This method returns a promise.
```javascript
    const {cache} = require('ezzy-cache');
    
    let value;
    
    cache.getLibrary('myLib')
      .getOrElse('myKey', () => Promise.resolve('hello'))
      .then(result => {
        // this function will only be invoked every minute
        
        value = result;
        
      }, 60000);
```

### Examples


#### Get a Key

The regular usage of a cache library is to obtain a key from it.
Depending on the timeout, the key will be available or not.

```javascript
    const {cache} = require('ezzy-cache');
    
    let key;
    
    key = cache.getLibrary('myLib').get('myKey');
    // key -> empty
    key = cache.getLibrary('myLib').get('myKey', true);
    // key -> true
    
    cache.getLibrary('myLib').add('myKey', 555);
    key = cache.getLibrary('myLib').get('myKey', true);
    // key -> 555
```


#### Describe

Sometimes you want to output a brief overview description of the cache library, 
for this, it's helpful to invoke the `describe` method.

```javascript
    const {cache} = require('ezzy-cache');
    console.dir(cache.getLibrary('myLib').describe());
```
