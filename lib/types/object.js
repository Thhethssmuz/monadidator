'use strict';

const Monadidator = require('..');
const {every, some} = require('../where');

const enumEntries = (obj) => Object.entries(obj);
const symbolEntries = (obj) => {
  return Object.getOwnPropertySymbols(obj).map((sym) => [sym, obj[sym]]);
};
const allEntries = (obj) => enumEntries(obj).concat(symbolEntries(obj));

/**
 * @class ObjectValidator
 * @extends Monadidator
 */
class ObjectValidator extends Monadidator {
  /**
   * A type-restriction method that succeeds if the input is an instance of the
   * given class `Cls`, and fails otherwise, i.e. if the input satisfies the
   * condition `input instanceof Cls`.
   *
   * @category instance
   * @function "{instance,instanceof,instanceOf}"
   * @memberOf ObjectValidator
   * @return {ObjectValidator}
   */
  instanceof(Cls) {
    if (typeof Cls !== 'function') throw new TypeError('Cls must be a class');
    return this.and(
      this.constructor
        .satisfy((x) => x instanceof Cls)
        .label(`instance of ${Cls.name || 'anonymous class'}`)
    );
  }

  get where() {
    /**
     * A type-restriction method that succeeds if the current input has the
     * sub-property given by `property`, and the given `validator` succeeds when
     * run against the sub-property, and fails otherwise. Note that if the given
     * `validator` uses `map`, then a new object is yielded as the result.
     *
     * @category instance
     * @function where
     * @memberOf ObjectValidator
     * @param {*} property
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    const where = super.where.bind(this);

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} ObjectValidator.where.every
     */
    where.every = {};

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all keys (both enumerable and symbols) in the input
     * object, and fails otherwise. Note that if the input has no keys then this
     * will always succeed.
     *
     * @category instance
     * @function key
     * @memberOf ObjectValidator.where.every
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.key = every.bind(this, 0, 'key', allEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all values (both enumerable and symbols) in the input
     * object, and fails otherwise. Note that if the input has no values then
     * this will always succeed.
     *
     * @category instance
     * @function value
     * @memberOf ObjectValidator.where.every
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.value = every.bind(this, 1, 'value', allEntries);

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} "{enum,enumerable}"
     * @memberOf ObjectValidator.where.every
     */
    where.every.enumerable = {};
    where.every.enum = where.every.enumerable;

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all enumerable keys in the input object, and fails
     * otherwise. Note that if the input has no enumerable keys then this will
     * always succeed.
     *
     * @category instance
     * @function key
     * @memberOf "ObjectValidator.where.every.{enum,enumerable}"
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.enumerable.key = every.bind(
      this,
      0,
      'enumerable key',
      enumEntries
    );

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all enumerable values in the input object, and fails
     * otherwise. Note that if the input has no enumerable values then this will
     * always succeed.
     *
     * @category instance
     * @function value
     * @memberOf "ObjectValidator.where.every.{enum,enumerable}"
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.enumerable.value = every.bind(
      this,
      1,
      'enumerable value',
      enumEntries
    );

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} ObjectValidator.where.every.symbol
     */
    where.every.symbol = {};

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all symbol keys in the input object, and fails
     * otherwise. Note that if the input has no symbol keys then this will
     * always succeed.
     *
     * @category instance
     * @function key
     * @memberOf ObjectValidator.where.every.symbol
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.symbol.key = every.bind(this, 0, 'symbol key', symbolEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * when run against all symbol values in the input object, and fails
     * otherwise. Note that if the input has no symbol values then this will
     * always succeed.
     *
     * @category instance
     * @function value
     * @memberOf ObjectValidator.where.every.symbol
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.every.symbol.value = every.bind(
      this,
      1,
      'symbol value',
      symbolEntries
    );

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} ObjectValidator.where.some
     */
    where.some = {};

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one key (either enumerable or symbol), in the input object,
     * and fails otherwise. Note that if the input has no keys then this will
     * always fail.
     *
     * @category instance
     * @function key
     * @memberOf ObjectValidator.where.some
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.key = some.bind(this, 0, 'key', allEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one value (either enumerable or symbol), in the input
     * object, and fails otherwise. Note that if the input has no values then
     * this will always fail.
     *
     * @category instance
     * @function value
     * @memberOf ObjectValidator.where.some
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.value = some.bind(this, 1, 'value', allEntries);

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} "{enum,enumerable}"
     * @memberOf ObjectValidator.where.some
     */
    where.some.enumerable = {};
    where.some.enum = where.some.enumerable;

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one enumerable key, in the input object, and fails
     * otherwise. Note that if the input has no enumerable keys then this will
     * always fail.
     *
     * @category instance
     * @function key
     * @memberOf "ObjectValidator.where.some.{enum,enumerable}"
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.enumerable.key = some.bind(
      this,
      0,
      'enumerable key',
      enumEntries
    );

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one enumerable value, in the input object, and fails
     * otherwise. Note that if the input has no enumerable values then this will
     * always fail.
     *
     * @category instance
     * @function value
     * @memberOf "ObjectValidator.where.some.{enum,enumerable}"
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.enumerable.value = some.bind(
      this,
      1,
      'enumerable value',
      enumEntries
    );

    /**
     * @category instance
     * @type {Object}
     * @namespace {Object} ObjectValidator.where.some.symbol
     */
    where.some.symbol = {};

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one symbol key, in the input object, and fails otherwise.
     * Note that if the input has no symbol keys then this will always fail.
     *
     * @category instance
     * @function key
     * @memberOf ObjectValidator.where.some.symbol
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.symbol.key = some.bind(this, 0, 'symbol key', symbolEntries);

    /**
     * A type-restriction method that succeeds if the given `validator` succeeds
     * for at least one symbol value, in the input object, and fails otherwise.
     * Note that if the input has no symbol values then this will always fail.
     *
     * @category instance
     * @function value
     * @memberOf ObjectValidator.where.some.symbol
     * @param {ObjectValidator} validator
     * @return {ObjectValidator}
     */
    where.some.symbol.value = some.bind(this, 1, 'symbol value', symbolEntries);

    return where;
  }
}

ObjectValidator.prototype.instanceOf = ObjectValidator.prototype.instance =
  ObjectValidator.prototype.instanceof;

Monadidator.ObjectValidator = ObjectValidator;

const isObject = Monadidator.mkType(ObjectValidator, {
  predicate: (x) => x !== null && typeof x === 'object',
  name: 'an object',
  empty: () => ({}),
  clone: (x) => ({...x}),
});

/**
 * A function that returns a new validator that succeeds if the given input is
 * an object, and fails otherwise, i.e. if the input satisfies the condition
 * `input !== null && typeof input === 'object'`. Note that unlike the normal
 * JavaScript `typeof` operator Monadidator does not interpret `null` as an
 * object.
 *
 * You may also pass a template, i.e.: an object of validators that will run
 * each validator in the template, against their corresponding value in the
 * input that is being validated according to their key. Note that when using a
 * template object a new object is yielded as the result containing only those
 * properties present in the template object.
 *
 * @example
 * const v = is.object({x: is.number().finite(), y: is.number().finite()});
 * // v.run({x: 1, y: 'lol'}); // throws
 * v.run({x: 1, y: 2});        // ok
 *
 * @function object
 * @memberOf is
 * @static
 * @param {Object} [tmpl]
 * @return {ObjectValidator}
 */
Monadidator.is.object = (tmpl) => {
  if (!tmpl) return isObject();

  if (!(tmpl instanceof Object)) throw new TypeError('tmpl must be an object');

  const entries = allEntries(tmpl);

  if (entries.some(([, inner]) => !(inner instanceof Monadidator)))
    throw new TypeError('tmpl must contain only instances of Monadidator');

  return entries.reduce(
    (validator, [key, inner]) => {
      return validator.chain((r) =>
        ObjectValidator.where(key, inner).chain((x) => {
          return new ObjectValidator((state, ok) => {
            return ok({...r, [key]: x}, {...state, map: true});
          });
        })
      );
    },
    isObject().chain(() => new ObjectValidator((state, ok) => ok({}, state)))
  );
};
