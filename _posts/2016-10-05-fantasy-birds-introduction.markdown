---
layout: series
title: 'Fantasy Birds: Introduction'
description: 'Fantasy Birds: Introduction'
series: "Fantasy Birds"
tags: 
  - javascript
  - combinators
  - functional
  - haskell
  - lambda
---

## Fantasy Land

I was recently poking around some of my favorite javascript libraries looking for a place I could put in a little work to reach my 4 PR goal for [hacktoberfest 2016](https://hacktoberfest.digitalocean.com/) when I found [a fairly old issue](https://github.com/caolan/highland/pull/114) on my favorite [FRP](https://en.wikipedia.org/wiki/Functional_reactive_programming) library, [highlandjs](http://highlandjs.org/). The issue pointed to a specification "for algebraic Javascript structures" called [Fantasy Land](https://github.com/fantasyland/fantasy-land). This piqued my interest on so many levels. In short, Fantasy Land is a specification of concepts that naturally expose themselves in programming. It seems like the goal of this organization is to take these abstact constructs (monads, functors, etc), and make standard structure, bahavior, and naming conventions to allow for interoperability between systems and libraries.

I poked around the [`fantasyland/fantasy-land`](https://github.com/fantasyland/fantasy-land) repository for a while and found loads of specifications of particular use in functional programming, but I was really taken with another repository in the same group, [`fantasyland/fantasy-birds`](https://github.com/fantasyland/fantasy-birds). In this repository is a port of the Haskell package [`Data.Aviary.Birds`](https://hackage.haskell.org/package/data-aviary-0.4.0/docs/Data-Aviary-Birds.html), "every thing for your combinatory needs." It should be noted, of course, that the Hackage page for `Data.Aviary.Birds` explicitly states that "this module is intended for illustration (the type signatures!) rather than utility." Because let's face it, introducing a library full of bird names into your production environment isn't going to win you any friends in the office.

## Lamda Expressions (&lambda;)

> [Sanctuary has a nice explanation of reading Haskell-like Hindley-Milner type signatures](https://sanctuary.js.org/#types)

At first glance, the "[Ornithology](https://github.com/fantasyland/fantasy-birds#ornithology)" (aka, the docs) looked pretty cryptic to me. That's because they're lambda expressions. I'll admit that until now, I've been only vaguely aware of the fact that a "lambda" is a thing, with no deeper knowledge than that. Maybe touching on what a lambda _actually is_ would help.

[Martin Fowler says](http://martinfowler.com/bliki/Lambda.html): 

> "Essentially a lambda is a block of code that can be passed as an argument to a function call."

[Eric Elliot says](https://gist.github.com/ericelliott/414be9be82128443f6df):

> "In computer science, the most important, defining characteristic of a lambda expression is that it is used as data."

Since functions are "first-class citizens" in Javascript, lambdas are something we use every day. A very simple way to rationalize this is to think of an anonymous function (lambdas aren't always anonymous, but that's immaterial here), or an arrow function: 

{% highlight javascript %}
const lengths = [[1],[1,2],[1,2,3]].map(x => x.length);
// [1, 2, 3]
{% endhighlight %}

In this instance, `x => x.length` is a lambda. It is the "data" the map function is consuming.

Apparantly, lambdas are also usually closures, defined in place, and defined using a shorthand notation. For applicability in my own personal use cases for this type of construct, I'm going to largely ignore these last points. [Tweet me](https://twitter.com/@amsross) death threats if you want.

## Reading Lamda Expressions

So, how do we read the notation used in `fantasy-birds`? I found a pretty handy set of examples for reading lambda expressions [here](http://www.tutorialsteacher.com/linq/linq-lambda-expression). Let's start out by working backwards from a function declaration we're familiar with and turn it into a lambda expression like we see in the ornithology. The gist is, we take a function and

1. drop any `function`s
2. drop any `return`s
3. drop any semicolons
4. add an arrow between the signature and the block
5. drop any curly braces
6. drop any unnecessary parantheses
7. signify any return values with a variable name
8. signify any passed functions with an expression

As an example, we can rewrite a function like this:

{% highlight javascript %}
function(a) { return a + 1; }

        (a) { return a + 1; } // step 1
        (a) {        a + 1; } // step 2
        (a) {        a + 1  } // step 3
        (a) => {     a + 1  } // step 4
        (a) =>       a + 1    // step 5
         a  =>       a + 1    // step 6
         a  =>       b        // step 7

         a  ->       b
{% endhighlight %}

It looks like an ES6 arrow function, doesn't it?

How about an example that accepts a function as an argument?

{% highlight javascript %}
function(f) { return function(a) { return f(a); }; }

        (f) { return         (a) { return f(a); }; }  // step 1
        (f) {                (a) {        f(a); }; }  // step 2
        (f) {                (a) {        f(a)  }  }  // step 3
        (f) => {             (a) => {     f(a)  }  }  // step 4
        (f) =>               (a) =>       f(a)        // step 5
         f  =>                a  =>       f(a)        // step 6
         f  =>                a  =>         b         // step 7
      (a => b)  =>            a  =>         b         // step 8

      (a -> b)  ->            a  ->         b
{% endhighlight %}

In step 8, we need to consider what `f` is in order to signify it with an appropriate expression. In this case, it's a function which accepts `a` and returns `b`, as seen in its call: `f(a)`, so we express it just like it was an arrow function: `a => a + 1` or `a -> b`.

So let's work backwards from that:

{% highlight javascript %}
      (a -> b)  ->            a  ->         b

      (a => b)  =>            a  =>         b         // step 8
         f  =>                a  =>         b         // step 7
         f  =>                a  =>       f(a)        // step 6
        (f) =>               (a) =>       f(a)        // step 5
        (f) => {             (a) => {     f(a)  }  }  // step 4
        (f) {                (a) {        f(a)  }  }  // step 3
        (f) {                (a) {        f(a); }; }  // step 2
        (f) { return         (a) { return f(a); }; }  // step 1

function(f) { return function(a) { return f(a); }; }
{% endhighlight %}

We can read this as "Declare a function which accepts a function with the signature `(a -> b)` and returns a function which accepts `a` and then calls `(a -> b)` with `a` as the argument, returning `b`"

If that's not entirely clear, don't sweat it. I may not be doing a great job explaining. I didn't get clarity on any level in this until I played around with some examples on my own. I would encourage doing the same.

## Combinators

OK, so what is a combinator?

[Wikipedia FTW:](https://en.wikipedia.org/wiki/Combinatory_logic)

// A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments.

In Javascript (or any other language, I suppose), a combinator is a function that takes some other functions and combines their functionality. A simple example is [Underscore's `_.compose` method](http://underscorejs.org/#compose), which takes one or more functions as arguments and returns a function which accepts a value and passes it to the first function on the right, whose return value is passed to the next function to the left, etc, until all argument functions have been called. The return value is then the result of all of the passed functions **combined**:

{% highlight javascript %}
_.compose(three, two, one)(1) === three(two(one(1)))
{% endhighlight %}

We use these types of constructs all the time without even realizing it. These pop up in my tests constantly:

{% highlight javascript %}
const allPlayerIds = h.flip(_.pluck)("playerId");
const uniqPlayerIds = _.compose(_.uniq, allPlayerIds);
{% endhighlight %}

From here I have two handy functions; one that gives me all of the player ids, and one that gives me all of the unique player ids. Both are still accessible, and there is no duplication between them. They're bite-sized, they're descriptive, they're testable, and they're reusable.

## Fantasy Birds

Alright, so what about `fantasyland/fantasy-birds`? My actual intent here is to cover some of the real world use cases for the combinators in the ornithology over the span of several (or many) separate posts. Because fantasy-birds is so whimsical and is a list of combinators that increase in complexity, it seems like perfect fodder for diving in and figuring out just what use a real programmer could have for a combinator beyond theoretical mathematical  or logical applications.

## Applicator

Ok, let's start with an easy one; [applicator](https://github.com/fantasyland/fantasy-birds#applicator--a---b---a---b) (aka A combinator, or apply), which is written as

{% highlight javascript %}
(a -> b) -> a -> b
// f => a => f(a)
{% endhighlight %}

This is possibly the simplest example of a combinator I can think of beyond an `identity` or `idiot` combinator (`a -> a`). This is also one that I use (in theory) pretty frequently. In my usages, the applicator combinator is perfect for the partial application of a function with a single argument, such as pulling a specific property value from each member in a list:

{% highlight javascript %}
const list = [{
  num: "one",
  title: "cookoo"
}, {
  num: "two",
  title: "lark"
}];
const applicator = f => a => f(a);
const mapper = applicator(a => a.title);

list.map(mapper); // [ 'cookoo', 'lark' ]
{% endhighlight %}

Breakdown: `list` is an array of objects, each of which has a `title` property. If we want to get the values of all of the `title` properties in `list`, we:

1. define `applicator` per the `fantasy-birds` spec
2. define `mapper` by calling `applicator` with our lambda (`a => a.title`) which returns only the `title` property of whatever is passed to it
3. map over our `list`, calling `mapper` with each member in the list

What this would look like over time in long form would be something like:

{% highlight javascript %}
applicator(a => a.title)({num:"one", title: "cookoo"}); // cookoo
applicator(a => a.title)({num:"two", title: "lark"}); // lark
{% endhighlight %}

This is very much an example of value "in theory." Wouldn't it have just made more sense to call `list.map(a => a.title)`? I think so. The root of combinators is combinatory logic, and in that system the use of small pieces to make up a more complete whole may lend itself to restricted purpose concepts like the applicator.

So what applications does the applicator really have? In short, I don't know. Your opinion is welcome, though: [@amsross](https://twitter.com/amsross).

Next up: [**becard**]({% post_url 2016-10-06-fantasy-birds-becard %})
