// TODO: validate types of the arguments being applied to the functions
const FUNCTIONS = Object.freeze({
	add: (x, y) => x + y,
	subtract: (x, y) => x - y,
	multiply: (x, y) => x * y,
	divide: (x, y) => x / y,
	min: (x, y) => Math.min(x, y),
	minimum: (xs) => Math.min(...xs),
	max: (x, y) => Math.max(x, y),
	maximum: (xs) => Math.max(...xs),
	map: (f, xs) => xs.map(f),
	id: (x) => JSON.parse(JSON.stringify(x)),
	product: (xs) => xs.reduce((a, b) => a * b, 1),
	foldl: (f, x, xs) => xs.reduce(f, x),
	foldl1: (f, xs) => xs.reduce(f),
	foldr: (f, x, xs) => xs.reduceRight(f, x),
	foldr1: (f, xs) => xs.reduceRight(f),
	scanl: (f, x, xs) => xs.reduce((xs, x) => [...xs, f(xs[xs.length - 1], x)], [x]),
	scanr: (f, xs, x) => xs.reduceRight((xs, x) => {
		xs.unshift(f(x, xs[0]));
		return xs;
	}, [x]),
	filter: (f, xs) => xs.filter(f),
	reverse: (xs) => Array.isArray(xs) ? [...xs].reverse() : xs.split('').reverse().join(''),
	head: (xs) => xs[0],
	tail: (xs) => xs.slice(1),
	cons: (x, xs) => [x, ...xs],
	split: (xs, x) => xs.split(x),
	length: (xs) => xs.length,
	toUpper: (xs) => xs.toUpperCase(),
	toLower: (xs) => xs.toLower(),
	every: (f, xs) => xs.every(f),
	'&&': (x, y) => x && y,
	'||': (x, y) => x || y,
	'!': (x) => !x,
	'>': (x, y) => x > y,
	'>=': (x, y) => x >= y,
	'<': (x, y) => x < y,
	'<=': (x, y) => x <= y,
	'==': (x, y) => x === y,
	'!!': (xs, i) => xs[i],
	'..': (a, b) => Array.from({length: b - a + 1 }, (_, x) => a + x),
	'++': (xs, ys) => Array.isArray(xs) && Array.isArray(ys) ? xs.concat(ys) : xs + ys,
	elemIndex: (xs, i) => xs.find(i),
	take: (xs, n) => xs.slice(0, n),
	trim: (xs) => xs.trim(),
	trimLeft: (xs) => xs.trimLeft(),
	trimRight: (xs) => xs.trimRight(),
	takeWhile: (f, xs) => {
		function* takeWhile(xs) {
			for (let x of xs) {
				if (f(x)) yield x;
				else return;
			}
		}
		return [...takeWhile(xs)];
	},
	dropWhile: (f, xs) => {
		function* dropWhile(xs) {
			for (let x of xs) {
				if (!f(x)) yield x;
				else return;
			}
		}
		return [...dropWhile(xs)];
	},
	isTrue: (x) => !!x,
	isFalse: (x) => !!!x,
});

function evaluate(obj) {
	const type = typeof obj;
	if (type === 'boolean'
		|| type === 'number'
		|| type === 'string') {
		return obj;
	}

	if (type === 'object' && Array.isArray(obj)) {
		return obj.map(evaluate);
	}

	if (obj == null) {
		return null;
	}

	switch (obj.type) {
		case 'function': {
			const fname = obj.name;
			const fref = FUNCTIONS[fname];

			if (!fref) {
				throw new Error(`invalid function \`${fname}\``);
			}

			const fargs = obj.args;
			if (!fargs) {
				throw new Error(`key \`args\` missing from function object`, obj);
			}

			if (!Array.isArray(fargs)) {
				throw new Error(`typeof \`args\` is \`${typeof fargs}\` expected \`${typeof []}\``, obj);
			}

			const farity = fref.length;
			if (fargs.length !== farity) {
				throw new Error(`function \`${fname}\` expects \`${farity}\` argument(s), received \`${fargs.length}\``, obj);
			}

			const args = fargs.map(evaluate);
			return fref(...args);
		}
		case 'reference': {
			const fname = obj.name;
			const fref = FUNCTIONS[fname];

			if (!fref) {
				throw new Error(`invalid function \`${fname}\``);
			}

			const fargs = obj.args;
			if (!fargs) {
				return fref;
			}

			if (!Array.isArray(fargs)) {
				throw new Error(`typeof \`args\` is \`${typeof fargs}\` expected \`${typeof []}\``, obj);
			}

			const farity = fref.length;
			if (fargs.length === farity) {
				throw new Error(`function \`${fname}\` has been fully applied, \`${fargs.length}\` argument(s) received. Change \`type\` to 'function' if not partially applying the function.`, obj);
			}
			if (fargs.length > farity) {
				throw new Error(`function \`${fname}\` expects \`${farity}\` argument(s), received \`${fargs.length}\` while partially applying arguments`, obj);
			}

			const args = fargs.map(evaluate);
			return fref.bind(null, ...args);
		}
		default: {
			return obj;
		}
	}
}

const examples = {
	// Calculate 100!
	factorial: {
		'type': 'function',
		'name': 'product',
		'args': [
			{
				'type': 'function',
				'name': '..',
				'args': [1, 100]
			}
		]
	},

	// Find maximum number in an array
	maximum: {
		'type': 'function',
		'name': 'maximum',
		'args': [[1, 9, 20, 3, 43, 29, 10, 4]]
	},

	// Reverse an array
	reverse: {
		'type': 'function',
		'name': 'reverse',
		'args': [[1, 2, 3, 4, 5]]
	},

	// Take from array while predicate is true
	takeWhile: {
		'type': 'function',
		'name': 'takeWhile',
		'args': [
			{
				'type': 'reference',
				'name': '>',
				'args': [5]
			},
			[1, 2, 3, 4, 5, 6, 7, 8, 9]
		]
	},

	// Drop from array while predicate is true
	dropWhile: {
		'type': 'function',
		'name': 'dropWhile',
		'args': [
			{
				'type': 'reference',
				'name': '>',
				'args': [5]
			},
			[9, 8, 7, 6, 5, 4, 3, 2, 1]
		]
	},

	// Map a function to each element in an array
	map: {
		'type': 'function',
		'name': 'map',
		'args': [
			{
				'type': 'reference',
				'name': 'multiply',
				'args': [2]
			},
			[1, 2, 3, 4, 5]
		]
	},

	// Get the length of things
	length: {
		'type': 'function',
		'name': 'map',
		'args': [
			{
				'type': 'reference',
				'name': 'length'
			},
			[
				[1, 2, 3, 4, 5],
				'hello',
				'banana'
			]
		]
	},

	// Partially applied function
	add5: {
		'type': 'reference',
		'name': 'add',
		'args': [5]
	},

	// Concat arrays
	concat_arrays: {
		'type': 'function',
		'name': '++',
		'args': [[1, 2, 3], [4, 5, 6]]
	},

	// Concat strings
	concat_strings: {
		'type': 'function',
		'name': '++',
		'args': ['hello', ' world']
	},

	// Concat multiple strings
	concat_multiple_strings: {
		'type': 'function',
		'name': 'foldl1',
		'args': [
			{
				'type': 'reference',
				'name': '++',
			},
			['hello', ' ', 'there', ' ', 'world']
		]
	},

	// Check if string is palindrome
	isPalindrome: {
		'type': 'function',
		'name': '==',
		'args': [
			'saippuakivikauppias',
			{
				'type': 'function',
				'name': 'reverse',
				'args': ['saippuakivikauppias']
			}
		]
	}
}

Object.entries(examples).forEach(([example_name, example_formula]) => {
	console.log(example_name, '=>', evaluate(example_formula));
});
