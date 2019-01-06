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

		// Case: number object
		expect(validate(1.0).ok).toStrictEqual(false);

		// Case: array object
		expect(validate([{a: 1}]).ok).toStrictEqual(false);
	});

	describe('when passing \'string\' argument', () => {
		it('should try to parse passed string like a JSON file', () => {
			// This is known to NOT be a valid piano song
			const testObject = {
				a: 'something'
			};
			const testString = JSON.stringify(testObject);
			const meta = {src: 'test'};

			// Create a spy on JSON.parse to test the actual call
			const jsonParseSpy = jest.spyOn(JSON, 'parse');

			const result = validate(testString, meta);
			expect(result.ok).toStrictEqual(false);
			expect(result.meta).toStrictEqual(meta);

			expect(jsonParseSpy).toHaveBeenCalledTimes(1);
			expect(jsonParseSpy).toHaveBeenCalledWith(testString);
		});

		it('should try to load the file in case the string is not a valid JSON literal', () => {
			const testString = '{something: "very similar", "to": \'a valid JSON\'';

			const result = validate(testString);
			expect(result.ok).toStrictEqual(false);
			expect(result.errors).toHaveLength(1);
			// Match the error message
			expect(result.errors[0]).toMatch(/not.*valid json literal/gmi);
		});
	});

	it('testing with known valid examples', async () => {
		const examplesDir = join(__dirname, 'examples');
		const files = await readdir(examplesDir);
		const filesContents = await Promise.all(
			files.map(file => readFile(join(examplesDir, file), {encoding: 'utf8'}))
		);
		const results = filesContents.map(fileContent => validate(fileContent));

		const failedExamples = results.filter(result => result.ok === false);
		return expect(failedExamples).toHaveLength(0);
	});
});
