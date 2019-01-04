const fs = require('fs');
const {join} = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const validate = require('.');

// Important: not testing ajv features here, so do not test error object or the such from ajv.

describe('Core library testing', () => {
	it('result.ok should equal false when passing wrong objects', () => {
		// Case: undefined
		expect(validate().ok).toStrictEqual(false);

		// Case: null
		expect(validate(null).ok).toStrictEqual(false);

		// Case: string object
		expect(validate('test').ok).toStrictEqual(false);

		// Case: number object
		expect(validate(1.0).ok).toStrictEqual(false);

		// Case: array object
		expect(validate([{a: 1}]).ok).toStrictEqual(false);
	});

	it('testing with known valid examples', async () => {
		const examplesDir = join(__dirname, 'examples');
		const files = await readdir(examplesDir);
		const filesContents = await Promise.all(
			files.map(file => readFile(join(examplesDir, file), {encoding: 'utf8'}))
		);
		const results = filesContents
			.map(fileContent => JSON.parse(fileContent))
			.map(jsonContent => validate(jsonContent));

		const failedExamples = results.filter(result => result.ok === false);
		return expect(failedExamples).toHaveLength(0);
	});
});
