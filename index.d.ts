/**
 * Metadata object interface.
 */
interface ObjectSource {
	/**
	 * Optional source of the object being validated (best example would be a file path).
	 */
	src?: string;
};

/**
 * Validation results.
 */
interface ValidationResult {
	/**
	 * If true, the object is a valid Monika After Story piano song. False otherwise.
	 */
	ok: boolean;
	/**
	 * Array of errors caught by the validator. If ok === true than this is an empty array.
	 */
	errors: ajv.ErrorObject[];
	/**
	 * Metadata object.
	 */
	meta: ObjectSource;
};

/**
 * Perform JSON schema validation to the specified object.
 * @param obj Required object to check. If of type string, JSON.parse will be called.
 * @param meta Optional object, useful for "signing" the particular validation with an id.
 */
export default function validate(obj: object|string, meta?: ObjectSource): ValidationResult;
