'use strict';

const Monadidator = require('..');

/**
 * @class FunctionValidator
 * @extends ObjectValidator
 */
class FunctionValidator extends Monadidator.ObjectValidator {}

Monadidator.FunctionValidator = FunctionValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * a function, and fails otherwise, i.e. if the input satisfies the condition
 * `typeof input === 'function'`.
 *
 * @function function
 * @memberOf is
 * @static
 * @return {FunctionValidator}
 */
Monadidator.is.function = Monadidator.mkType(FunctionValidator, {
  predicate: (x) => typeof x === 'function',
  name: 'a function',
});
