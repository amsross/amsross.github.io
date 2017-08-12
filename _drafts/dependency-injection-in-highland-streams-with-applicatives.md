---
layout: post
title: Dependency Injection in Highland Streams with Applicatives
description: Dependency Injection in Highland Streams with Applicatives
tags: 
  - javascript
  - streams
  - iterables
  - functional
  - fantasy-land
  - applicative
---

## The Problem

We're going to use highland to query the [xkcd](http://xkcd.com) [JSON api](https://xkcd.com/json.html) for some basic information about a comic, write the image in that information to a file, and store the JSON we got back in a datastore. The API and the filesystem are already available, but the datastore may not be, so we'll treat that as our dependency.

The key idea here is that we don't want to procede with any of our first steps (query the API, write the file, etc) until we're sure we can depend on the availability of our subsequent dependencies (the datastore). To do this we will use functions as our stream values! By encapsulating our logic in an uncalled function, we can defer execution of our logic until the time we decide we are ready. [Highland](https://highlandjs.org) makes this particularly easy because, unlike Promises and the like, it is lazily executed. That means that until a stream is actively consumed, none of the steps along the way will be executed.

For example:
```javascript
const h = require('highland')
h([1, 2, 3, 4])
  .map(console.log)
  // nothing is logged!

h([1, 2, 3, 4])
  .map(console.log)
  .done(() => {})
  // 1, 2, 3, and 4 are all logged!
```

## Before

Here's some code that is fairly declarative, but is incredibly ripe for a race condition. This is not good code.

```javascript
const assert = require('assert')
const h = require('highland')
const q = require('request')
const { MongoClient } = require('mongodb')
let db

// query a JSON API and parse the results
const getJSON = url => h.wrapCallback(q.get, (res, body) => body)(url)
  .map(JSON.parse)
// store an object in a mongo collection
const writeToDb => (db, collection) => json => h(push => {
  db.collection(collection).insert(json, (err, data) => {
    if (err) push(err)
    else push(null, json)
    push(null, h.nil)
  })
})

// turn an id into a url
const urlFromId = id => `https://xkcd.com/${id}/info.0.json`

// connect to mongo
MongoClient.connect('mongodb://localhost/xkcd', (err, conn) => {
  // I would never do this, and I hope you wouldn't either
  db = conn
})

h([202, 834, 274, 393])
  .map(urlFromId)                       // build a url to query
  .flatMap(getJSON)                     // make a request to that url
  .flatMap(writeToDb(db, 'favorites'))  // insert response into the db
  .errors(assert.ifError)               // blow up on an error
  .done(() => process.exit(0))          // clean exit
```

What happens if the code begins executing and get's to `flatMap(writeToDb...` before `MongoClient.connect` has set the `db` variable to a valid connection? Nothing good, that's what. What could we do to avoid this? Well, we could wrap all of our code in the callback from `MongoClient.connect` like so:

```javascript
// connect to mongo
MongoClient.connect('mongodb://localhost/xkcd', (err, db) => {
  h([202, 834, 274, 393])
    .map(urlFromId)
    .flatMap(getJSON)
    .flatMap(writeToDb(db, 'favorites'))
    .errors(assert.ifError)
    .done(() => process.exit(0))
  })
```

This code is 1000% safer in the sense that now we can be certain that we have a valid mongo connection to reference with `db`. This solution, however, doesn't scale too well. What happens when we add additional dependencies? Let's say we also need to store this object in redis and then additionally send it off to a Kafka instance somewhere? We'll quickly find ourselves trimming christmas trees:

```javascript
Kafak.connect(kafkaUrl, (err, kafak) => {
  Redis.connect(redisUrl, (err, redis) => {
      MongoClient.connect('mongodb://localhost/xkcd', (err, db) => {
          h([202, 834, 274, 393])
            .map(urlFromId)
            .flatMap(getJSON)
            .flatMap(writeToDb(db, 'favorites'))
            .flatMap(redisStuff(redis)
            .flatMap(kafkaStuff(kafka)
            .errors(assert.ifError)
            .done(() => process.exit(0))
          })
      })
  })
```

## After

Let's use streams to add [back-pressure](http://highlandjs.org/#backpressure). This way we can be sure that no initial steps are executed/consumed until any following steps are executed/consumed. In this case we will make our dependencies out consumers. In order to do this, though, we'll need to make sure that any operation that requires these depencies returns a function awaiting that value. Let's tweak the `writeToDb` function a bit. Rather than applying the `db` param first, we will shift that to the last parameter the function expects:

```javascript
// store an object in a mongo collection
const writeToDb => collection => json => db => h(push => {
  db.collection(collection).insert(json, (err, data) => {
    if (err) push(err)
    else push(null, json)
    push(null, h.nil)
  })
})
```

Now we can pass it our our `collection` and `json` values as we are ready, but we will instead return a function to be applied later. You can see on **line 9** below that the value being passed to `flatMap` is a function. Rather than operate on it immediately, we will return the stream that comes from `connectToDb`, passing each value (there should only be one) to `writeToDbFn`:

```javascript
const connectToDb = h.wrapCallback(MongoClient.connect)

h([202, 834, 274, 393])
  .map(urlFromId)
  .flatMap(getJSON)
  // this returns a function, not a stream
  // so we can use `map` instead of `flatMap`
  .map(writeToDb('favorites'))
  .flatMap(writeToDbFn => connectToDb(myDbUrl)
    .flatMap(db => writeToDbFn(db)))
  .errors(assert.ifError)
  .done(() => process.exit(0))
```

There's still a problem with this approach, though. In this case `connectToDb` is being called each time a value is passed into that `flatMap` on **line 9**. That's 4 connections to the same dabatase, which is much less than ideal. Instead of doing this, we will use highland's [`through`](highlandjs.org/#through) method, which gets executed immediately and only once:

```javascript
h([202, 834, 274, 393])
  .map(urlFromId)
  .flatMap(getJSON)
  .map(writeToDb('favorites'))
  .through(writeToDbFnStream => connectToDb(myDbUrl)
    .flatMap(db => writeToFbFnStream
      .map(writeToDbFn => writeToDbFn(db))))
  .errors(assert.ifError)
  .done(() => process.exit(0))
```

There, much better. Now we return a stream of functions, each of which we will apply the same `db` to!

For bonus point: Do you know what `x.flatMap.map` is? Why, it's (almost) Applicative's `ap` method! If highland had such a method, we could trade this code:

```javascript
  .through(writeToDbFnStream => connectToDb(myDbUrl)
    .flatMap(db => writeToFbFnStream
      .map(writeToDbFn => writeToDbFn(db))))
```

For something along the lines of this:

```javascript
  .through(connectToDb(myDbUrl).ap)
```

I use this pattern with incredibe frequency in production code. I think I smell a [PR](https://github.com/caolan/highland/pulls)!
