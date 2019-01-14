const Ajv = require('ajv');

const jsonSchema = require('./schema/piano.schema.json');

const ajv = new Ajv({
	allErrors: true
});

const rawValidate = ajv.compile(jsonSchema);

class ValidationResult {
	constructor(status, errors, meta = {src: undefined}) {
		this.meta = meta;
		this.ok = status;
		this.errors = errors || [];

		this.summary = status === true ? 'This file is a valid Monika After Story piano song.' : 'This file is NOT a valid Monika After Story piano song.';
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
}

function validateAll(validationItems) {
	if (Array.isArray(validationItems)) {
		const results = validationItems.map(validationItem => {
			if (validationItem.content && validationItem.meta) {
				return validate(validationItem.content, validationItem.meta);
			}
			return validate(validationItem);
		});
		return new ValidationResultsContainer(results);
	}
	// TODO: find a way to communicate the wrong API
	throw new Error(`The 'all' function expects an argument of type array, instead it received a ${typeof validationItems}`);
}

function validate(obj, meta) {
	if (typeof obj === 'string') {
		try {
			const parsed = JSON.parse(obj);
			return new ValidationResult(rawValidate(parsed), rawValidate.errors, meta);
		} catch (error) {
			// TODO
			// File is not a valid JSON:
			// last chance is to try to guess if it's a path and then try to work with that

			// TODO: use something to give the user/client a more accessible error
			return new ValidationResult(false, ['Specified argument was not a valid JSON literal'], meta);
		}
	}
	return new ValidationResult(rawValidate(obj), rawValidate.errors, meta);
}

module.exports = validate;
module.exports.default = validate;
module.exports.all = validateAll;
