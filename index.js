const Ajv = require('ajv');

const jsonSchema = require('./schema/piano.schema.json');

const ajv = new Ajv({
	allErrors: true
});

const rawValidate = ajv.compile(jsonSchema);

class ValidationInput {
	constructor(validationItem, source = 'unknown') {
		this._validationItem = validationItem;
		this._meta = {
			src: source
		};
	}

	get validationItem() {
		return this._validationItem;
	}

	get source() {
		return this._meta.src;
	}
}

class ValidationInputContainer {
	constructor() {
		this._input = [];
	}

	get input() {
		return this._input;
	}

	add(validationItem, source) {
		if (validationItem === null || validationItem === undefined) {
			throw new TypeError('A validationItem must be specified.');
		}

		if (source === null || source === undefined) {
			throw new TypeError('A source must be specified.');
		}

		if (typeof source !== 'string') {
			throw new TypeError(`Source must be of type string, but it was of type '${typeof source}'.`);
		}

		const validationInput = new ValidationInput(validationItem, source);
		this._input.push(validationInput);
		return this;
	}
}

class ValidationResult {
	constructor(status, errors, source = 'unknown') {
		this._source = source;
		this._ok = status;
		this._errors = errors || [];
	}

	get source() {
		return this._source;
	}

	get ok() {
		return this._ok;
	}

	get errors() {
		return this._errors;
	}

	get summary() {
		return this._ok ? 'This file is a valid Monika After Story piano song.' : 'This file is NOT a valid Monika After Story piano song.';
	}
}

class ValidationResultsContainer {
	constructor(results) {
		this.results = results;
		const allValid = this.validResults.length === results.length && this.invalidResults.length === 0;
		this.ok = allValid;
		const allInvalid = this.validResults.length === 0 && this.invalidResults.length === results.length;
		let summary;
		if (allValid) {
			summary = 'All files are valid Monika After Story piano songs.';
		} else if (allInvalid) {
			summary = 'All files are NOT valid Monika After Story piano songs.';
		} else {
			summary = 'Some files are NOT valid Monika After Story piano songs.';
		}

		this.summary = summary;
	}

	get validResults() {
		return this.results.filter(result => result.ok === true);
	}

	get invalidResults() {
		return this.results.filter(result => result.ok === false);
	}

	get unknownSourceResults() {
		return this.results.filter(result => result.source === 'unknown');
	}
}

function validateAll(validationItems) {
	if (validationItems instanceof ValidationInputContainer) {
		const results = validationItems.input.map(item => validate(item.validationItem, item.source));
		return new ValidationResultsContainer(results);
	}

	throw new Error('The \'all\' function expects a ValidationInputContainer object.');
}

function validate(validationItem, meta) {
	if (typeof validationItem === 'string') {
		try {
			const parsed = JSON.parse(validationItem);
			return new ValidationResult(rawValidate(parsed), rawValidate.errors, meta);
		} catch (_) {
			return new ValidationResult(false, ['Specified argument was not a valid JSON literal'], meta);
		}
	}

	return new ValidationResult(rawValidate(validationItem), rawValidate.errors, meta);
}

module.exports = validate;
module.exports.default = validate;
module.exports.all = validateAll;
module.exports.ValidationInputContainer = ValidationInputContainer;
