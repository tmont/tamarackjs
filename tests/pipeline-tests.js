var should = require('should'),
	Pipeline = require('../');

describe('Pipeline', function() {
	function AppendToValue(value) {
		this.value = value;
	}

	AppendToValue.prototype = {
		executeSync: function(input, next) {
			input.value += this.value;
			next(input);
		}
	};

	function AddToInput(value) {
		this.value = value;
	}

	AddToInput.prototype = {
		executeSync: function(input, next) {
			input += this.value;
			return next(input);
		}
	};

	function AppendToOutput(value) {
		this.value = value;
	}

	AppendToOutput.prototype = {
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
});