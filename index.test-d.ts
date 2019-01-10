import {expectType} from 'tsd-check';
import validate, {ValidationResult, all, ValidationResultsContainer} from '.';

expectType<ValidationResult>(validate('test'));

expectType<ValidationResult>(validate('test', {
	src: 'test'
}));

expectType<ValidationResultsContainer>(all(['test']));
