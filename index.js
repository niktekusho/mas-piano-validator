const Ajv = require('ajv');

const jsonSchema = require('./schema/piano.schema.json');

const ajv = new Ajv({
	allErrors: true
});

const rawValidate = ajv.compile(jsonSchema);

class ValidationResult {
	constructor(status, errors) {
		this.ok = status;
		this.errors = errors;
	}
}

function validate(obj) {
	return new ValidationResult(rawValidate(obj), rawValidate.errors);
}

module.exports = validate;
