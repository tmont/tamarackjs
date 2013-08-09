# Tamarack(.js)
[![Build Status](https://travis-ci.org/tmont/tamarackjs.png)](https://travis-ci.org/tmont/tamarackjs)
[![NPM version](https://badge.fury.io/js/tamarack.png)](http://badge.fury.io/js/tamarack)

This is a NodeJS port of the similarly named [.NET framework](https://github.com/mikevalenty/tamarack),
written by Mike Valenty. The documentation on that page is more verbose than the stuff on this
page. That's because the APIs are pretty much identical except for the case of the first
letter in the functions. And there's less angle brackets in the JavaScript version.

## Installation
Node only at the moment: `npm install tamarack`

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
var Pipeline = require('tamarack');

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
Coming soon! Probably!

## Development
```bash
git clone git@github.com:tmont/tamarackjs.git
cd tamarackjs
npm install
npm test
```

