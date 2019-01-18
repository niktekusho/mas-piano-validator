import {expectType} from 'tsd-check';
import validate, {ValidationResult, all, ValidationResultsContainer, ValidationInputContainer} from '.';

expectType<ValidationResult>(validate('test'));

expectType<ValidationResult>(validate('test', {
	src: 'test'
}));

const container = new ValidationInputContainer();
container.add('test', 'test');

expectType<ValidationResultsContainer>(all(container));
