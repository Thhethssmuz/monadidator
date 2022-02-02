'use strict';

const Monadidator = require('..');

/**
 * @class AnyValidator
 * @extends Monadidator
 */
class AnyValidator extends Monadidator {
  /**
   * A type-restriction method that succeeds if the given input is "nullish",
   * and fails otherwise, i.e. if the input satisfies the condition
   * `input == null`.
   *
   * @category instance
   * @function nullish
   * @memberOf AnyValidator
   * @return {AnyValidator}
   */
  nullish() {
    return this.and(
      this.constructor
        // eslint-disable-next-line no-eq-null, eqeqeq
        .satisfy((x) => x == null)
        .label('nullish')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is "truthy",
   * and fails otherwise, i.e. if the input satisfies the condition
   * `Boolean(input)`.
   *
   * @category instance
   * @function truthy
   * @memberOf AnyValidator
   * @return {AnyValidator}
   */
  truthy() {
    return this.and(
      this.constructor.satisfy((x) => Boolean(x)).label('truthy')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is "falsy",
   * and fails otherwise, i.e. if the input satisfies the condition
   * `!input`.
   *
   * @category instance
   * @function falsy
   * @memberOf AnyValidator
   * @return {AnyValidator}
   */
  falsy() {
    return this.and(this.constructor.satisfy((x) => !x).label('falsy'));
  }
}

Monadidator.AnyValidator = AnyValidator;

/**
 * A function that returns a new validator that always succeeds.
 *
 * @function "{any,anything}"
 * @memberOf is
 * @static
 * @return {AnyValidator}
 */
Monadidator.is.any = Monadidator.mkType(AnyValidator, {
  predicate: () => true,
  name: 'anything',
});

Monadidator.is.anything = Monadidator.is.any;
