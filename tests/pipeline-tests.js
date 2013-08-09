var should = require('should'),
	Pipeline = require('../');

describe('Pipeline', function() {
	function AppendToValue(value) {
		this.value = value;
	}

	AppendToValue.prototype = {
		execute: function(input, next, callback) {
			input.value += this.value;
			next(input, callback);
		},

		executeSync: function(input, next) {
			input.value += this.value;
			next(input);
		}
	};

	function AddToInput(value) {
		this.value = value;
	}

	AddToInput.prototype = {
		execute: function(input, next, callback) {
			input += this.value;
			next(input, callback);
		},

		executeSync: function(input, next) {
			input += this.value;
			return next(input);
		}
	};

	function AppendToOutput(value) {
		this.value = value;
	}

	AppendToOutput.prototype = {
		execute: function(input, next, callback) {
			var self = this;
			next(input, function(err, result) {
				result += self.value;
				callback(err, result);
			});
		},

		executeSync: function(input, next) {
			var result =  next(input);
			result += this.value;
			return result;
		}
	};

	it('should not require any filters', function() {
		var pipeline = new Pipeline();
		var context = { foo: 'bar' };
		pipeline.executeSync(context);
		context.should.eql({ foo: 'bar' });
	});

	it('should apply each filter in order added', function() {
		var context = { value: 'one' };
		new Pipeline()
			.add(new AppendToValue(', two'))
			.add(new AppendToValue(', three'))
			.executeSync(context);

		context.should.have.property('value', 'one, two, three');
	});

	describe('filters', function() {
		it('should modify input', function() {
			var result = new Pipeline()
				.add(new AddToInput(3))
				.andFinally(function(input) { return input + '!'; })
				.executeSync(2);

			result.should.equal('5!');
		});

		it('should modify output', function() {
			var result = new Pipeline()
				.add(new AppendToOutput('#'))
				.andFinally(function(input) { return input + '!'; })
				.executeSync(2);

			result.should.equal('2!#');
		});
	});

	describe('inception', function() {
		it('should allow pipelines to be filters', function() {
			var numbers = new Pipeline()
				.add(new AppendToOutput('1'))
				.add(new AppendToOutput('2'))
				.add(new AppendToOutput('3'));

			var result = new Pipeline()
				.add(numbers)
				.add(new AppendToOutput('4'))
				.andFinally(function(input) { return input.toString(); })
				.executeSync(5);

			result.should.equal('54321');
		});

		it('should allow pipelines to be filters by value', function() {
			var numbers = new Pipeline()
				.add(new AppendToValue('1'))
				.add(new AppendToValue('2'))
				.add(new AppendToValue('3'));

			var context = { value: '' };

			new Pipeline()
				.add(numbers)
				.add(new AppendToValue('4'))
				.executeSync(context);

			context.should.have.property('value', '1234');
		});
	});

	describe('async', function() {
		it('should not require any filters', function(done) {
			var context = { foo: 'bar' };
			new Pipeline().execute(context, null, function() {
				context.should.eql({ foo: 'bar' });
				done();
			});
		});

		it('should apply each filter in order added', function(done) {
			var context = { value: 'one' };
			new Pipeline()
				.add(new AppendToValue(', two'))
				.add(new AppendToValue(', three'))
				.execute(context, null, function() {
					context.should.have.property('value', 'one, two, three');
					done();
				});
		});

		describe('filters', function() {
			it('should modify input', function(done) {
				new Pipeline()
					.add(new AddToInput(3))
					.andFinally(function(input, callback) {
						callback(null, input + '!');
					})
					.execute(2, null, function(err, result) {
						result.should.equal('5!');
						done();
					});
			});

			it('should modify output', function(done) {
				new Pipeline()
					.add(new AppendToOutput('#'))
					.andFinally(function(input, callback) {
						callback(null, input + '!');
					})
					.execute(2, null, function(err, result) {
						result.should.equal('2!#');
						done();
					});

			});
		});

		describe('inception', function() {
			it('should allow pipelines to be filters', function(done) {
				var numbers = new Pipeline()
					.add(new AppendToOutput('1'))
					.add(new AppendToOutput('2'))
					.add(new AppendToOutput('3'));

				new Pipeline()
					.add(numbers)
					.add(new AppendToOutput('4'))
					.andFinally(function(input, callback) {
						callback(null, input.toString());
					})
					.execute(5, null, function(err, result) {
						result.should.equal('54321');
						done();
					});

			});

			it('should allow pipelines to be filters by value', function(done) {
				var numbers = new Pipeline()
					.add(new AppendToValue('1'))
					.add(new AppendToValue('2'))
					.add(new AppendToValue('3'));

				var context = { value: '' };

				new Pipeline()
					.add(numbers)
					.add(new AppendToValue('4'))
					.execute(context, null, function(err, result) {
						context.should.have.property('value', '1234');
						done();
					});

			});
		});
	});
});