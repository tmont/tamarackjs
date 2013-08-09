function Pipeline() {
	this.filters = [];
	this.current = 0;
}

Pipeline.prototype = {
	add: function(filter) {
		this.filters.push(filter);
		return this;
	},

	count: function() {
		return this.filters.length;
	},

	execute: function(input, next, callback) {
		callback = callback || function() {};
		next = next || function() { callback(null, input); };
		var self = this;
		function getNext() {
			if (self.current < self.count()) {
				return function(input, callback) {
					var filter = self.filters[self.current++];
					filter.execute(input, getNext(), callback);
				};
			}

			return next;
		}

		getNext()(input, callback);
	},

	executeSync: function(input, next) {
		var self = this;
		next = next || function() {};
		function getNext() {
			if (self.current < self.count()) {
				return function(input) {
					return self.filters[self.current++].executeSync(input, getNext());
				};
			}

			return next;
		}

		return getNext()(input);
	},

	andFinally: function(done) {
		return this.add({
			execute: function(input, next, callback) {
				done(input, callback);
			},

			executeSync: function(input, next) {
				return done(input);
			}
		});
	}
};

module.exports = Pipeline;