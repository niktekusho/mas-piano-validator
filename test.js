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

		it('when passing \'string\' argument should try to parse passed string like a JSON file', () => {
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

		it('when passing \'string\' argument should try to load the file in case the string is not a valid JSON literal', () => {
			const testString = '{something: "very similar", "to": \'a valid JSON\'';

			const result = validate(testString);
			expect(result.ok).toStrictEqual(false);
			expect(result.errors).toHaveLength(1);
			// Match the error message
			expect(result.errors[0]).toMatch(/not.*valid json literal/i);
		});
	});

	describe('when using the \'all\' API', () => {
		it('should signal the user if the passed argument is not an array', () => {
			expect(() => validate.all({})).toThrowError(/.*received.*object$/mi);
			expect(() => validate.all('a')).toThrowError(/.*received.*string$/mi);
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

	describe('when using the prettify API', () => {
		it('should throw a \'TypeError\' when passing something which is not a ValidationResult instance', () => {
			expect(() => validate.prettify(undefined)).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify(null)).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify({})).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify('string')).toThrowError(expect.any(TypeError));
		});

		it('should return the same string as the \'prettify()\' method in the ValidationResult class', () => {
			const example = new MinimalExample();
			const result = validate(example);
			const instanceMsg = result.prettify();
			const apiMsg = validate.prettify(result);
			expect(instanceMsg).toStrictEqual(apiMsg);
		});

		it('should be able to create a readable message from the ValidationResult (with valid input and with source info)', () => {
			const example = new MinimalExample();
			const prettyMsg = validate(example).prettify(true);
			expect(prettyMsg).toMatch(/(.*)( - )(.*valid.*song)/i);
		});

		it('should be able to create a readable message from the ValidationResult (with valid input and without source info)', () => {
			const example = new MinimalExample();
			const prettyMsg = validate(example).prettify();
			expect(prettyMsg).toMatch(/.*valid.*song/i);
		});

		it('should be able to create a readable message from the ValidationResult (with invalid input)', () => {
			const example = new MinimalExample({enableName: false});
			const prettyMsg = validate(example).prettify();
			expect(prettyMsg).toMatch(/.*not.*valid.*song/i);
		});

		it('should throw a \'TypeError\' when at least one of the input is not a ValidationResult instance', () => {
			const baseValidArray = [new MinimalExample()];
			expect(() => validate.prettify([...baseValidArray, undefined])).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify([...baseValidArray, null])).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify([...baseValidArray, {}])).toThrowError(expect.any(TypeError));
			expect(() => validate.prettify([...baseValidArray, 'string'])).toThrowError(expect.any(TypeError));
		});

		it('should create a singleline message from various ValidationResults when all input are valid', () => {
			const exampleData = [
				{
					content: new MinimalExample(), meta: {
						src: 'test1'
					}
				},
				{
					content: new MinimalExample(), meta: {
						src: 'test2'}
				}
			];
			const results = validate.all(exampleData);
			expect(validate.prettify(results)).toMatch(/.*all.*valid.*songs/i);
		});

		it('should create a multiline message from various ValidationResults when at least one input is not valid', () => {
			const exampleData = [
				{
					content: new MinimalExample({enablePnmList: false}), meta: {
						src: 'test1'
					}
				},
				{
					content: new MinimalExample({}), meta: {
						src: 'test2'}
				}
			];
			const results = validate.all(exampleData);
			// The s regex flag allows '.' to match newlines too
			expect(validate.prettify(results)).toMatch(/.*some.*not valid.*songs.*details:.*/is);
		});
	});
});
