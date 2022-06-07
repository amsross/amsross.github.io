---
layout: series
title: 'Fantasy Birds: Blackbird'
description: 'Fantasy Birds: Blackbird'
series: "Fantasy Birds"
tags: 
  - javascript
  - combinators
  - functional
---

## Blackbird

[`blackbird`](https://github.com/fantasyland/fantasy-birds#blackbird--c---d---a---b---c---a---b---d) (aka B1 combinator), which is written:

```javascript
(c -> d) -> (a -> b -> c) -> a -> b -> c -> d
// f => g => a => b => f(g(a)(b)))
```

I'm going to go a little off the rails on this one. I know this is only the second combinator (third if you include `applicator`), but I think one of the most useful aspects of combinators needs to be shown. To show this, we're going to eschew the notion that only `f` and `g` must be functions and `a` and `b` must be non-function values. This really shouldn't be any great stretch of the imagination since functions in Javascript are "first-class citizens," just like any other value (`Number`, `String`, etc). Keeping that in mind, we can look to passing `f`, `g`, `a`, and `b` as placeholders for functions that we can use to generate a final value (`d`), which may _also_ be a function! I think this is a great technique because you can then dynamically generate functions that follow a similar pattern but produce a different result. This is especially easy when used in conjuction with the `curry`, `compose`, and `partial` methods from your library of choice.

Ok, so how can we use this? I'm going to do my best to use `blackbird` (and even `becard`) to achieve a task that starts in the same place but branches out in it's requirements, which we will compose our functions incrementally to achieve as [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)ly as possible. In this exercise, there will be an array of objects representing data on different birds within an infraclass. Within that data we'll calculate the total weights within each infraclass.

### Here's the data we'll be working with:

```javascript
const data = [
  { infraclass: "Neognathae", weight: 250, height: 110, },
  { infraclass: "Neognathae", weight: 77, height: 67, },
  { infraclass: "Palaeognathae", weight: 24, height: 50, },
  { infraclass: "Palaeognathae", weight: 8, height: 50 }
];
```

If I were writing the same JS I was 5 years ago, I might start in on grouping these pieces of data across a property value with a simple `reduce`:

```javascript
const byClass = data.reduce((memo, num) => {
  memo[num.infraclass] = memo[num.infraclass] || [];
  memo[num.infraclass].push(num);
  return memo;
}, {});
// {
//   "Neognathae": [
//     { infraclass: "Neognathae", weight: 250, height: 110 },
//     { infraclass: "Neognathae", weight: 77, height: 67 }
//   ],
//   "Palaeognathae": [
//     { infraclass: "Palaeognathae", weight: 24, height: 50 },
//     { infraclass: "Palaeognathae", weight: 8, height: 50 }
//   ]
// }
```

Now finding all the weights within a given class and reducing them to a single value is trival:

```javascript
const weightsByClass = Object.keys(byClass).map(infraclass => {
  return byClass[infraclass].map(obj => obj.weight);
});
// [ [ 250, 77 ], [ 24, 8 ] ]
const totalsWeightsByClass = weightsByClass.map(group => {
  return group.reduce((memo, num) => (memo + num), 0);
});
// [ 327, 32 ]
```

This looks fine, no? Let's say we need to group the weights across `height` now instead of `infraclass`. Ideally we would want to look at our last step and do a little rejiggering to have it return what we want. Unfortunately, by going down the path outlined above, we've painted ourselves into a corner. If we want to adjust our ending value, we've got to go all the way back to the beginning and change the output of our initial `reduce` to instead group on this new property. That will break all of the assumptions we've made after that, though, won't it? OK, so we'll have to... _duplicate_ it? Please, no.

### Function Composition To The Rescue

If, instead of declaring the anonymous function we passed to our intial `reduce` as doing one thing only, we can _compose_ a function out of other, smaller functions, which each perform a step along the way:

```javascript
const blackbird = f => g => a => b => f(g(a)(b));
const groupsOfInfraclasses = blackbird(R.values)(R.groupBy)(R.prop("infraclass"));
// aka R.values(R.groupBy(R.prop("infraclass"))(x));
groupsOfInfraclasses(data)
// [[
//   { infraclass: "Neognathae", weight: 250, height: 110 },
//   { infraclass: "Neognathae", weight: 77, height: 67 }
// ], [
//   { infraclass: "Palaeognathae", weight: 24, height: 50 },
//   { infraclass: "Palaeognathae", weight: 8, height: 50 }
// ]]
```

We've done it! Instead of passing some boring `String` as `a`, we passed a function! Unfortunately, we couldn't pass a function that takes an argument as `b` if we have some function like `R.values` as `f`, which only takes one argument and doesn't share it with the functions in it's internal scope, so we left of the final argument `b` to be filled in later. Let's see if we can use `blackbird` again, but this time return a function which hasn't had all of it's arguments fulfilled:

```javascript
const addTogether = blackbird(R.identity)(R.reduce)(R.add)(0);
// aka R.identity(R.reduce(R.add, 0))
// aka R.reduce(R.add, 0)
// aka R.sum
addTogether([ 1, 2 ]);
// 3
```

OK, that was a bit of a stretch, sure, but I think that illustrates the fact that any argument value can be a function as well as the return value. Now let's do the same thing to total the weights we've for each group of data (remember [`becard`](http://www.mattross.io/2016/10/06/fantasy-birds-becard/)?):

```javascript
const becard = R.curry((f, g, h, a) => f(g(h(a))));
const composeTwo = becard(R.identity);
const eachTotalWeight = blackbird(R.map)(composeTwo)(addTogether)(R.pluck("weight"));
// aka R.map(x => addTogether(R.pluck("weight", x)), x)
const totalWeightsByInfraclass = composeTwo(eachTotalWeight)(groupsOfInfraclasses);
totalWeightsByInfraclass(data)
// aka eachTotalWeight(groupsOfInfraclasses(data));
// [ 327, 32 ]
```

So our complete solution is just a chain of composed functions and we pass data in one time and one time only, at the very end:

```javascript
const blackbird = R.curry((f, g, a, b) => f(g(a)(b)));
const groupsOfInfraclasses = blackbird(R.values)(R.groupBy)(R.prop("infraclass"));
const addTogether = R.reduce(R.add, 0);
const composeTwo = becard(R.identity);
const eachTotalWeight = blackbird(R.map)(composeTwo)(addTogether)(R.pluck("weight"));
const totalWeightsByInfraclass = composeTwo(eachTotalWeight)(groupsOfInfraclasses);
totalWeightsByInfraclass( data );
```

Now let's jump back to the beginning where I said we could handle changes at any point without needing to rethink our entire approach. In the code so far we've been totalling the weights of each infraclass. What about the total weights of birds of the same height? Well, conveniently enough we can go back to `groupsOfInfraclasses` and step through the composition of that function to yield multiple dynamically composed functions:

```javascript
const groupsOf = blackbird(R.values)(R.groupBy)
const groupsOfInfraclasses = groupsOf(R.prop("infraclass"));
const groupsOfHeights = groupsOf(R.prop("height"));
```

Ooooh, so DRY! Now we can skip right to the end and start using these functions:

```javascript
const totalWeightAmong = composeTwo(eachTotalWeight);
const totalWeightsByInfraclass = totalWeightAmong(groupsOfInfraclasses);
totalWeightsByInfraclass(data);
// [ 327, 32 ]
const totalWeightsByHeight = totalWeightAmong(groupsOfHeights);
totalWeightsByHeight(data);
// [ 32, 77, 250 ]
```

### Try It On Your Own

What if we wanted to find the total of another property besides `weight`?

Instead of the [sum](http://ramdajs.com/docs/#sum), find the [mean](http://ramdajs.com/docs/#mean) `height` of the data across both `infraclass` and `height`.

Next up: [**bluebird**]({% post_url 2017-06-04-fantasy-birds-bluebird %})
