---
layout: series
title: 'Fantasy Birds: Becard'
description: 'Fantasy Birds: Becard'
series: "Fantasy Birds"
tags: 
  - javascript
  - combinators
  - functional
  - haskell
  - lambda
---

## Becard

Next up is the [`becard`](https://github.com/fantasyland/fantasy-birds#becard--c---d---b---c---a---b---a---d) (aka B3 combinator or function composition), which is written:

{% highlight javascript %}
(c -> d) -> (b -> c) -> (a -> b) -> a -> d
// f => g => h => a => f(g(h(a)))
{% endhighlight %}

This is a good one for accessing data deep in a nested structure. For this example I'm going to use [ramda](http://ramdajs.com/), "a practical functional library for Javascript programmers." Underscore or lodash could just as well be substituted here, but for some methods the arguments will need to be flipped to achieve the kind of terseness used here, so I'm just going to skip that.

In this example, I've got an array of `teams`, each with an array of `players`, each with a property `playerId`. I just want to get a list of the `playerId` property values:

{% highlight javascript %}
const R = require("ramda");
const teams = [{
  teamId: 1,
  players: [{
    name: "John",
    playerId: 1
  }, {
    name: "Steve",
    playerId: 2
  }]
}, {
  teamId: 2,
  players: [{
    name: "Bob",
    playerId: 3
  }, {
    name: "Jim",
    playerId: 4
  }, {
    name: "Jim",
    playerId: 4
  }]
}];
const becard = f => g => h => a => f(g(h(a)));
//               becard(       c -> d      )(  b -> c )(      a -> b      )
const idFinder = becard(R.pluck("playerId"))(R.flatten)(R.pluck("players"));
//          idFinder(  a  )
playerIds = idFinder(teams);
// [ 1, 2, 3, 4, 4 ]
{% endhighlight %}

Breakdown: `teams` is an array of objects. We pass this first to `h` (`R.pluck("players")`), which return the values of each object's `players` property. Because these values are arrays, the return value after `h` has been called is an array of array, each of wich contains many `player` objects. To operate on each of these values individually in `f` (`R.pluck("playerId")`), we then pass this array of arrays to `R.flatten` which flattens those arrays of values into a single array of values. After `g` has been called, we have a single array which contains the `player` objects for both teams. This value is then passed to `f` (`R.pluck("playerId")`), which returns only the values of each `playerId` property from each `player` object.

Let's see what this would look like in long form over time:

{% highlight javascript %}
const arraysOfPlayers = R.pluck("players")(teams);
// [
//   [{
//     name: "John",
//     playerId: 1
//   }, {
//     name: "Steve",
//     playerId: 2
//   }],
//   [{
//     name: "Bob",
//     playerId: 3
//   }, {
//     name: "Jim",
//     playerId: 4
//   }, {
//     name: "Jim",
//     playerId: 4
//   }]
// ]
const arrayOfPlayers = R.flatten(arraysOfPlayers);
// [
//   {
//     name: "John",
//     playerId: 1
//   }, {
//     name: "Steve",
//     playerId: 2
//   }, {
//     name: "Bob",
//     playerId: 3
//   }, {
//     name: "Jim",
//     playerId: 4
//   }, {
//     name: "Jim",
//     playerId: 4
//   }
// ]
const arrayOfPlayerIds = R.pluck("playerId")(arrayOfPlayers);
// [ 1, 2, 3, 4, 4 ]
{% endhighlight %}

To do this without using becard, we could use ramda's [`R.compose`](http://ramdajs.org/docs/#compose) method. If becard is the B _3_ combinator because it takes _3_ functions as arguments, `R.compose` is a B _n_ because it takes _n_ functions as arguments:

{% highlight javascript %}
const idFinder = R.compose(R.pluck("playerId"), R.flatten, R.pluck("players"));
playerIds = idFinder(teams);
// [ 1, 2, 3, 4, 4 ]
{% endhighlight %}

I use the `R.compose` approach with some frequency because it allows me to pass as many functions as arguments as I want. If we wanted to achieve this with the becard combinator, we would need to nest our becards and fill in any function arguments we don't need with some placeholder that won't effect our return value such as the `I` combinator (`R.identity` here), which I'll discuss in a later post:

{% highlight javascript %}
const idFinder = becard(R.pluck("playerId"), R.flatten, R.pluck("players"));
const uniqueIdFinder = becard(R.identity, R.uniq, idFinder);
playerIds = idFinder(teams);
// [ 1, 2, 3, 4, 4 ]
playerIds = uniqueIdFinder(teams);
// [ 1, 2, 3, 4 ]
{% endhighlight %}

Or we could just nest the function calls directly:

{% highlight javascript %}
playerIds = R.pluck("playerId", R.flatten( R.pluck("players", teams)));
// [ 1, 2, 3, 4, 4 ]
{% endhighlight %}

But that last version with the function calls nested within one another should be avoided at all costs. Writing code like that is not only uglier, but also harder to understand and harder to refactor later.

Next up: [**blackbird**]({% post_url 2016-10-10-fantasy-birds-blackbird %})
