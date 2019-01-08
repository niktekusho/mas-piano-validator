const {EOL} = require('os');

const Ajv = require('ajv');

const jsonSchema = require('./schema/piano.schema.json');

const ajv = new Ajv({
	allErrors: true
});

const rawValidate = ajv.compile(jsonSchema);

class ValidationResult {
	constructor(meta, status, errors) {
		this.meta = meta;
		this.ok = status;
		this.errors = errors;
	}

	prettify(includeMeta = false) {
		let prettified = '';
		if (includeMeta) {
			prettified += `${this.meta.src} - `;
		}
		if (this.ok) {
			prettified += 'This file is a valid Monika After Story piano song!';
		} else {
			prettified += 'This file is NOT a valid Monika After Story piano song.';
		}
		return prettified;
	}
}

function prettify(result) {
	if (Array.isArray(result)) {
		// Find at least one object in the array that is not ValidationResult
		const notValidationResult = result.find(r => !(r instanceof ValidationResult));
		if (notValidationResult) {
			throw new TypeError('The results passed in contained at least an object not of type ValidationResult');
		}
		// Check if all ValidationResults are valid
		const allValid = result.find(r => r.ok === false) === undefined;
		if (allValid) {
			return 'All files are valid Monika After Story piano songs!';
		}
		const introMsg = `Some songs are NOT valid Monika After Story piano songs.${EOL}Details:${EOL}`;
		return introMsg + result.reduce((prev, curr) => prev.concat(`${EOL}${curr.prettify(true)}`), '');
	}
	if (!(result instanceof ValidationResult)) {
		throw new TypeError('Cannot prettify anything other than a ValidationResult object');
	}
	return result.prettify();
}

function validateAll(obj) {
	if (Array.isArray(obj)) {
		return obj.map(validationItem => {
			if (validationItem.content && validationItem.meta) {
				return validate(validationItem.content, validationItem.meta);
			}
			return validate(validationItem);
		});
	}
	// TODO: find a way to communicate the wrong API
	throw new Error(`The 'all' function expects an argument of type array, instead it received a ${typeof obj}`);
}

function validate(obj, meta = {src: undefined}) {
	if (typeof obj === 'string') {
		try {
			const parsed = JSON.parse(obj);
			return new ValidationResult(meta, rawValidate(parsed), rawValidate.errors);
		} catch (error) {
			// TODO
			// File is not a valid JSON:
			// last chance is to try to guess if it's a path and then try to work with that

			// TODO: use something to give the user/client a more accessible error
			return new ValidationResult(meta, false, ['Specified argument was not a valid JSON literal']);
		}
	}
	return new ValidationResult(meta, rawValidate(obj), rawValidate.errors);
}

module.exports = validate;
module.exports.default = validate;
module.exports.all = validateAll;
module.exports.prettify = prettify;
