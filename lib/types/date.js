'use strict';

const Monadidator = require('..');

/**
 * @class DateValidator
 * @extends ObjectValidator
 */
class DateValidator extends Monadidator.ObjectValidator {
  /**
   * A type-restriction method that succeeds if the given input is a valid date,
   * and fails otherwise, i.e. if the input satisfies the condition
   * `Number.isFinite(input.valueOf())`.
   *
   * @category instance
   * @function valid
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  valid() {
    return this.and(
      this.constructor
        .satisfy((x) => Number.isFinite(x.valueOf()))
        .label('not Invalid Date')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is a an invalid
   * date, and fails otherwise, i.e. if the input satisfies the condition
   * `!Number.isFinite(input.valueOf())`.
   *
   * @category instance
   * @function invalid
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  invalid() {
    return this.and(
      this.constructor
        .satisfy((x) => !Number.isFinite(x.valueOf()))
        .label('Invalid Date')
    );
  }

  /**
   * A type-restriction method that succeeds if the input is greater than the
   * given `date`, and fails otherwise, i.e. if the input satisfies the
   * condition `input.valueOf() > date.valueOf()`.
   *
   * @category instance
   * @function "{gt,greater,greaterThan}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  gt(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.and(
      this.constructor
        .satisfy((x) => x.valueOf() > date.valueOf())
        .label(`greater than ${date.toJSON()}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the input is greater than or
   * equal to the given `date`, and fails otherwise, i.e. if the input satisfies
   * the condition `input.valueOf() >= date.valueOf()`.
   *
   * @category instance
   * @function "{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  gte(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.and(
      this.constructor
        .satisfy((x) => x.valueOf() >= date.valueOf())
        .label(`greater than or equal to ${date.toJSON()}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the input is equal to the given
   * `date`, and fails otherwise, i.e. if the input satisfies the condition
   * `input.valueOf() === date.valueOf()`.
   *
   * @category instance
   * @function "{eq,equal,equals,equalTo}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  eq(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.and(
      this.constructor
        .satisfy((x) => x.valueOf() === date.valueOf())
        .label(`equal to ${date.toJSON()}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the input is not equal to the
   * given `date`, and fails otherwise, i.e. if the input satisfies the
   * condition `input.valueOf() !== date.valueOf()`.
   *
   * @category instance
   * @function "{ne,notEqual,notEquals,notEqualTo}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  ne(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.not.eq(date);
  }

  /**
   * A type-restriction method that succeeds if the input is less than or equal
   * to the given `date`, and fails otherwise, i.e. if the input satisfies the
   * condition `input.valueOf() <= date.valueOf()`.
   *
   * @category instance
   * @function "{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  lte(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.and(
      this.constructor
        .satisfy((x) => x.valueOf() <= date.valueOf())
        .label(`less than or equal to ${date.toJSON()}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the input is less than the given
   * `date`, and fails otherwise, i.e. if the input satisfies the condition
   * `input.valueOf() < date.valueOf()`.
   *
   * @category instance
   * @function "{lt,less,lessThan}"
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  lt(date) {
    if (!(date instanceof Date))
      throw new TypeError('date must be an instance of Date');
    return this.and(
      this.constructor
        .satisfy((x) => x.valueOf() < date.valueOf())
        .label(`less than ${date.toJSON()}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is between the
   * given dates `min` and `max`, and fails otherwise.
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
   * @param {Date} min
   * @param {Date} max
   * @param {String} [inclusivity='[]']
   * @memberOf DateValidator
   * @return {DateValidator}
   */
  between(min, max, inclusivity = '[]') {
    if (!(min instanceof Date))
      throw new TypeError('min must be an instance of Date');
    if (!(max instanceof Date))
      throw new TypeError('max must be an instance of Date');

    const s = min.valueOf() < max.valueOf() ? min : max;
    const e = min.valueOf() < max.valueOf() ? max : min;

    let f;
    switch (inclusivity) {
      case '()':
        f = (x) => s.valueOf() < x.valueOf() && x.valueOf() < e.valueOf();
        break;
      case '(]':
        f = (x) => s.valueOf() < x.valueOf() && x.valueOf() <= e.valueOf();
        break;
      case '[)':
        f = (x) => s.valueOf() <= x.valueOf() && x.valueOf() < e.valueOf();
        break;
      case '[]':
        f = (x) => s.valueOf() <= x.valueOf() && x.valueOf() <= e.valueOf();
        break;
      default:
        throw new TypeError(
          "inclusivity must be either '()', '(]', '[)' or '[]'"
        );
    }

    return this.and(
      this.constructor
        .satisfy(f)
        .label(
          `between ${inclusivity[0]}${s.toJSON()}, ` +
            `${e.toJSON()}${inclusivity[1]}`
        )
    );
  }
}

DateValidator.prototype.greaterThan = DateValidator.prototype.greater =
  DateValidator.prototype.gt;

DateValidator.prototype.greaterThanOrEqualTo =
  DateValidator.prototype.greaterThanOrEquals =
  DateValidator.prototype.greaterThanOrEqual =
  DateValidator.prototype.greaterOrEqualTo =
  DateValidator.prototype.greaterOrEquals =
  DateValidator.prototype.greaterOrEqual =
    DateValidator.prototype.gte;

DateValidator.prototype.equalTo =
  DateValidator.prototype.equals =
  DateValidator.prototype.equal =
    DateValidator.prototype.eq;

DateValidator.prototype.notEqualTo =
  DateValidator.prototype.notEquals =
  DateValidator.prototype.notEqual =
    DateValidator.prototype.ne;

DateValidator.prototype.lessThanOrEqualTo =
  DateValidator.prototype.lessThanOrEquals =
  DateValidator.prototype.lessThanOrEqual =
  DateValidator.prototype.lessOrEquals =
  DateValidator.prototype.lessOrEqual =
    DateValidator.prototype.lte;

DateValidator.prototype.lessThan = DateValidator.prototype.less =
  DateValidator.prototype.lt;

Monadidator.DateValidator = DateValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * a date, and fails otherwise, i.e. if the input satisfies the condition
 * `input instanceof Date`.
 *
 * @function date
 * @memberOf is
 * @static
 * @return {DateValidator}
 */
Monadidator.is.date = Monadidator.mkType(DateValidator, {
  predicate: (x) => x instanceof Date,
  name: 'a date',
});
