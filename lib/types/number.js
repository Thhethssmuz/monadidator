'use strict';

const show = require('../show');
const Monadidator = require('..');

/**
 * @class NumberValidator
 * @extends Monadidator
 */
class NumberValidator extends Monadidator {
  /**
   * A type-restriction method that succeeds if the given input is `NaN`, and
   * fails otherwise, i.e. if the input satisfies the condition
   * `Number.isNaN(input)`.
   *
   * @category instance
   * @function "{nan,NaN}"
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  nan() {
    return this.and(
      this.constructor.satisfy((x) => Number.isNaN(x)).label('NaN')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is finite, and
   * fails otherwise, i.e. if the input satisfies the condition
   * `Number.isFinite(input)`.
   *
   * @category instance
   * @function finite
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  finite() {
    return this.and(
      this.constructor.satisfy((x) => Number.isFinite(x)).label('finite')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is greater than
   * the given number `n`, and fails otherwise, i.e. if the input satisfies the
   * condition `input > n`.
   *
   * @category instance
   * @function "{gt,greater,greaterThan}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  gt(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.and(
      this.constructor.satisfy((x) => x > n).label(`greater than ${n}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is greater than
   * or equal to the given number `n`, and fails otherwise, i.e. if the input
   * satisfies the condition `input >= n`.
   *
   * @category instance
   * @function "{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  gte(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.and(
      this.constructor
        .satisfy((x) => x >= n)
        .label(`greater than or equal to ${n}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is equal to the
   * given number `n`, and fails otherwise, i.e. if the input satisfies the
   * condition `input === n`.
   *
   * @category instance
   * @function "{eq,equal,equals,equalTo}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  eq(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.and(
      this.constructor.satisfy((x) => x === n).label(`equal to ${n}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is not equal to
   * the given number `n`, and fails otherwise, i.e. if the input satisfies the
   * condition `input !== n`.
   *
   * @category instance
   * @function "{ne,notEqual,notEquals,notEqualTo}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  ne(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.not.eq(n);
  }

  /**
   * A type-restriction method that succeeds if the given input is less then or
   * equal to the given number `n`, and fails otherwise, i.e. if the input
   * satisfies the condition `input <= n`.
   *
   * @category instance
   * @function "{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  lte(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.and(
      this.constructor
        .satisfy((x) => x <= n)
        .label(`less than or equal to ${n}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is less then the
   * given number `n`, and fails otherwise, i.e. if the input satisfies the
   * condition `input < n`.
   *
   * @category instance
   * @function "{lt,less,lessThan}"
   * @param {Number} n
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  lt(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    return this.and(
      this.constructor.satisfy((x) => x < n).label(`less than ${n}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is between the
   * given numbers `min` and `max`, and fails otherwise.
   *
   * The `min` and `max` parameters are not strictly ordered, so if `min` are
   * larger than `max` then the inputs are swapped. Furthermore the
   * `inclusivity` controls if the range includes the `min` and `max` values,
   * i.e.:
   *
   * | **Inclusivity**` | **Condition**                   |
   * |:-----------------|:--------------------------------|
   * | `'()'`           |  `min <  input && input <  max` |
   * | `'(]'`           |  `min <  input && input <= max` |
   * | `'[)'`           |  `min <= input && input <  max` |
   * | `'[]'`           |  `min <= input && input <= max` |
   *
   * @category instance
   * @function between
   * @param {Number} min
   * @param {Number} max
   * @param {String} [inclusivity='[]']
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  between(min, max, inclusivity = '[]') {
    if (typeof min !== 'number') throw new TypeError('min must be a number');
    if (typeof max !== 'number') throw new TypeError('max must be a number');

    const s = Math.min(min, max);
    const e = Math.max(min, max);

    let f;
    switch (inclusivity) {
      case '()':
        f = (x) => s < x && x < e;
        break;
      case '(]':
        f = (x) => s < x && x <= e;
        break;
      case '[)':
        f = (x) => s <= x && x < e;
        break;
      case '[]':
        f = (x) => s <= x && x <= e;
        break;
      default:
        throw new TypeError(
          "inclusivity must be either '()', '(]', '[)' or '[]'"
        );
    }

    return this.and(
      this.constructor
        .satisfy(f)
        .label(`between ${inclusivity[0]}${s}, ${e}${inclusivity[1]}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is in the
   * given list of numbers `ns`, and fails otherwise, i.e. if the input
   * satisfies the condition `ns.includes(input)`.
   *
   * @category instance
   * @function "{in,elem,elemOf,element,elementOf}"
   * @param {Number[]} ns
   * @memberOf NumberValidator
   * @return {NumberValidator}
   */
  in(ns) {
    if (!Array.isArray(ns)) throw new TypeError('ns must be an array');
    if (ns.some((n) => typeof n !== 'number'))
      throw new TypeError('ns must contain only numbers');

    return this.and(
      this.constructor.satisfy((x) => ns.includes(x)).label(`in ${show(ns)}`)
    );
  }
}

NumberValidator.prototype.NaN = NumberValidator.prototype.nan;

NumberValidator.prototype.greaterThan = NumberValidator.prototype.greater =
  NumberValidator.prototype.gt;

NumberValidator.prototype.greaterThanOrEqualTo =
  NumberValidator.prototype.greaterThanOrEquals =
  NumberValidator.prototype.greaterThanOrEqual =
  NumberValidator.prototype.greaterOrEqualTo =
  NumberValidator.prototype.greaterOrEquals =
  NumberValidator.prototype.greaterOrEqual =
    NumberValidator.prototype.gte;

NumberValidator.prototype.equalTo =
  NumberValidator.prototype.equals =
  NumberValidator.prototype.equal =
    NumberValidator.prototype.eq;

NumberValidator.prototype.notEqualTo =
  NumberValidator.prototype.notEquals =
  NumberValidator.prototype.notEqual =
    NumberValidator.prototype.ne;

NumberValidator.prototype.lessThanOrEqualTo =
  NumberValidator.prototype.lessThanOrEquals =
  NumberValidator.prototype.lessThanOrEqual =
  NumberValidator.prototype.lessOrEquals =
  NumberValidator.prototype.lessOrEqual =
    NumberValidator.prototype.lte;

NumberValidator.prototype.lessThan = NumberValidator.prototype.less =
  NumberValidator.prototype.lt;

NumberValidator.prototype.elementOf =
  NumberValidator.prototype.element =
  NumberValidator.prototype.elemOf =
  NumberValidator.prototype.elem =
    NumberValidator.prototype.in;

Monadidator.NumberValidator = NumberValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * a number, and fails otherwise, i.e. if the input satisfies the condition
 * `typeof input === 'number'`.
 *
 * @function number
 * @memberOf is
 * @static
 * @return {NumberValidator}
 */
Monadidator.is.number = Monadidator.mkType(NumberValidator, {
  predicate: (x) => typeof x === 'number',
  name: 'a number',
});
