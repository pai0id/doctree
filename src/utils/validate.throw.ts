import { validate, ValidationOptions, ValidationError } from "class-validator";

export class ObjectValidationError extends Error {
	constructor(public errors: ValidationError[]) {
		super(errors.map((err) => err.toString()).join(","));
	}
}

export function ValidateObject(object: object);
export function ValidateObject(object: object, options: ValidationOptions);
export function ValidateObject(object: object, options?: ValidationOptions) {
	validate(object, options).then((errors) => {
		if (errors.length > 0) {
			throw new ObjectValidationError(errors);
		}
	});
}
