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
