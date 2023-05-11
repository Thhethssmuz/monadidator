'use strict';

const Monadidator = require('..');

/**
 * @class UrlValidator
 * @extends Monadidator
 */
class UrlValidator extends Monadidator.ObjectValidator {}

Monadidator.UrlValidator = UrlValidator;

const isUrl = Monadidator.mkType(UrlValidator, {
  predicate: (x) => x instanceof URL,
  name: 'a url',
  empty: () => new URL('local://local.local'),
  clone: (x) => new URL(x),
});

/**
 * A function that returns a new validator that succeeds if the given input is
 * a URL, and fails otherwise, i.e. if the input satisfies the condition
 * `input instanceof URL`. Alternatively it may be a string that is coercible to
 * a URL trough `new URL`, although this is most useful when combined with the
 * baseUrl parameter.
 *
 * @function url
 * @memberOf is
 * @static
 * @param {string|URL} [baseUrl]
 * @return {UrlValidator}
 */
Monadidator.is.url = (baseUrl) => {
  if (baseUrl && typeof baseUrl === 'string') {
    try {
      return Monadidator.is.url(new URL(baseUrl));
    } catch (err) {
      throw new TypeError('baseUrl must be a url');
    }
  }

  if (baseUrl && !(baseUrl instanceof URL))
    throw new TypeError('baseUrl must be a url');

  return isUrl()
    .or(
      Monadidator.is
        .string()
        .map((x) => {
          try {
            return new URL(x, baseUrl);
          } catch (err) {
            return x;
          }
        })
        .then(isUrl())
    )
    .label('a url');
};
