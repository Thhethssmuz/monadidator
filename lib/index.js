'use strict';

const show = require('./show');
const {Empty, Leaf} = require('./tree');
const {NEGATE, EMPTY, CLONE} = require('./symbols');

/**
 * @private
 * @param {Node} err
 *
 * @param {Object} [options]
 * Options object.
 *
 * @param {string} [options.format='text']
 * How to format error trace, valid options are: 'text' or 'tree'.
 *
 * @param {function} [options.ErrorClass=TypeError]
 * A class instance that will be used to produce errors.
 *
 * @returns {option.ErrorClass}
 */
const mkError = (err, {format = 'text', ErrorClass = TypeError} = {}) => {
  let renderMethod = 'renderText';
  switch (format) {
    case 'text':
      renderMethod = 'renderText';
      break;
    case 'tree':
      renderMethod = 'renderTree';
      break;
    default:
      throw new TypeError(`invalid format option ${format}`);
  }

  const name = err.path[0];

  const trimmed = err.expected.trim();
  const property = trimmed.path.reduce((r, x) => r + show.accessor(x));
  const trace = trimmed[renderMethod]();

  let msg = `invalid ${name}, expected ${property} to be ${trace}`;
  if (trace.indexOf('\n') !== -1) msg += '\n';

  const error = new ErrorClass(msg);
  error.path = trimmed.path;
  error.property = property;
  error.expected = trace;
  error.actual = trimmed.path.slice(1).reduce((r, i) => r[i], err.value);

  return error;
};

/**
 * @class Monadidator
 */
class Monadidator {
  constructor(unValidate) {
    if (typeof unValidate !== 'function')
      throw new TypeError('unValidate must be a function');
    this.unValidate = unValidate;
  }

  /**
   * A function that returns a primitive validator that always fails with an
   * empty error.
   *
   * @ignore
   * @category static
   * @function empty
   * @memberOf Monadidator
   * @static
   * @return {Monadidator}
   */
  static empty() {
    return new Monadidator((state, ok, err) => err(state));
  }

  /**
   * A function that returns a simple validator that always succeeds yielding
   * the given value.
   *
   * @ignore
   * @category static
   * @function of
   * @memberOf Monadidator
   * @static
   * @param {*} x
   * @return {Monadidator}
   */
  static of(x) {
    return new this((state, ok) => ok(x, {...state, value: x, map: true}));
  }

  /**
   * A method that returns a new validator that behaves exactly like `this`
   * validator, but if `this` validator succeeds it applies the given function
   * to the result and yields the transformed result.
   *
   * Note that the `map` function will always return a validator of the same
   * type as before the transformation, such that you may continue to chain
   * methods as normal. However, this does not work if the transformation
   * function turns the value into a different type, then you need to explicitly
   * `and` (or `then`) the result with the new type in order to continue
   * chaining methods.
   *
   * @example
   * is.string()
   *   .map(x => x.trim())           // transform from string to string
   *   .matching(/^\d+$/)
   *   .map(x => parseInt(x, 10))    // transform from string to number
   *   .then(is
   *     .number()
   *     .between(0, 100));
   *
   * @category instance
   * @method map
   * @memberOf Monadidator
   * @param {function} f
   * @return {Monadidator}
   */
  map(f) {
    if (typeof f !== 'function') throw new TypeError('f must be a function');

    return new this.constructor((state, ok, err) => {
      let nok;

      if (state.async) {
        nok = async (x, _state) => {
          const _x = await f(x);
          return ok(_x, {
            ..._state,
            value: _x,
            map: true,
            expected: _state.expected.and(
              new Leaf({
                content: `map ${show(x)} -> ${show(_x)}`,
                ok: true,
                path: _state.path,
              })
            ),
          });
        };
      } else {
        nok = (x, _state) => {
          const _x = f(x);
          return ok(_x, {
            ..._state,
            value: _x,
            map: true,
            expected: _state.expected.and(
              new Leaf({
                content: `map ${show(x)} -> ${show(_x)}`,
                ok: true,
                path: _state.path,
              })
            ),
          });
        };
      }

      return this.unValidate(state, nok, err);
    });
  }

  chain(f) {
    if (typeof f !== 'function') throw new TypeError('f must be a function');

    return new this.constructor((state, ok, err) => {
      const nok = (x, _state) => {
        const merr = (__state) => {
          if (_state.expected === __state.expected) return err(__state);
          return err({
            ...__state,
            map: _state.map || __state.map,
            expected: _state.expected.and(__state.expected),
          });
        };
        const mok = (_x, __state) => {
          if (_state.expected === __state.expected) return ok(_x, __state);
          return ok(_x, {
            ...__state,
            map: _state.map || __state.map,
            expected: _state.expected.and(__state.expected),
          });
        };
        return f(x).unValidate(_state, mok, merr);
      };
      return this.unValidate(state, nok, err);
    });
  }

  /**
   * A method that returns a new validator that first tries to validate using
   * `this` validator, but if `this` fails tries to run the given `validator`.
   * Succeeds if either validator succeeds and fails otherwise.
   *
   * @category instance
   * @method "{or,concat}"
   * @memberOf Monadidator
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  or(validator) {
    if (!(validator instanceof Monadidator))
      throw new TypeError('validator must be an instance of Monadidator');

    return new Monadidator((state, ok, err) => {
      const nerr = (_state) => {
        const mok = (x, __state) =>
          ok(x, {...__state, expected: _state.expected.or(__state.expected)});
        const merr = (__state) =>
          err({...__state, expected: _state.expected.or(__state.expected)});
        return validator.unValidate(state, mok, merr);
      };
      return this.unValidate(state, ok, nerr);
    });
  }

  /**
   * A method that returns a new validator that first applies `this` validator
   * and then applies the given `validator`. Succeeds only if both validators
   * succeeds and fails otherwise.
   *
   * @category instance
   * @method "{and,then}"
   * @memberOf Monadidator
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  and(validator) {
    if (!(validator instanceof Monadidator))
      throw new TypeError('validator must be an instance of Monadidator');
    return this.chain(() => validator);
  }

  /**
   * A function that returns a new validator that succeeds if the given
   * `validator` fails and fails otherwise.
   *
   * @ignore
   * @category static
   * @function not
   * @memberOf Monadidator
   * @static
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  static not(validator) {
    if (!(validator instanceof Monadidator))
      throw new TypeError('validator must be an instance of Monadidator');

    return new this((state, ok, err) => {
      const nok = (x, _state) =>
        err({..._state, expected: _state.expected.not()});
      const nerr = (_state) =>
        ok(_state.value, {..._state, expected: _state.expected.not()});

      return validator.unValidate(state, nok, nerr);
    });
  }

  /**
   * A type-restriction method that succeeds if the given `validator` fails, and
   * fails otherwise. NOTE that this is not actually a function, but rather a
   * special `Proxy` object that behaves like both a function and an object.
   *
   * When used as an object it operates like a special negated version of
   * `this`. I.e. when used as an object it will have all the same
   * type-restrictions as are available on `this`, but where every
   * type-restriction is negated.
   *
   * When used as a function it will simply negate the given `validator`. NOTE
   * that this may not behave exactly like you might initially expect, for
   * example: the validator `is.any().not(is.number().lt(0))` is not equal to
   * the validator `is.number().not.lt(0)`! For example, when run on an input
   * value of type string, this value will be ok when run against the first
   * validator, but not the second. As the first will negate the whole validator
   * whereas the second will only negate the type-restriction `lt`. Thus for the
   * first the input is strictly `not (a number less than 0)` and will therefore
   * be ok, and for the second the number must be `a number && not less then 0`.
   *
   * @example
   * const v1 = is.any().not(is.number().lt(0));
   * const v2 = is.number().not.lt(0);
   *
   * v1.run('lol');     // ok
   * // v1.run(-1);     // throws
   * v1.run(1);         // ok
   *
   * // v2.run('lol');  // throws
   * // v2.run(-1);     // throws
   * v2.run(1);         // ok
   *
   * @category instance
   * @function not
   * @memberOf Monadidator
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  get not() {
    const f = (validator) => this.and(this.constructor.not(validator));
    if (!this.constructor[NEGATE]) return f;

    const p = new this.constructor[NEGATE](this.unValidate);
    return new Proxy(f, {
      get: (_, ...args) => Reflect.get(p, ...args),
    });
  }

  /**
   * A function that returns a new validator that fully validates the sub-
   * property given by `property` using the given `validator, and fails
   * otherwise. Yields the validated sub-property.
   *
   * @ignore
   * @category static
   * @function where
   * @memberOf Monadidator
   * @static
   * @param {*} property
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  static where(property, validator) {
    if (!(validator instanceof Monadidator))
      throw new TypeError('validator must be an instance of Monadidator');

    const _property = show(property);

    return new this((state, ok, err) => {
      const value =
        state.value === null || state.value === undefined
          ? undefined
          : state.value[property];

      const nerr = (_state) => {
        return err({
          ...state,
          map: _state.map,
          expected: _state.expected.prefix(`where ${_property} is`),
        });
      };

      const nok = (x, _state) => {
        return ok(x, {
          ...state,
          map: _state.map,
          expected: _state.expected.prefix(`where ${_property} is`),
        });
      };

      return validator.unValidate(
        {
          ...state,
          value,
          map: false,
          path: state.path.concat(property),
          expected: new Empty({path: state.path.concat(property)}),
        },
        nok,
        nerr
      );
    });
  }

  /**
   * A type-restriction method that succeeds if the current input has the
   * sub-property given by `property`, and the given `validator` succeeds when
   * run against the sub-property, and fails otherwise.
   *
   * @category instance
   * @function where
   * @memberOf Monadidator
   * @param {*} property
   * @param {Monadidator} validator
   * @return {Monadidator}
   */
  where(property, validator) {
    if (!(validator instanceof Monadidator))
      throw new TypeError('validator must be an instance of Monadidator');

    const where = this.constructor.where(property, validator);
    return this.and(
      new this.constructor((state, ok, err) => {
        const nok = (x, _state) => {
          const __state = {..._state};
          if (__state.map) {
            __state.value = this.constructor[CLONE](__state.value);
            __state.value[property] = x;
          }
          return ok(__state.value, __state);
        };
        return where.unValidate(state, nok, err);
      })
    );
  }

  /**
   * A function that returns a new validator that succeeds if the given
   * predicate function returns true for the current input, and fails otherwise.
   *
   * @ignore
   * @category static
   * @function satisfy
   * @memberOf Monadidator
   * @static
   * @param {function} predicate
   * @return {Monadidator}
   */
  static satisfy(predicate) {
    if (typeof predicate !== 'function')
      throw new TypeError('predicate must be a function');

    const name = predicate.name
      ? `function ${predicate.name}`
      : 'anonymous function';

    return new this((state, ok, err) => {
      if (!predicate(state.value)) return err(state);
      return ok(state.value, state);
    }).label(`satisfying ${name}`);
  }

  /**
   * A type-restriction method that succeeds if the given predicate function
   * returns true for the current input, and fails otherwise.
   *
   * @category instance
   * @function "{satisfy,satisfies,satisfying}"
   * @memberOf Monadidator
   * @param {function} predicate
   * @return {Monadidator}
   */
  satisfy(predicate) {
    if (typeof predicate !== 'function')
      throw new TypeError('predicate must be a function');
    return this.and(this.constructor.satisfy(predicate));
  }

  /**
   * A method that returns a new validator that behaves exactly like `this`
   * validator, but if `this` validator fails it replaces the expected error
   * message with the expected error `msg`.
   *
   * @category instance
   * @method label
   * @memberOf Monadidator
   * @param {string} msg
   * @return {Monadidator}
   */
  label(msg) {
    if (typeof msg !== 'string') throw new TypeError('msg must be a string');

    return new this.constructor((state, ok, err) => {
      const nerr = (_state) =>
        err({
          ..._state,
          expected: new Leaf({
            content: msg,
            ok: false,
            path: _state.path,
            type: this.constructor,
          }),
        });
      const nok = (x, _state) =>
        ok(x, {
          ..._state,
          expected: new Leaf({
            content: msg,
            ok: true,
            path: _state.path,
            type: this.constructor,
          }),
        });
      return this.unValidate(state, nok, nerr);
    });
  }

  /**
   * Execute a validator, i.e. run the validator against the given `input`.
   * Returns a transformed version of the input, if the validator contains any
   * transformations, i.e. if the validator uses the `map` method, when the
   * validator is successful and throws an error otherwise.
   *
   * @example
   * const v = is.string().match(/^\d+$/).map(x => parseInt(x, 10));
   * // v.run(123);   // => throws, expects a string
   * // v.run('lol'); // => throws, expects a string matching /^\d+$/
   * v.run('123');    // => ok, returns 123 (number)
   *
   * @category instance
   * @function "{run,validate}"
   * @memberOf Monadidator
   * @param {*} input
   * @param {string} [name='input']
   * @param {Object} [options]
   * @param {string} [options.format='text']
   * @param {function} [options.ErrorClass=TypeError]
   * @return {*}
   */
  run(input, name = 'input', options = {}) {
    const state = {
      value: input,
      path: [name],
      expected: new Empty({path: [name]}),
      async: false,
    };

    const [ok, err] = this.unValidate(
      state,
      (x) => [x, null],
      (e) => [null, e]
    );

    if (err) {
      throw mkError(err, options);
    }

    return ok;
  }

  /**
   * Async version of `run` that automatically awaits any asynchronous
   * transformations, ie. uses of the `map` method that return promises.
   *
   * @category instance
   * @function "{asyncRun,asyncValidate}"
   * @memberOf Monadidator
   * @param {*} input
   * @param {string} [name='input']
   * @param {Object} [options]
   * @param {string} [options.format='text']
   * @param {function} [options.ErrorClass=TypeError]
   * @return {Promise<*>}
   */
  asyncRun(input, name = 'input', options = {}) {
    return new Promise((resolve, reject) => {
      const state = {
        value: input,
        path: [name],
        expected: new Empty({path: [name]}),
        async: true,
      };

      this.unValidate(
        state,
        (x) => resolve(x),
        (err) => reject(mkError(err, options))
      );
    });
  }
}

Monadidator.prototype.concat = Monadidator.prototype.or;
Monadidator.prototype.then = Monadidator.prototype.and;
Monadidator.prototype.satisfying = Monadidator.prototype.satisfies =
  Monadidator.prototype.satisfy;
Monadidator.prototype.validate = Monadidator.prototype.run;
Monadidator.prototype.asyncValidate = Monadidator.prototype.asyncRun;

Monadidator[CLONE] = (x) => x;

/**
 * Helper function for creating type validators. Each type validator returns an
 * instance of some sub-class of Monadidator that contains all the
 * type-restriction methods that should be available for the type.
 *
 * Most notably this function will setup all the prerequisites for the `not`
 * proxy object to function correctly, as well as the `where` methods where
 * applicable.
 *
 * @category static
 * @function mkType
 * @memberOf Monadidator
 * @static
 *
 * @param {function} Cls
 * The class you want to turn into a type validator.
 *
 * @param {Object} options
 * Options object.
 *
 * @param {string} options.name
 * The name of the type to be used in the error output.
 *
 * @param {function} options.predicate
 * A predicate function that determines if the given value is of this type.
 *
 * @param {function} [options.clone]
 * A function that determines how to clone a value of the given type. This is
 * required for the `where` method to function correctly.
 *
 * @param {function} [option.empty]
 * A function that returns an empty value of the given type. This is required
 * for the `where.every` and `where.some` methods to function correctly.
 *
 * @return {function}
 * A function that returns a validator.
 */
Monadidator.mkType = function (Cls, {name, predicate, empty, clone} = {}) {
  if (!Cls || !(Cls.prototype instanceof Monadidator))
    throw new TypeError('Cls must be a class that extends Monadidator');
  if (typeof name !== 'string')
    throw new TypeError('options.name must be a string');
  if (typeof predicate !== 'function')
    throw new TypeError('options.predicate must be a function');

  const negatedClassName = 'Negated' + Cls.name;
  const NCls = {
    [negatedClassName]: class extends Cls {
      and(validator) {
        return super.and.call(
          new Cls(this.unValidate),
          Monadidator.not(validator)
        );
      }
    },
  }[negatedClassName];

  Cls[NEGATE] = NCls;
  NCls[NEGATE] = Cls;

  if (empty) {
    if (typeof empty !== 'function')
      throw new TypeError('options.empty must be a function');
    Cls[EMPTY] = empty;
  }

  if (clone) {
    if (typeof clone !== 'function')
      throw new TypeError('options.clone must be a function');
    Cls[CLONE] = clone;
  }

  return () => Cls.satisfy(predicate).label(name);
};

/**
 * Main object containing all type validators.
 * @type {Object}
 * @namespace {Object} is
 */
Monadidator.is = {};

Monadidator.Monadidator = Monadidator;

module.exports = Monadidator;

require('./types');
