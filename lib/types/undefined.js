'use strict';

const Monadidator = require('..');

/**
 * @class UndefinedValidator
 * @extends Monadidator
 */
class UndefinedValidator extends Monadidator {}

Monadidator.UndefinedValidator = UndefinedValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * undefined, and fails otherwise, i.e. if the input satisfies the condition
 * `typeof input === 'undefined'`.
 *
 * @function undefined
 * @memberOf is
 * @static
 * @return {UndefinedValidator}
 */
Monadidator.is.undefined = Monadidator.mkType(UndefinedValidator, {
  predicate: (x) => typeof x === 'undefined',
  name: 'undefined',
});
