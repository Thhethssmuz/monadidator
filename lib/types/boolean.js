'use strict';

const Monadidator = require('..');

/**
 * @class BooleanValidator
 * @extends Monadidator
 */
class BooleanValidator extends Monadidator {
  /**
   * A type-restriction method that succeeds if the given input is `true`, and
   * fails otherwise, i.e. if the input satisfies the condition
   * `input === true`.
   *
   * @category instance
   * @function true
   * @memberOf BooleanValidator
   * @return {BooleanValidator}
   */
  true() {
    return this.and(this.constructor.satisfy((x) => x === true).label('true'));
  }

  /**
   * A type-restriction method that succeeds if the given input is `false`, and
   * fails otherwise, i.e. if the input satisfies the condition
   * `input === false`.
   *
   * @category instance
   * @function false
   * @memberOf BooleanValidator
   * @return {BooleanValidator}
   */
  false() {
    return this.and(
      this.constructor.satisfy((x) => x === false).label('false')
    );
  }
}

Monadidator.BooleanValidator = BooleanValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * a boolean, and fails otherwise, i.e. if the input satisfies the condition
 * `typeof input === 'boolean'`.
 *
 * @function boolean
 * @memberOf is
 * @static
 * @return {BooleanValidator}
 */
Monadidator.is.boolean = Monadidator.mkType(BooleanValidator, {
  predicate: (x) => typeof x === 'boolean',
  name: 'a boolean',
});
