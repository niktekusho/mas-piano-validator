interface ValidationResult {
	status: boolean;
	errors: ajv.ErrorObject[];
	ok: () => boolean;
}

export function validate(obj: object): ValidationResult;
