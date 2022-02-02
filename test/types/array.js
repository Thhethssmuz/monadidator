'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('array', async function () {
  test('no template', async function () {
    const v = is.array();

    this.eq(v.run([]), []);
    this.eq(v.run([1]), [1]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an array');
      }
    );
  });

  test('invalid template', async function () {
    await this.throws(() => is.array('lol'), /tmpl must be an array/);
    await this.throws(
      () => is.array(['lol']),
      /tmpl must contain only instances of Monadidator/
    );
  });

  test('template 1', async function () {
    const v = is.array([is.number()]);

    this.eq(v.run([0]), [0]);
    this.eq(v.run([1]), [1]);
    this.eq(v.run([0, 1]), [0]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(['lol']),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('template 2', async function () {
    const v = is.array([is.number(), is.number()]);

    this.eq(v.run([0, 0]), [0, 0]);
    this.eq(v.run([1, 1]), [1, 1]);
    this.eq(v.run([0, 1, 2]), [0, 1]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(['lol']),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run([0]),
      async function (err) {
        this.eq(err.property, 'input[1]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run([0, 'lol']),
      async function (err) {
        this.eq(err.property, 'input[1]');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('nested template', async function () {
    const v = is.array([is.array([is.number()])]);

    this.eq(v.run([[0]]), [[0]]);
    this.eq(v.run([[1]]), [[1]]);
    this.eq(v.run([[0, 1]]), [[0]]);
    this.eq(v.run([[0], [1]]), [[0]]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run(['lol']),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([[]]),
      async function (err) {
        this.eq(err.property, 'input[0][0]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run([['lol']]),
      async function (err) {
        this.eq(err.property, 'input[0][0]');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });
});

test('array.where', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.array().where('length'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const v = is.array().where('length', is.number().gt(0));

    this.eq(v.run([0]), [0]);
    this.eq(v.run([0, 1]), [0, 1]);
    this.eq(v.run([0, 1, 2]), [0, 1, 2]);
    this.eq(v.run(new Array(1)), new Array(1));

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input.length');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
  });

  test('with map', async function () {
    const v = is.array().where(
      0,
      is
        .number()
        .gt(0)
        .map((x) => x + 1)
    );

    this.eq(v.run([1]), [2]);
    this.eq(v.run([1, 2]), [2, 2]);
    this.eq(v.run([1, 2, 3]), [2, 2, 3]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run([0]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
  });
});

test('array.where.every.element', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.array().where.every.element(),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const v = is.array().where.every.element(is.number().in([0, 1, 2]));

    this.eq(v.run([]), []);
    this.eq(v.run([0]), [0]);
    this.eq(v.run([1]), [1]);
    this.eq(v.run([0, 1]), [0, 1]);
    this.eq(v.run([0, 1, 2]), [0, 1, 2]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([null]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run([3]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
    await this.throws(
      () => v.run([1, 3]),
      async function (err) {
        this.eq(err.property, 'input[1]');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
  });

  test('with map', async function () {
    const v = is.array().where.every.element(
      is
        .string()
        .match(/^\d+$/)
        .map((x) => Number.parseInt(x, 10))
        .then(is.number().in([0, 1, 2]))
    );

    this.eq(v.run([]), []);
    this.eq(v.run(['0']), [0]);
    this.eq(v.run(['1']), [1]);
    this.eq(v.run(['0', '1']), [0, 1]);
    this.eq(v.run(['0', '1', '2']), [0, 1, 2]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([null]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run([1]),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, 1);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run(['3']),
      async function (err) {
        this.eq(err.property, 'input[0]');
        this.eq(err.actual, '3');
        this.eq(
          err.expected,
          "a string\n    matching /^\\d+$/\n    map '3' -> 3\n    a number\n" +
            '    in [0, 1, 2]'
        );
      }
    );
    await this.throws(
      () => v.run(['1', '3']),
      async function (err) {
        this.eq(err.property, 'input[1]');
        this.eq(err.actual, '3');
        this.eq(
          err.expected,
          "a string\n    matching /^\\d+$/\n    map '3' -> 3\n    a number\n" +
            '    in [0, 1, 2]'
        );
      }
    );
  });
});

test('array.where.some.element', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.array().where.some.element(),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const v = is.array().where.some.element(is.number().in([0, 1, 2]));

    this.eq(v.run([0]), [0]);
    this.eq(v.run([1]), [1]);
    this.eq(v.run([0, 1]), [0, 1]);
    this.eq(v.run([0, 1, 2]), [0, 1, 2]);
    this.eq(v.run([0, 3, 4]), [0, 3, 4]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'an array with at least one element');
      }
    );
    await this.throws(
      () => v.run([null]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [null]);
        this.eq(err.expected, 'an array where some element is a number');
      }
    );
    await this.throws(
      () => v.run([3]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [3]);
        this.eq(
          err.expected,
          'an array\n    where some element is a number in [0, 1, 2]'
        );
      }
    );
    await this.throws(
      () => v.run([3, 3]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [3, 3]);
        this.eq(
          err.expected,
          'an array\n    where some element is a number in [0, 1, 2]'
        );
      }
    );
  });

  test('with map', async function () {
    const v = is.array().where.some.element(
      is
        .number()
        .in([0, 1, 2])
        .map((x) => x + 1)
    );

    this.eq(v.run([0]), [1]);
    this.eq(v.run([1]), [2]);
    this.eq(v.run([0, 1]), [1, 1]);
    this.eq(v.run([0, 1, 2]), [1, 1, 2]);
    this.eq(v.run([3, 2, 1]), [3, 3, 1]);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'an array with at least one element');
      }
    );
    await this.throws(
      () => v.run([null]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [null]);
        this.eq(err.expected, 'an array where some element is a number');
      }
    );
    await this.throws(
      () => v.run([3]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [3]);
        this.eq(
          err.expected,
          'an array\n    where some element is a number in [0, 1, 2]'
        );
      }
    );
    await this.throws(
      () => v.run([3, 3]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, [3, 3]);
        this.eq(
          err.expected,
          'an array\n    where some element is a number in [0, 1, 2]'
        );
      }
    );
  });
});

test('array.not.where', async function () {
  const v = is.array().not.where('length', is.number().gt(0));

  this.eq(v.run([]), []);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'an array');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'an array');
    }
  );
  await this.throws(
    () => v.run([1]),
    async function (err) {
      this.eq(err.property, 'input.length');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'not a number greater than 0');
    }
  );
});
