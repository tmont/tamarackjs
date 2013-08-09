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

	executeSync: function(input, next) {
		var self = this;
		next = next || function() { };
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
			executeSync: function(input, next) {
				return done(input);
			}
		});
	}
};

module.exports = Pipeline;