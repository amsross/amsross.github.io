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

```
(c -> d) -> (a -> b -> c) -> a -> b -> c -> d
// f => g => h => a => f(g(h)(a)))
```

```
"use strict";
const R = require("ramda");
const becard = R.curry((f, g, h, a) => f(g(h(a))));
const blackbird = R.curry((f, g, a, b) => f(g(a)(b)));

const data = [{
  infraclass: "Neognathae",
  weight: 250,
  height: 110,
}, {
  infraclass: "Neognathae",
  weight: 77,
  height: 67,
}, {
  infraclass: "Palaeognathae",
  weight: 24,
  height: 50,
}, {
  infraclass: "Palaeognathae",
  weight: 8,
  height: 50,
}];

// get an array of arrays of related items
const groupsOf = blackbird(R.values)(R.groupBy);
const groupsOfInfraclasses = groupsOf(R.prop("infraclass"));
const groupsOfHeights = groupsOf(R.prop("height"));

// find the total of a set of values within each group
const eachTotal = blackbird(R.map)(R.curryN(2, R.compose))(R.reduce(R.add, 0));
const eachTotalHeight = eachTotal(R.pluck("height"));
const eachTotalWeight = eachTotal(R.pluck("weight"));

const totalHeightsByInfraclass = becard(R.identity, eachTotalHeight, groupsOfInfraclasses);
const totalWeightsByInfraclass = becard(R.identity, eachTotalWeight, groupsOfInfraclasses);
const totalHeightsByHeight = becard(R.identity, eachTotalHeight, groupsOfHeights);
const totalWeightsByHeight = becard(R.identity, eachTotalWeight, groupsOfHeights);

console.log("\n", totalHeightsByInfraclass(data));
console.log("\n", totalWeightsByInfraclass(data));
console.log("\n", totalHeightsByHeight(data));
console.log("\n", totalWeightsByHeight(data));
```
