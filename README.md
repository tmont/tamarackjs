# Tamarack(.js)
[![Build Status](https://travis-ci.org/tmont/tamarackjs.png)](https://travis-ci.org/tmont/tamarackjs)
[![NPM version](https://badge.fury.io/js/tamarack.png)](http://badge.fury.io/js/tamarack)

This is a NodeJS port of the similarly named [.NET framework](https://github.com/mikevalenty/tamarack),
written by Mike Valenty. The documentation on that page is more verbose than the stuff on this
page. That's because the APIs are pretty much identical except for the case of the first
letter in the functions. And there's less angle brackets in the JavaScript version.

## Installation
### Node
`npm install tamarack`

###Browser
Reference [tamarack.min.js](./tamarack.min.js) somewhere, and use `window.tamarack`.

## Usage
You start with a `Pipeline`. `Pipeline`s contain filters. In the dynamic, non-type-safe
JavaScript world, a filter is just an object that has an `executeSync` function on it.
Here is the simplest filter of them all:

```javascript
var simpleFilter = {
	executeSync: function(input, next) {
		return next(input);
	}
};
```

```javascript
var Pipeline = require('tamarack').Pipeline;

function createNewPost(post) {
	var pipeline = new Pipeline()
		.add(new CanonicalizeHtml())
		.add(new StripMaliciousTags())
		.add(new RemoveJavaScript())
		.add(new RewriteProfanity())
		.add(new GuardAgainstDoublePost())
		.andFinally(function(post) { return repository.saveSync(post); });

	return pipeline.executeSync(post);
}
```

Here's what one of these filters might look like:

```javascript
function RewriteProfanity() {}

RewriteProfanity.prototype = {
	executeSync: function(input, next) {
		input = input.replace(/ur mom sux/gi, 'Let\'s agree to disagree.');
		return next(input);
	}
};
```

### Asynchronous Pipelines
Two things to do when handling asynchronous filters and pipelines:

1. Add an `execute(input, next, callback)` function to your filter
2. Call `execute(input, null, callback)` on the pipeline

For example, here's an asynchronous filter:

```javascript
function AppendWord(word) {
	this.word = word;
}
AppendWord.prototype = {
	execute: function(input, next, callback) {
		input += this.word;
		next(input, callback);
	}
};
```

And then how you use it in a pipeline:
```javascript
new Pipeline()
	.add(new AppendWord(' world'))
	.andFinally(function(input, callback) {
		callback(input + '!');
	})
	.execute('Hello', null, function(result) {
		console.log(result); //"Hello world!"
	});
```

If you want to modify the __output__ using an asynchronous filter,
`AppendWord.prototype.execute` would become:

```javascript
function(input, next, callback) {
	var self = this;
	next(input, function(result) {
		result += self.word;
		callback(result);
	});
}
```

The result after executing the pipeline as above would be `Hello !world`.

## Development
```bash
git clone git@github.com:tmont/tamarackjs.git
cd tamarackjs
npm install
npm test
```

Run `npm run build` to create the minified browser version of tamarack.