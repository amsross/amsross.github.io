---
layout: series
title: 'Fantasy Birds: Bluebird'
description: 'Fantasy Birds: Bluebird'
series: "Fantasy Birds"
tags: 
  - javascript
  - combinators
  - functional
---

## Bluebird

[`bluebird`](https://github.com/fantasyland/fantasy-birds#bluebird--b---c---a---b---a---c) (aka B combinator), which is written:

{% highlight javascript %}
(b -> c) -> (a -> b) -> a -> c
// f => g => a => c => f(g(a)))
{% endhighlight %}

The bluebird combinator represents function composition, which is probably the most basic (and maybe important, too) concept in functional (composable) programming. I'm not going to try to define and deep-dive into what function composition is here, but the core idea here is that you have two functions, one (`f`) which takes an `a` and returns a `b`, and one (`g`) which takes a `b` and returns a `c`, where `f` accepts as its argument the result of `g`. As you may be able to see, the value you pass in (`a`) flows through the functions from right to left.

In a totally imperative form, it could look like this:

{% highlight javascript %}
const someMath = a => {
  const fn1 = a => a+1
  const fn2 = b => Math.floor(b/2)
  const output1 = fn1(a)
  const output2 = fn2(output1)
  return output2
}
{% endhighlight %}

Do you see how `fn2` depends on the output of `fn1`? I'm sure this is a familiar pattern. So what is wrong with this? Not really anything, I guess, but in taking `a`, adding 1, and then dividing by 2, (basic math, right?) you've introduced one of the most difficult things in programming: Naming Things. Take this example as an alternative:

{% highlight javascript %}
const someMath = a => bluebird(b => Math.floor(b/2))(a => a+1)(a)
{% endhighlight %}

How many intermediary values? None.

## Bluebird_

[`bluebird_`](https://github.com/fantasyland/fantasy-birds#bluebird_--a---c---d---a---b---c---b---d) (aka B` combinator), which is written:

{% highlight javascript %}
(a -> c -> d) -> a -> (b -> c) -> b -> d
// f => a => g => b) => f(a)(g(b)))
{% endhighlight %}

The `bluebird_` combinator is a slightly more abstract version of `bluebird` in that it still performs function composition, but the outer function (`f`) is a higher-order function in that it returns a function. This can be useful (among many other situations) when you _really_ want to avoid intermediary values. Consider the following examples:

{% highlight javascript %}
const bluebird = (b -> c) -> (a -> b) -> a -> c
const add = a => b => a+b
const addN = n => add(n)
const add10 = addN(10)
["1", "2", "3"].map(bluebird(add10)(parseInt))
// [ "11", "12", "13" ]
{% endhighlight %}

{% highlight javascript %}
const bluebird_ = (a -> c -> d) -> a -> (b -> c) -> b -> d
const add = a => b => a+b
const addN = n => add(n)
["1", "2", "3"].map(bluebird(addN)(10)(parseInt))
// [ "11", "12", "13" ]
{% endhighlight %}

Granted there are no big wins here, but I guess this is a pretty contrived example. The key here, though, is that you can avoid declaring these intermediary values (the function `add10` here) that don't necessarily have any value on their own.

### Try It On Your Own

Can you use `bluebird` to compose a higher-order function? ie: A function that accepts a function and/or returns a function?

Since both `bluebird` and `bluebird_` compose together only two functions, can you make a function using either or both to create a composition of more than two functions? How about an odd number of functions vs and even number?

Next up: **bluebird**
