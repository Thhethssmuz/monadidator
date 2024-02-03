'use strict';
/* eslint-disable no-empty-function */

const {Monadidator, is} = require('..');
const {NEGATE, EMPTY, CLONE} = require('../lib/symbols');
const test = require('awfltst');

test('Monadidator', async function () {
  await this.throws(() => new Monadidator(), /unValidate must be a function/);
  await this.throws(
    () => new Monadidator('lol'),
    /unValidate must be a function/
  );
});

test('Monadidator.empty', async function () {
  const v = Monadidator.empty();

  await this.throws(() => v.run(), TypeError);
  await this.throws(() => v.run(null), TypeError);
  await this.throws(() => v.run(undefined), TypeError);
  await this.throws(() => v.run(false), TypeError);
  await this.throws(() => v.run(NaN), TypeError);
  await this.throws(() => v.run(0), TypeError);
  await this.throws(() => v.run(Object.create(null)), TypeError);
  await this.throws(() => v.run({}), TypeError);
  await this.throws(() => v.run([]), TypeError);
});

test('Monadidator.of', async function () {
  const v = Monadidator.of('lol');

  this.eq(v.run(), 'lol');
  this.eq(v.run(null), 'lol');
  this.eq(v.run(undefined), 'lol');
  this.eq(v.run(false), 'lol');
  this.eq(v.run(NaN), 'lol');
  this.eq(v.run(0), 'lol');
  this.eq(v.run(Object.create(null)), 'lol');
  this.eq(v.run({}), 'lol');
  this.eq(v.run([]), 'lol');
});

test('Monadidator.map', async function () {
  test('invalid', async function () {
    await this.throws(() => is.string().map('lol'), /f must be a function/);
  });

  test('sync', async function () {
    const v = is
      .string()
      .map((x) => Number.parseInt(x, 10))
      .then(is.number().finite());

    this.eq(v.run('-1'), -1);
    this.eq(v.run('0'), 0);
    this.eq(v.run('1'), 1);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(
          err.expected,
          "a string, map 'lol' -> NaN, a number and finite"
        );
      }
    );
  });

  test('async', async function () {
    const v = is.string().map(async (x) => Number.parseInt(x, 10));

    this.eq(v.run('-1'), Promise.resolve(-1));
    this.eq(await v.run('-1'), -1);

    this.eq(await v.asyncRun('-1'), -1);
    this.eq(await v.asyncRun('0'), 0);
    this.eq(await v.asyncRun('1'), 1);

    await this.throws(
      () => v.asyncRun(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.asyncRun(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a string');
      }
    );
  });

  test('chained async', async function () {
    const v = is
      .string()
      .map(async (x) => Number.parseInt(x, 10))
      .then(is.number().finite());

    await this.throws(
      () => v.run('-1'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Promise.resolve(-1));
        this.eq(err.expected, "a string, map '-1' -> Promise {} and a number");
      }
    );

    this.eq(await v.asyncRun('-1'), -1);
    this.eq(await v.asyncRun('0'), 0);
    this.eq(await v.asyncRun('1'), 1);

    await this.throws(
      () => v.asyncRun(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.asyncRun(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.asyncRun('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(
          err.expected,
          "a string, map 'lol' -> NaN, a number and finite"
        );
      }
    );
  });

  test('nested async 1', async function () {
    const v = is.object({
      x: is.string().map(async (x) => Number.parseInt(x, 10)),
      y: is.string().map(async (x) => Number.parseInt(x, 10)),
    });

    this.eq(v.run({x: '1', y: '2'}), {
      x: Promise.resolve(1),
      y: Promise.resolve(2),
    });
    this.eq(await v.run({x: '1', y: '2'}), {
      x: Promise.resolve(1),
      y: Promise.resolve(2),
    });
    this.eq(await v.asyncRun({x: '1', y: '2'}), {x: 1, y: 2});

    await this.throws(
      () => v.asyncRun(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.asyncRun({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.asyncRun({x: '1', y: true}),
      async function (err) {
        this.eq(err.property, 'input.y');
        this.eq(err.actual, true);
        this.eq(err.expected, 'a string');
      }
    );
  });

  test('nested async 2', async function () {
    const v = is
      .array()
      .where.every.elem(is.string().map(async (x) => Number.parseInt(x, 10)));

    this.eq(v.run([]), []);
    this.eq(v.run(['1']), [Promise.resolve(1)]);
    this.eq(v.run(['1', '2']), [Promise.resolve(1), Promise.resolve(2)]);
    this.eq(await v.run(['1', '2']), [Promise.resolve(1), Promise.resolve(2)]);
    this.eq(await v.asyncRun(['1', '2']), [1, 2]);

    await this.throws(
      () => v.asyncRun('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an array');
      }
    );
    await this.throws(
      () => v.asyncRun(['1', true]),
      async function (err) {
        this.eq(err.property, 'input[1]');
        this.eq(err.actual, true);
        this.eq(err.expected, 'a string');
      }
    );
  });

  test('nested & chained async', async function () {
    const inner = is
      .string()
      .map(async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return Number.parseInt(x, 10);
      })
      .then(is.number().finite());

    const v = is.object({x: inner, y: inner});

    this.eq(await v.asyncRun({x: '1', y: '2'}), {x: 1, y: 2});

    await this.throws(
      () => v.asyncRun(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.asyncRun({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.asyncRun({x: '1', y: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.y');
        this.eq(err.actual, 'lol');
        this.eq(
          err.expected,
          "a string, map 'lol' -> NaN, a number and finite"
        );
      }
    );
    await this.throws(
      () => v.run({x: '1', y: '2'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, '1');
        this.eq(err.expected, "a string, map '1' -> Promise {} and a number");
      }
    );
  });
});

test('Monadidator.chain', async function () {
  test('invalid', async function () {
    await this.throws(() => is.string().chain('lol'), /f must be a function/);
  });

  test('of', async function () {
    const v = is.string().chain((x) => Monadidator.of('lol' + x));

    this.eq(v.run(''), 'lol');
    this.eq(v.run('lygag'), 'lollygag');

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a string');
      }
    );
  });

  test('empty', async function () {
    const v = is.string().chain(() => Monadidator.empty());

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run(''),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, '');
        this.eq(err.expected, 'a string');
      }
    );
  });
});

test('Monadidator.or', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.string().or(),
      /validator must be an instance of Monadidator/
    );
  });

  test('2', async function () {
    const v = is.string().or(is.number());

    this.eq(v.run('lol'), 'lol');
    this.eq(v.run(123), 123);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'either a string or a number');
      }
    );
  });

  test('3', async function () {
    const v1 = is.string().or(is.number()).or(is.array());
    const v2 = is.string().or(is.number().or(is.array()));

    this.eq(v1.run('lol'), 'lol');
    this.eq(v2.run('lol'), 'lol');
    this.eq(v1.run(123), 123);
    this.eq(v2.run(123), 123);
    this.eq(v1.run([]), []);
    this.eq(v2.run([]), []);

    await this.throws(
      () => v1.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'either a string, a number or an array');
      }
    );
    await this.throws(
      () => v2.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'either a string, a number or an array');
      }
    );
  });

  test('not 2', async function () {
    const v = Monadidator.not(is.string().or(is.number()));

    this.eq(v.run(null), null);
    this.eq(v.run(undefined), undefined);
    this.eq(v.run(false), false);
    this.eq(v.run({}), {});
    this.eq(v.run([]), []);

    await this.throws(
      () => v.run(''),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, '');
        this.eq(err.expected, 'not a string');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'neither a string nor a number');
      }
    );
  });

  test('not 3', async function () {
    const v1 = Monadidator.not(is.string().or(is.number()).or(is.array()));
    const v2 = Monadidator.not(is.string().or(is.number().or(is.array())));

    this.eq(v1.run(null), null);
    this.eq(v2.run(null), null);
    this.eq(v1.run(undefined), undefined);
    this.eq(v2.run(undefined), undefined);
    this.eq(v1.run(false), false);
    this.eq(v2.run(false), false);
    this.eq(v1.run({}), {});
    this.eq(v2.run({}), {});

    await this.throws(
      () => v1.run(''),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, '');
        this.eq(err.expected, 'not a string');
      }
    );
    await this.throws(
      () => v2.run(''),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, '');
        this.eq(err.expected, 'not a string');
      }
    );
    await this.throws(
      () => v1.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'neither a string nor a number');
      }
    );
    await this.throws(
      () => v2.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'neither a string nor a number');
      }
    );
    await this.throws(
      () => v1.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'neither a string, a number nor an array');
      }
    );
    await this.throws(
      () => v2.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'neither a string, a number nor an array');
      }
    );
  });
});

test('Monadidator.and', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.string().and(),
      /validator must be an instance of Monadidator/
    );
  });

  test('2', async function () {
    const v = is.object().and(is.array());

    this.eq(v.run([]), []);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object and an array');
      }
    );
  });

  test('3', async function () {
    const v1 = is.any().and(is.object()).and(is.array());
    const v2 = is.any().and(is.object().and(is.array()));

    this.eq(v1.run([]), []);
    this.eq(v2.run([]), []);

    await this.throws(
      () => v1.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'anything and an object');
      }
    );
    await this.throws(
      () => v2.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'anything and an object');
      }
    );
    await this.throws(
      () => v1.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'anything, an object and an array');
      }
    );
    await this.throws(
      () => v2.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'anything, an object and an array');
      }
    );
  });

  test('not 2', async function () {
    const v = Monadidator.not(is.object().and(is.array()));

    this.eq(v.run(null), null);
    this.eq(v.run(undefined), undefined);
    this.eq(v.run(false), false);
    this.eq(v.run(0), 0);
    this.eq(v.run({}), {});

    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'not (an object and an array)');
      }
    );
  });

  test('not 3', async function () {
    const v1 = Monadidator.not(is.any().and(is.object()).and(is.array()));
    const v2 = Monadidator.not(is.any().and(is.object().and(is.array())));

    this.eq(v1.run(null), null);
    this.eq(v2.run(null), null);
    this.eq(v1.run(undefined), undefined);
    this.eq(v2.run(undefined), undefined);
    this.eq(v1.run(false), false);
    this.eq(v2.run(false), false);
    this.eq(v1.run(0), 0);
    this.eq(v2.run(0), 0);
    this.eq(v1.run({}), {});
    this.eq(v2.run({}), {});

    await this.throws(
      () => v1.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'not (anything, an object and an array)');
      }
    );
    await this.throws(
      () => v2.run([]),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, []);
        this.eq(err.expected, 'not (anything, an object and an array)');
      }
    );
  });
});

test('Monadidator.not', async function () {
  test('invalid', async function () {
    await this.throws(
      () => Monadidator.not('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('static', async function () {
    const v = Monadidator.not(is.number().gt(0));

    this.eq(v.run(null), null);
    this.eq(v.run('lol'), 'lol');
    this.eq(v.run(0), 0);
    this.eq(v.run(-1), -1);
    this.eq(v.run(-Infinity), -Infinity);

    await this.throws(
      () => v.run(1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 1);
        this.eq(err.expected, 'not (a number greater than 0)');
      }
    );
    await this.throws(
      () => v.run(Infinity),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Infinity);
        this.eq(err.expected, 'not (a number greater than 0)');
      }
    );
  });

  test('member', async function () {
    const v = Monadidator.not(is.number()).not(is.string());

    this.eq(v.run(null), null);
    this.eq(v.run(false), false);
    this.eq(v.run({}), {});
    this.eq(v.run(/123/), /123/);

    await this.throws(
      () => v.run(1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 1);
        this.eq(err.expected, 'not a number');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'not a number and not a string');
      }
    );
  });
});

test('Monadidator.where', async function () {
  test('invalid', async function () {
    await this.throws(
      () => Monadidator.where('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const v = Monadidator.where('length', is.number().gt(0));

    this.eq(v.run('lol'), 3);
    this.eq(v.run([1, 2, 3]), 3);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(''),
      async function (err) {
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
  });

  test('with map', async function () {
    const v = Monadidator.where(
      'length',
      is
        .number()
        .gt(0)
        .map((x) => x + 1)
    );

    this.eq(v.run('lol'), 4);
    this.eq(v.run([1, 2, 3]), 4);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.actual, undefined);
      }
    );
    await this.throws(
      () => v.run(''),
      async function (err) {
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
    await this.throws(
      () => v.run([]),
      async function (err) {
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
  });

  test('with map sequence', async function () {
    const v = is
      .string()
      .map((x) => x.trim())
      .where('length', is.number().gt(0));

    this.eq(v.run('lol'), 'lol');
    this.eq(v.run('  lol  '), 'lol');

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run(''),
      async function (err) {
        this.eq(err.property, 'input.length');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
    await this.throws(
      () => v.run(' '),
      async function (err) {
        this.eq(err.property, 'input.length');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number greater than 0');
      }
    );
  });

  test('with map sequence 2', async function () {
    const v = is
      .object()
      .map((obj) => ({...obj, a: 1}))
      .where(
        'b',
        is
          .number()
          .eq(1)
          .map((x) => x + 1)
      )
      .where(
        'c',
        is
          .number()
          .eq(1)
          .map((x) => x + 2)
      );

    this.eq(v.run({a: 99, b: 1, c: 1}), {a: 1, b: 2, c: 3});
    this.eq(v.run({b: 1, c: 1}), {a: 1, b: 2, c: 3});
    this.eq(v.run({b: 1, c: 1, d: 1}), {a: 1, b: 2, c: 3, d: 1});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input.b');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({b: 0}),
      async function (err) {
        this.eq(err.property, 'input.b');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number equal to 1');
      }
    );
    await this.throws(
      () => v.run({b: 1, c: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.c');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });
});

test('Monadidator.satisfy', async function () {
  await this.throws(
    () => Monadidator.satisfy(),
    /predicate must be a function/
  );

  const v = Monadidator.satisfy((x) => Number.isFinite(x) && x % 2 === 0)
    .label('an even number')
    .and(
      Monadidator.satisfy((x) => x === 42).label('larger than the universe')
    );

  this.eq(v.run(42), 42);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'an even number');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'an even number larger than the universe');
    }
  );
});

test('Monadidator.label', async function () {
  await this.throws(() => is.string().label(), /msg must be a string/);

  const v = is
    .object({x: is.number().finite(), y: is.number().finite()})
    .label('a point');

  this.eq(v.run({x: 1, y: 2}), {x: 1, y: 2});

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a point');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a point');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a point');
    }
  );
  await this.throws(
    () => v.run({x: 'lol'}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {x: 'lol'});
      this.eq(err.expected, 'a point');
    }
  );
  await this.throws(
    () => v.run({x: NaN, y: NaN}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {x: NaN, y: NaN});
      this.eq(err.expected, 'a point');
    }
  );
});

test('Monadidator.mkType', async function () {
  await this.throws(
    () => Monadidator.mkType(),
    /Cls must be a class that extends Monadidator/
  );
  await this.throws(
    () => Monadidator.mkType(null),
    /Cls must be a class that extends Monadidator/
  );
  await this.throws(
    () => Monadidator.mkType({}),
    /Cls must be a class that extends Monadidator/
  );

  class X extends Monadidator {}

  await this.throws(
    () => Monadidator.mkType(X),
    /options.name must be a string/
  );

  await this.throws(
    () => Monadidator.mkType(X, {name: 'x'}),
    /options.predicate must be a function/
  );

  await this.throws(
    () =>
      Monadidator.mkType(X, {
        name: 'x',
        predicate: () => {},
        empty: 'lol',
      }),
    /options.empty must be a function/
  );

  await this.throws(
    () =>
      Monadidator.mkType(X, {
        name: 'x',
        predicate: () => {},
        empty: () => {},
        clone: 'lol',
      }),
    /options.clone must be a function/
  );

  Monadidator.mkType(X, {
    name: 'x',
    predicate: () => {},
    empty: () => {},
    clone: () => {},
  });

  this.has(X, NEGATE);
  this.has(X, EMPTY);
  this.has(X, CLONE);
});

test('Monadidator.run', async function () {
  class MyError extends TypeError {}

  const v = is
    .string()
    .map((x) => x.trim())
    .where('length', is.number().gt(0))
    .match(/^\d+$/);

  await this.throws(
    () => v.run(' 1a '),
    async function (err) {
      this.instance(err, TypeError);
      this.eq(err.property, 'input');
      this.eq(err.actual, '1a');
      this.eq(
        err.expected,
        "a string, map ' 1a ' -> '1a' and matching /^\\d+$/"
      );
    }
  );
  await this.throws(
    () => v.run(' 1a ', 'test'),
    async function (err) {
      this.instance(err, TypeError);
      this.eq(err.property, 'test');
      this.eq(err.actual, '1a');
      this.eq(
        err.expected,
        "a string, map ' 1a ' -> '1a' and matching /^\\d+$/"
      );
    }
  );
  await this.throws(
    () => v.run(' 1a ', 'test', {}),
    async function (err) {
      this.instance(err, TypeError);
      this.eq(err.property, 'test');
      this.eq(err.actual, '1a');
      this.eq(
        err.expected,
        "a string, map ' 1a ' -> '1a' and matching /^\\d+$/"
      );
    }
  );
  await this.throws(
    () => v.run(' 1a ', 'test', {ErrorClass: MyError}),
    async function (err) {
      this.instance(err, MyError);
      this.eq(err.property, 'test');
      this.eq(err.actual, '1a');
      this.eq(
        err.expected,
        "a string, map ' 1a ' -> '1a' and matching /^\\d+$/"
      );
    }
  );
  await this.throws(
    () => v.run(' 1a ', 'test', {format: 'tree'}),
    async function (err) {
      this.instance(err, TypeError);
      this.eq(err.property, 'test');
      this.eq(err.actual, '1a');
      this.eq(
        err.expected,
        [
          '✔ a string',
          "├─ ✔ map ' 1a ' -> '1a'",
          '└─ ✘ matching /^\\d+$/',
        ].join('\n')
      );
    }
  );
});
