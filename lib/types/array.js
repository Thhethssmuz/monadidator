'use strict';

const Monadidator = require('..');
const {every, some} = require('../where');

const elemEntries = (xs) => [...Array.prototype.entries.call(xs)];

/**
 * @class ArrayValidator
 * @extends ObjectValidator
 */
class ArrayValidator extends Monadidator.ObjectValidator {
  get where() {
    /**
     * Inherited [`ObjectValidator.where`](#ObjectValidator.where).
     *
     * @category instance
     * @function where
     * @memberOf ArrayValidator
     * @param {*} property
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    const where = super.where;

    /**
     * Inherited [`ObjectValidator.where.every`](#ObjectValidator.where.every).
     *
     * @category instance
     * @type {Object}
     * @namespace {Object} ArrayValidator.where.every
     */

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all values in the input array, and fails otherwise. Note
     * that if the input has no values then this will always succeed.
     *
     * @category instance
     * @function "{elem,element}"
     * @memberOf ArrayValidator.where.every
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.every.elem = every.bind(this, 1, 'element', elemEntries);
    where.every.element = where.every.elem;

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all keys in the input array, and fails otherwise. Note
     * that if the input has no keys then this will always succeed.
     *
     * @category instance
     * @function key
     * @memberOf "ArrayValidator.where.every.{elem,element}"
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.every.element.key = every.bind(this, 0, 'element key', elemEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all values in the input array, and fails otherwise. Note
     * that if the input has no values then this will always succeed.
     *
     * @category instance
     * @function value
     * @memberOf "ArrayValidator.where.every.{elem,element}"
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.every.element.value = every.bind(
      this,
      1,
      'element value',
      elemEntries
    );

    /**
     * Inherited [`ObjectValidator.where.some`](#ObjectValidator.where.some).
     *
     * @category instance
     * @type {Object}
     * @namespace {Object} ArrayValidator.where.some
     */

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one value in the input array, and fails otherwise. Note that
     * if the input has no values then this will always fail.
     *
     * @category instance
     * @function "{elem,element}"
     * @memberOf ArrayValidator.where.some
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.some.element = some.bind(this, 1, 'element', elemEntries);
    where.some.elem = where.some.element;

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one key in the input array, and fails otherwise. Note that
     * if the input has no keys then this will always fail.
     *
     * @category instance
     * @function key
     * @memberOf "ArrayValidator.where.some.{elem,element}"
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.some.element.key = some.bind(this, 0, 'element key', elemEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one value in the input array, and fails otherwise. Note that
     * if the input has no values then this will always fail.
     *
     * @category instance
     * @function element
     * @memberOf "ArrayValidator.where.some.{elem,element}"
     * @param {ArrayValidator} validator
     * @return {ArrayValidator}
     */
    where.some.element.value = some.bind(this, 1, 'element value', elemEntries);

    return where;
  }
}

Monadidator.ArrayValidator = ArrayValidator;

const isArray = Monadidator.mkType(ArrayValidator, {
  predicate: (x) => Array.isArray(x),
  name: 'an array',
  empty: () => [],
  clone: (x) => Object.assign([], x),
});

/**
 * A function that returns a new validator that succeeds if the given input is
 * an array, and fails otherwise, i.e. if the input satisfies the condition
 * `Array.isArray(input)`.
 *
 * You may also pass a template, i.e.: an array of validators that will run
 * each validator in the template, against their corresponding value in the
 * array that is being validated according to their index. Note that when using
 * a template array a new array is yielded as the result containing only those
 * indexed elements present in the template array.
 *
 * @example
 * const v is.array([is.number().finite(), is.number().finite()]);
 * // v.run([1, 'lol']); // throws
 * v.run([1, 2]);        // ok
 *
 * @function array
 * @memberOf is
 * @static
 * @param {Array} [tmpl]
 * @return {ArrayValidator}
 */
Monadidator.is.array = (tmpl) => {
  if (!tmpl) return isArray();

  if (!Array.isArray(tmpl)) throw new TypeError('tmpl must be an array');

  const entries = elemEntries(tmpl);

  if (entries.some(([, inner]) => !(inner instanceof Monadidator)))
    throw new TypeError('tmpl must contain only instances of Monadidator');

  return entries
    .reduce((validator, [key, inner]) => {
      return validator.where(key, inner);
    }, isArray())
    .chain((r) => {
      const value = entries
        .map((x) => x[0])
        .reduce((x, key) => {
          x[key] = r[key];
          return x;
        }, []);
      return ArrayValidator.of(value);
    });
};
