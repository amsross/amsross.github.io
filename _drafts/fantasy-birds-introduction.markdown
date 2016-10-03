---
layout: post
title: 'Fantasy Birds: Introduction'
description: 'Fantasy Birds: Introduction'
tags: 
  - combinators
  - functional
  - haskell
  - lambda
---

## Functional Javascript

Like just about everyone else who is writing javascript day to day right now, I'm pretty bullish on functional programming. I'll leave discovering the details of this (conflicting as they may be) as an exercise to the reader. Suffice it to say that I think Javascript lends itself to this approach particularly well and just adding a heaping dose of discipline and bravery on the part of the developer can result in both productivity and joy.

## Fantasy Land

I was recently poking around some of my favorite javascript libraries looking for a place I could put in a little work to reach my 4 PR goal for [hacktoberfest 2016](https://hacktoberfest.digitalocean.com/) when I found [a fairly old issue](https://github.com/caolan/highland/pull/114) on my favorite [FRP](https://en.wikipedia.org/wiki/Functional_reactive_programming) library, [highlandjs](http://highlandjs.org/). The issue pointed to a specification "for algebraic Javascript structures" called [Fantasy Land](https://github.com/fantasyland/fantasy-land). This piqued my interest on so many levels. In short, Fantasy Land is a set of "algebras" or specifications stating concepts that must exist, methods that must exist to support them, and the explicit behavior of those things.

I poked around the [`fantasyland/fantasy-land`](https://github.com/fantasyland/fantasy-land) repository for a while and found loads of specifications of particular use in functional programming, but I was really taken with another repository in the same group, [`fantasyland/fantasy-birds`](https://github.com/fantasyland/fantasy-birds). In this repository is a port of the Haskell package [`Data.Aviary.Birds`](https://hackage.haskell.org/package/data-aviary-0.4.0/docs/Data-Aviary-Birds.html), "every thing for your combinatory needs." It should be noted, of course, that the Hackage page for `Data.Aviary.Birds` explicitly states that "this module is intended for illustration (the type signatures!) rather than utility." Introducing a library full of bird names into your production environment isn't going to win you any friends in the office.

## Reading Lamda Expressions (&lambda;)

At first glance, the "[Ornithology](https://github.com/fantasyland/fantasy-birds#ornithology)" (aka, the docs) looked pretty cryptic to me. I'll admit that until now, I've been only vaguely aware of the fact that a "lambda" is a thing, with no deeper knowledge than that. Maybe touching on what a lambda _actually is_ would help.

[Martin Fowler says](http://martinfowler.com/bliki/Lambda.html): 

> "Essentially a lambda is a block of code that can be passed as an argument to a function call."

[Eric Elliot says](https://gist.github.com/ericelliott/414be9be82128443f6df):

> "In computer science, the most important, defining characteristic of a lambda expression is that it is used as data."

Since functions are "first-class cistizens" in Javascript, lambdas are something we use every day. A very simple way to rationalize this is to think of an anonymous function (lambdas aren't always anonymous, but that's immaterial here), or an arrow function: 

```
  const lengths = [[1],[1,2],[1,2,3]].map(x => x.length);
  // => [1, 2, 3]
```

In this instance, `x => x.length` is a lambda because it is the "data" the map function is consuming.

Apparantly, lambdas are also usually closures, defined in place, and defined using a shorthand notation. For applicability in my own personal use cases for this type of construct, I'm going to largely ignore these last points. [Tweet me](https://twitter.com/@amsross) death threats if you want.

So, how do we read the notation used in `fantasy-birds`? I found a pretty handy set of examples [here](http://www.tutorialsteacher.com/linq/linq-lambda-expression). The gist is, we take a function and

1. drop any `function`s
2. drop any `return`s
3. drop any curly braces
3. drop any unnecessary paranthesis

As an example, we can take a function like `function(a) { return a + 1; }` and turn it into `a -> b` where `b` represents the return value, `a + 1`.  It looks like an ES6 arrow function, doesn't it?

So working backwards from that, we can read `(a -> b) -> a -> b` as `function(f) { return function(a) { return f(a); }; }` where `f` is the function we pass as the first argument (`a -> b`), `a` is the argument we pass to call `f` with, and `b` is the return value of `f(a)`.

From the execution side, we can read this as "To get `b`, pass `f` to a function which returns another function, which then takes `a` and passes it to `f` which returns `b`."

From the declaration side, we can read this as "Return a function which takes `f` and returns a function which takes `a`, then call `f` with `a` as the argument, returning `b`"

If that's not entirely clear, don't sweat it. I may not be doing a great job explaining. I didn't get clarity on any level in this until I played around with some examples on my own. I would encourage doing the same.

## Combinators

OK, so what is a combinator?

[Wikipedia FTW:](https://en.wikipedia.org/wiki/Combinatory_logic)
> A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments.

In Javascript (or anything other language, I suppose), a combinator is a function that takes some other functions and combines their functionality. A simple example is [Underscore's `_.compose` method](underscorejs.org/#compose), which takes one or more functions as arguments and returns a function which accepts a value and passes it to the first function on the right, whose return value is passed to the next function to the left, etc, until all argument functions have been called. The return value is then the result of all of the passed functions **combined**:

```
_.compose(three, two, one)(1) === three(two(one(1)))
```

I use these types of constructs all the time without even realizing it. These pop up in my tests constantly:

```
const allPlayerIds = h.flip(_.pluck)("playerId");
const uniqPlayerIds = _.compose(_.uniq, allPlayerIds);
```

From here I have two handy functions; one that gives me all of the player ids, and one that gives me all of the unique player ids. Both are still accessible, and there is no duplicationg between them. They're bite-sized, they're descriptive, they're testable, and they're reusable.

## Fantasy Birds

Alright, so what about `fantasyland/fantasy-birds`? My actual intent here is to cover some of the real world use cases for applicators. Because fantasy-birds is so whimsical and is a list of combinators that increase in complexity, it seems like the perfect fodder for diving in and figuring out just what use a real programmer could have for a combinator beyond theoretical mathematical applications.

Immediately following this introduction, I'll start at the top of the list and begin working my way down. So up next: **applicator**.
