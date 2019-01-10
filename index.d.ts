import * as ajv from "ajv";

/**
 * Metadata object interface.
 */
export interface ObjectSource {
	/**
	 * Optional source of the object being validated (best example would be a file path).
	 */
	src?: string
}

/**
 * Complex object that allows each validation results to be mapped with the ObjectSource.
 */
export interface ValidationItem {
	/**
	 * Object to check. If of type string, JSON.parse will be called.
	 */
	content: string|object,
	/**
	 * Source of the object being validated.
	 */
	meta: ObjectSource
}

/**
 * Validation result.
 * This kind of object includes an ok flag (true means the object is a valid Monika After Story piano song),
 * an errors array (directly from ajv) and an ObjectSource instance for tracking the source of this validation result.
 */
export interface ValidationResult {
	/**
	 * Array of errors caught by the validator. If ok === true than this is an empty array.
	 */
	errors: ajv.ErrorObject[],
	/**
	 * Metadata object.
	 */
	meta: ObjectSource,
	/**
	 * If true, the object is a valid Monika After Story piano song. False otherwise.
	 */
	ok: boolean,
	/**
	 * Brief description about the result of this validation.
	 */
	summary: string
}

/**
 * Container of multiple `ValidationResult`s.
 * This kind of object includes an ok flag (true means all the ValidationResults are valid Monika After Story piano songs),
 * a results array containing the `ValidationResult` instances.
 */
export interface ValidationResultsContainer {
	/**
	 * If true, all the ValidationResults are valid Monika After Story piano songs. False otherwise.
	 */
	ok: boolean,
	/**
	 * Array of all the ValidationResult objects.
	 */
	results: ValidationResult[],
	/**
	 * Brief sentence describing the aggregated validation state.
	 */
	summary: string,
	/**
	 * Array of only valid ValidationResult objects.
	 */
	validResults: ValidationResult[],
	/**
	 * Array of only invalid ValidationResult objects.
	 */
	invalidResults: ValidationResult[]
}

/**
 * Perform JSON schema validation to the specified object.
 * @param obj Required object to check. If of type string, JSON.parse will be called.
 * @param meta Optional object, useful for "signing" the particular validation with an id.
 */
export default function validate(obj: string|object, meta?: ObjectSource): ValidationResult;

/**
 * Perform validation on every object specified.
 * @param obj Array of object to be validated.
 *
 * @example
 *
 * import {all} from 'mas-piano-validator';
 *
 * all(...);
 */
export function all(obj: string[]|ValidationItem[]|object[]): ValidationResultsContainer;
