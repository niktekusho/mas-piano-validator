const fs = require('fs');
const {join} = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const validate = require('.');

class MinimalExample {
	constructor({enableName = true, enableVerseList = true, enablePnmList = true} = {}) {
		/* eslint-disable camelcase */
		if (enableName) {
			this.name = 'Song name';
		}
		if (enableVerseList) {
			this.verse_list = [0];
		}
		if (enablePnmList) {
			this.pnm_list = [
				{
					text: 'One',
					style: 'monika_credits_text',
					notes: [
						'D5',
						'C5SH',
						'B4',
						'F4SH'
					]
				},
				{
					text: 'Two',
					style: 'monika_credits_text',
					notes: [
						'D5',
						'A4',
						'D5',
						'A4'
					]
				}
			];
		}
		/* eslint-enable camelcase */
	}
}

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

	describe('when using the \'all\' property', () => {
		it('should signal the user if the passed argument is not an array', () => {
			expect(() => validate.all({})).toThrowError(/.*received.*object$/gmi);
			expect(() => validate.all('a')).toThrowError(/.*received.*string$/gmi);
		});

		it('should validate all of the arguments (source unknwown)', () => {
			const exampleData = [
				new MinimalExample(),
				new MinimalExample({enablePnmList: false}),
				new MinimalExample({enablePnmList: false, enableVerseList: false})
			];
			const results = validate.all(exampleData);
			results.forEach(result => {
				expect(result.meta).toStrictEqual({src: undefined});
			});
			expect(results.filter(result => result.ok === true)).toHaveLength(1);
			expect(results.filter(result => result.ok === false)).toHaveLength(2);
		});

		it('should validate all of the arguments (source specified)', () => {
			const exampleData = [
				{content: new MinimalExample(), meta: 'test'},
				{content: new MinimalExample({enablePnmList: false}), meta: 'test'}
			];
			const results = validate.all(exampleData);
			results.forEach(result => {
				expect(result.meta).toStrictEqual('test');
			});
			expect(results.filter(result => result.ok === true)).toHaveLength(1);
			expect(results.filter(result => result.ok === false)).toHaveLength(1);
		});
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
