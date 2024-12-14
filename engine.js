const factorial = {
	'type': 'function',
	'name': 'foldl1',
	'args': [
		{
			'type': 'reference',
			'name': 'multiply'
		},
		{
			'type': 'constant',
			'value': [1,2,3,4,5]
		}
	]
};

// TODO: validate types of the arguments being applied to the functions
const FUNCTIONS = Object.freeze({
	add: (x, y) => x + y,
	subtract: (x, y) => x - y,
	multiply: (x, y) => x * y,
	divide: (x, y) => x / y,
	map: (f, xs) => xs.map(f),
	foldl: (f, x, xs) => xs.reduce(f, x),
	foldl1: (f, xs) => xs.reduce(f),
	foldr: (f, x, xs) => xs.reduceRight(f, x),
	foldr1: (f, xs) => xs.reduceRight(f),
	filter: (f, xs) => xs.filter(f),
	reverse: (xs) => [...xs].reverse(),
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
	'!!': (xs, i) => xs[i],
	'..': (a, b) => Array.from({length: b - a + 1 }, (_, x) => a + x),
	elemIndex: (xs, i) => xs.find(i),
	take: (xs, n) => xs.slice(0, n),
	trim: (xs) => xs.trim(),
	trimLeft: (xs) => xs.trimLeft(),
	trimRight: (xs) => xs.trimRight(),
	// TODO:
	// - takeWhile (use generator)
	// - dropWhile (use generator)
	// - scanLeft
	// - scanRight
});

const TYPES = Object.freeze({
	'function': Symbol('function'),
	'reference': Symbol('reference'),
	'constant': Symbol('constant')
});

function evaluate(obj) {
	if (typeof obj !== 'object') {
		throw new Error(`typeof formula is \`${typeof obj}\` expected \`${typeof {}}\``);
	}

	if (obj == null) {
		return null;
	}

	const type = TYPES[obj.type];
	switch (type) {
		case TYPES.function: {
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
		case TYPES.reference: {
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
		case TYPES.constant: {
			if (!('value' in obj)) {
				throw new Error(`key \`value\` missing from constant object`, obj);
			}
			return obj.value;
			break;
		}
		default: {
			throw new Error(`invalid object type \`${type}\``);
		}
	}
}

const result = evaluate(factorial);
console.log(result);
