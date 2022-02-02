'use strict';

const MIN_LIMIT = 16;

const stringLookupMap = {
  0: '\\0',
  8: '\\b',
  9: '\\t',
  10: '\\n',
  11: '\\v',
  12: '\\f',
  13: '\\r',
  39: "\\'",
  92: '\\\\',
};

const escapeRegexp = /[\x00-\x1f\x27\x5c\x7f-\x9f]/g;
const identifierRegexp = /^[$A-Za-z_][$A-Za-z_0-9]*$/;

const escapeChar = (x) => {
  const i = x.charCodeAt();
  if (stringLookupMap[i]) return stringLookupMap[i];
  return '\\x' + i.toString(16).padStart(2, '0');
};

module.exports = (x, limit = 80) => {
  if (x === null) return 'null';

  if (typeof x === 'bigint') return String(x) + 'n';
  if (typeof x === 'string') return module.exports.string(x, limit);
  if (typeof x === 'symbol') return module.exports.symbol(x, limit);
  if (typeof x === 'function') return module.exports.fn(x, limit);
  if (typeof x !== 'object') return String(x);

  if (Array.isArray(x)) return module.exports.array(x, limit);
  if (x instanceof Date) return module.exports.date(x, limit);
  if (x instanceof RegExp) return module.exports.regexp(x, limit);

  return module.exports.object(x, limit);
};

module.exports.string = (str, limit = 80) => {
  const esc = Array.from(str.slice(0, limit)).map((x) =>
    x.replace(escapeRegexp, escapeChar)
  );

  let length = esc.reduce((l, x) => l + x.length, 2);
  if (length <= limit) return `'${esc.join('')}'`;

  length += 3;

  while (length > limit && esc.length) {
    length -= esc.pop().length;
  }

  return `'${esc.join('')}'...`;
};

module.exports.symbol = (symbol, limit = 80) => {
  return `Symbol(${module.exports.string(symbol.description, limit - 8)})`;
};

module.exports.array = (xs, limit = 80) => {
  const escs = [];

  let rem = limit - 2;
  for (let i = 0, l = xs.length - 1; i <= l; i += 1) {
    const esc0 = module.exports(xs[i], Math.max(MIN_LIMIT, rem));
    rem -= esc0.length;

    // if this is the last element we don't have to consider the length of
    // either the comma separator ', ' nor the continuation pattern: '...'
    if (i === l && rem >= 0) {
      escs.push(esc0);
      break;
    }

    // ...for the comma separator ', '
    rem -= 2;

    if (rem < 3) {
      // if this is the penultimate element then lookahead in case the next
      // element is less then or equal to the length of the continuation
      // pattern: '...'
      if (i === l - 1) {
        const esc1 = module.exports(xs[i + 1], Math.max(MIN_LIMIT, rem));
        if (esc1.length <= rem) {
          escs.push(esc0);
          escs.push(esc1);
          break;
        }
      }

      escs.push('...');
      break;
    }

    escs.push(esc0);
  }

  return `[${escs.join(', ')}]`;
};

module.exports.date = (date) => {
  if (!Number.isFinite(date.valueOf())) return 'Invalid Date';
  return date.toJSON();
};

module.exports.regexp = (regexp, limit = 80) => {
  const esc = String(regexp);
  if (esc.length <= limit) return esc;
  const flags = regexp.flags;
  return esc.slice(0, Math.max(1, limit - 6 - flags.length)) + '/... /' + flags;
};

module.exports.accessor = (prop, limit = 80) => {
  // Numeric accessors are actually coerced to strings, but meh...
  if (typeof prop === 'number' && Number.isInteger(prop) && prop >= 0)
    return `[${String(prop, limit)}]`;

  if (typeof prop === 'symbol')
    return `[${module.exports.symbol(prop, limit - 2)}]`;

  if (typeof prop !== 'string')
    return module.exports.accessor(String(prop), limit);

  if (identifierRegexp.test(prop) && prop.length <= limit - 1)
    return '.' + prop;

  return `[${module.exports.string(prop, limit)}]`;
};

module.exports.objectKey = (prop, limit = 80) => {
  if (typeof prop === 'symbol')
    return `[${module.exports.symbol(prop, limit - 2)}]`;

  if (typeof prop !== 'string')
    return module.exports.objectKey(String(prop), limit);

  if (!identifierRegexp.test(prop) || prop.length > limit)
    return module.exports.string(prop, limit);

  return prop;
};

module.exports.object = (obj, limit = 80) => {
  const escs = [];

  const proto = Object.getPrototypeOf(obj);
  let name = '';
  if (!proto) {
    name = '[Object: null prototype] ';
  } else if (proto.constructor !== Object) {
    name = proto.constructor.name + ' ';
  }

  let rem = limit - name.length - 2;
  const keys = Object.getOwnPropertyNames(obj).concat(
    Object.getOwnPropertySymbols(obj)
  );

  for (let i = 0, l = keys.length - 1; i <= l; i += 1) {
    const key = keys[i];
    const desc = Object.getOwnPropertyDescriptor(obj, key);

    const esck0 = module.exports.objectKey(key, Math.max(MIN_LIMIT, rem));
    rem -= esck0.length + 2;

    let escv0;
    if (Object.hasOwn(desc, 'value')) {
      escv0 = module.exports(desc.value, Math.max(MIN_LIMIT, rem));
    } else {
      escv0 =
        '[' +
        [desc.get && 'Getter', desc.set && 'Setter']
          .filter((x) => x)
          .join('/') +
        ']';
    }
    rem -= escv0.length;

    const esc0 = esck0 + ': ' + escv0;

    // if this is the last element we don't have to consider the length of
    // either the comma separator ', ' nor the continuation pattern: '...'
    if (i === l && rem >= 0) {
      escs.push(esc0);
      break;
    }

    // ...for the comma separator ', '
    rem -= 2;

    if (rem < 3) {
      escs.push('...');
      break;
    }

    escs.push(esc0);
  }

  return `${name}{${escs.join(', ')}}`;
};

module.exports.fn = (fn) => {
  if (!fn.name) return '[Function (anonymous)]';
  return `[Function: ${fn.name}]`;
};
