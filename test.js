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
	describe('when using the single call API', () => {
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

		it('result.ok should equal true when passing valid examples', async () => {
			const examplesDir = join(__dirname, 'examples');
			const files = await readdir(examplesDir);
			const filesContents = await Promise.all(
				files.map(file => readFile(join(examplesDir, file), {encoding: 'utf8'}))
			);
			const results = filesContents.map(fileContent => validate(fileContent));

			const failedExamples = results.filter(result => result.ok === false);
			return expect(failedExamples).toHaveLength(0);
		});

		describe('when passing \'string\' argument', () => {
			it('should try to parse passed string like a JSON file and return the appropriate ValidationResult (input is valid JSON)', () => {
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

			it('should try to parse passed string like a JSON file and return the appropriate ValidationResult (input is NOT a valid JSON)', () => {
				const testString = '{something: "very similar", "to": \'a valid JSON\'';

				const result = validate(testString);
				expect(result.ok).toStrictEqual(false);
				expect(result.errors).toHaveLength(1);
				expect(result.errors[0]).toStrictEqual('Specified argument was not a valid JSON literal');
			});
		});
	});

	describe('when using the \'all\' API', () => {
		it('should signal the user if the passed argument is not an array', () => {
			expect(() => validate.all({})).toThrowError('The \'all\' function expects an argument of type array, instead it received a object');
			expect(() => validate.all('a')).toThrowError('The \'all\' function expects an argument of type array, instead it received a string');
		});

		it('should have ok = true and appropriate summary when all of the arguments are valid', () => {
			const exampleData = [
				new MinimalExample(),
				new MinimalExample(),
				new MinimalExample()
			];
			const results = validate.all(exampleData);
			expect(results.ok).toStrictEqual(true);
			expect(results.summary).toStrictEqual('All files are valid Monika After Story piano songs.');
			expect(results.results).toHaveLength(3);
			expect(results.validResults).toHaveLength(3);
			expect(results.invalidResults).toHaveLength(0);
		});

		it('should have ok = false and appropriate summary when at least 1 of the arguments is invalid', () => {
			const exampleData = [
				new MinimalExample(),
				new MinimalExample({enablePnmList: false}),
				{content: new MinimalExample(), meta: {src: 'test'}}
			];
			const results = validate.all(exampleData);
			expect(results.ok).toStrictEqual(false);
			expect(results.summary).toStrictEqual('Some files are NOT valid Monika After Story piano songs.');
			expect(results.results).toHaveLength(3);
			expect(results.validResults).toHaveLength(2);
			expect(results.invalidResults).toHaveLength(1);
		});

		it('should have ok = false and appropriate summary when all arguments are invalid', () => {
			const exampleData = [
				new MinimalExample({enableName: false}),
				new MinimalExample({enablePnmList: false})
			];
			const results = validate.all(exampleData);
			expect(results.ok).toStrictEqual(false);
			expect(results.summary).toStrictEqual('All files are NOT valid Monika After Story piano songs.');
			expect(results.results).toHaveLength(2);
			expect(results.validResults).toHaveLength(0);
			expect(results.invalidResults).toHaveLength(2);
		});
	});
});
