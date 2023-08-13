'use strict';

const Monadidator = require('.');
const {Empty, Leaf} = require('./tree');
const {DYNAMIC_PATH, EMPTY} = require('./symbols');

exports.every = function (index, name, toEntries, validator) {
  if (!(validator instanceof Monadidator))
    throw new TypeError('validator must be an instance of Monadidator');

  return this.and(
    new this.constructor((state, ok, err) => {
      const nerr = (_state) => {
        return err({
          ...state,
          expected: _state.expected.prefix(`where every ${name} is`),
        });
      };

      const nok = (entries, _state) => {
        const __state = {
          ...state,
          map: state.map || _state.map,
          expected: _state.expected.prefix(`where every ${name} is`),
        };
        if (__state.map) {
          __state.value = this.constructor[EMPTY]();
          for (const [key, value] of entries) {
            __state.value[key] = value;
          }
        }
        return ok(__state.value, __state);
      };

      return toEntries(state.value).reduce(
        (next, entry) => (xs, _state) => {
          const path = state.path.concat(index !== 1 ? DYNAMIC_PATH : entry[0]);
          return validator.unValidate(
            {
              ...state,
              path,
              value: entry[index],
              expected: new Empty({path}),
            },
            (x, __state) => {
              const newEntry = [...entry];
              newEntry[index] = x;
              return next([...xs, newEntry], {
                ...__state,
                map: _state.map || __state.map,
              });
            },
            nerr
          );
        },
        nok
      )([], {
        expected: new Empty(),
      });
    })
  );
};

exports.some = function (index, name, toEntries, validator) {
  if (!(validator instanceof Monadidator))
    throw new TypeError('validator must be an instance of Monadidator');

  return this.and(
    new this.constructor((state, ok, err) => {
      const empty = new Leaf({
        content: `with at least one ${name}`,
        ok: false,
        path: state.path,
        type: this.constructor,
      });

      const entries = toEntries(state.value);

      const nerr = (_state) => {
        return err({
          ...state,
          expected:
            _state.expected === empty
              ? empty
              : _state.expected.prefix(`where some ${name} is`),
        });
      };

      const nok = ([newEntry, oldEntry], _state) => {
        const __state = {
          ...state,
          map: state.map || _state.map,
          expected: _state.expected.prefix(`where some ${name} is`),
        };
        if (__state.map) {
          __state.value = this.constructor[EMPTY]();
          for (const [key, value] of entries) {
            if (key === oldEntry[0]) {
              __state.value[newEntry[0]] = newEntry[1];
            } else {
              __state.value[key] = value;
            }
          }
        }
        return ok(__state.value, __state);
      };

      return entries.reduceRight(
        (next, entry) => () => {
          const path = state.path.concat(DYNAMIC_PATH);
          return validator.unValidate(
            {
              ...state,
              path,
              value: entry[index],
              expected: new Empty({path}),
            },
            (x, _state) => {
              const newEntry = [...entry];
              newEntry[index] = x;
              return nok([newEntry, entry], _state);
            },
            next
          );
        },
        nerr
      )({
        expected: empty,
      });
    })
  );
};
