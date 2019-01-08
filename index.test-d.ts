import {expectType} from 'tsd-check';
import validate, {ValidationResult, all} from '.';

expectType<ValidationResult>(validate('test'));

expectType<ValidationResult>(validate('test', {
	src: 'test'
}));

expectType<ValidationResult[]>(all(['test']));
