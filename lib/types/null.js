'use strict';

const Monadidator = require('..');

/**
 * @class NullValidator
 * @extends Monadidator
 */
class NullValidator extends Monadidator {}

Monadidator.NullValidator = NullValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * null, and fails otherwise, i.e. if the input satisfies the condition
 * `input === null`.
 *
 * @function null
 * @memberOf is
 * @static
 * @return {NullValidator}
 */
Monadidator.is.null = Monadidator.mkType(NullValidator, {
  predicate: (x) => x === null,
  name: 'null',
});
