'use strict';

const show = require('../show');
const Monadidator = require('..');

/**
 * @class StringValidator
 * @extends Monadidator
 */
class StringValidator extends Monadidator {
  /**
   * A type-restriction method that succeeds if the given input is empty, and
   * fails otherwise, i.e. if the input satisfies the condition
   * `input.length === 0`.
   *
   * @category instance
   * @function empty
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  empty() {
    return this.and(
      this.constructor.satisfy((x) => x.length === 0).label('empty')
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is matches the
   * given regular expression `r`, and fails otherwise, i.e. if the input
   * satisfies the condition `r.test(input)`.
   *
   * @category instance
   * @function "{match,matches,matching}"
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  match(r) {
    if (!(r instanceof RegExp))
      throw new TypeError('r must be an instance of RegExp');
    return this.and(
      this.constructor
        .satisfy((x) => r.test(x))
        .label(`matching ${show.regexp(r)}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input contains the
   * given substring `str`, and fails otherwise, i.e. if the input satisfies the
   * condition `input.indexOf(str) !== -1`.
   *
   * @category instance
   * @function "{contain,contains,containing}"
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  contain(str) {
    if (typeof str !== 'string') throw new TypeError('str must be a string');
    return this.and(
      this.constructor
        .satisfy((x) => x.indexOf(str) !== -1)
        .label(`containing ${show.string(str)}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is equal to the
   * given string `str`, and fails otherwise, i.e. if the input satisfies the
   * condition `input === str`.
   *
   * @category instance
   * @function "{eq,equal,equals,equalTo}"
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  eq(str) {
    if (typeof str !== 'string') throw new TypeError('str must be a string');
    return this.and(
      this.constructor
        .satisfy((x) => x === str)
        .label(`equal to ${show.string(str)}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is not equal to
   * the given string `str`, and fails otherwise, i.e. if the input satisfies
   * the condition `input !== str`.
   *
   * @category instance
   * @function "{ne,notEqual,notEquals,notEqualTo}"
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  ne(str) {
    if (typeof str !== 'string') throw new TypeError('str must be a string');
    return this.and(
      this.constructor
        .satisfy((x) => x !== str)
        .label(`not equal to ${show.string(str)}`)
    );
  }

  /**
   * A type-restriction method that succeeds if the given input is in the
   * supplied list of strings `xs`, and fails otherwise, i.e. if the input
   * satisfies the condition `xs.includes(input)`.
   *
   * @category instance
   * @function "{in,elem,elemOf,element,elementOf}"
   * @memberOf StringValidator
   * @return {StringValidator}
   */
  in(xs) {
    if (!Array.isArray(xs)) throw new TypeError('xs must be an array');
    if (xs.some((x) => typeof x !== 'string'))
      throw new TypeError('xs must contain only strings');

    return this.and(
      this.constructor.satisfy((x) => xs.includes(x)).label(`in ${show(xs)}`)
    );
  }
}

StringValidator.prototype.matching = StringValidator.prototype.matches =
  StringValidator.prototype.match;

StringValidator.prototype.containing = StringValidator.prototype.contains =
  StringValidator.prototype.contain;

StringValidator.prototype.equalTo =
  StringValidator.prototype.equals =
  StringValidator.prototype.equal =
    StringValidator.prototype.eq;

StringValidator.prototype.notEqualTo =
  StringValidator.prototype.notEquals =
  StringValidator.prototype.notEqual =
    StringValidator.prototype.ne;

StringValidator.prototype.elementOf =
  StringValidator.prototype.element =
  StringValidator.prototype.elemOf =
  StringValidator.prototype.elem =
    StringValidator.prototype.in;

Monadidator.StringValidator = StringValidator;

/**
 * A function that returns a new validator that succeeds if the given input is
 * a string, and fails otherwise, i.e. if the input satisfies the condition
 * `typeof input === 'string'`.
 *
 * @function string
 * @memberOf is
 * @static
 * @return {StringValidator}
 */
Monadidator.is.string = Monadidator.mkType(StringValidator, {
  predicate: (x) => typeof x === 'string',
  name: 'a string',
});
