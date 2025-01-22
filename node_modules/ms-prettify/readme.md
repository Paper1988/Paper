# Installation
```
npm i ms-prettify
```

# What is it?
An module to convert MS to human readable time to MS with advanced options.

# Note
- Requires Node.jS v14 or later.

# Why?
- Easy to use.
- Advanced options for manipulating the result.
- Support both TypeScript and JavaScript.

# How?
```js
const { default:ms } = require('ms-prettify');
// import ms from "ms-prettify"; // for TypeScript/ECMAScript usage

console.log(ms("1hour 10 min")); // Output => 4200000
console.log(ms("1hour 10 min 1y")); // Output => 31561800000
console.log(ms("1hour 10 min 1y")); // Output => 31561800000
console.log(ms("132ms 12")); // Output => 144

console.log(ms(123456789)); // Output => 1 day 10 hours 17 minutes 36 seconds 789 milliseconds 
console.log(ms(123456789, { max: 2 })); // Output => 1 day 10 hours 
console.log(ms(123456789, { expanded: false })); // Output => 1 d 10 h 17 m 36 s 789 ms
console.log(ms(123456789, { max: 2, expanded: false })); // Output => 1 d 10 h

console.log(ms(354678902, { returnObject: false, till: "second" })); // Output => 4 d 2 h 31 m 18 s
console.log(ms(354678902, { returnObject: true })); // Output => { day: 4, hour: 2, minute: 31, second: 18, millisecond: 902 }

console.log(ms("hour 1s")); // Output => 100
console.log(ms("hour 1er4 d9")); // Output => undefined
console.log(ms("hour1")); // Output => undefined
console.log(ms("hello world")); // Output => undefined
```

# Timer
```js
const { timer } = require('ms-prettify');
// import { timer } from 'ms-prettify'; // for TypeScript/ECMAScript usage

/**
 * @param {Number} time Time after which timer should be executed
 * @param {Function} callback a callback function that should be executed when the timer ends
 * @param {...any[]} args arguments for the callback function
 */
timer("10 minutes 12 second", (data, client) => client.doSomething(data), await getDataSomehow());

// Other ways to use

// ...
await timer("15 seconds");
// now do something else
```

# Support
for support or issues, contact me on my [discord server](https://discord.gg/J6GmRfgBvE) or create a issue [here](https://github.com/KartikeSingh/ms-prettify/issues)
