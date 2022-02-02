'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('object', async function () {
  test('no template', async function () {
    const v = is.object();

    this.eq(v.run({}), {});
    this.eq(v.run({a: 1}), {a: 1});
    this.eq(v.run([]), []);
    this.eq(v.run(Object.create(null)), Object.create(null));

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
  });

  test('invalid template', async function () {
    await this.throws(() => is.object('lol'), /tmpl must be an object/);
    await this.throws(
      () => is.object({x: 'lol'}),
      /tmpl must contain only instances of Monadidator/
    );
  });

  test('template 1', async function () {
    const v = is.object({x: is.number()});

    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({x: 1}), {x: 1});
    this.eq(v.run({x: 1, y: 2}), {x: 1});

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
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('template 2', async function () {
    const v = is.object({x: is.number(), y: is.number()});

    this.eq(v.run({x: 0, y: 0}), {x: 0, y: 0});
    this.eq(v.run({x: 1, y: 1, z: 1}), {x: 1, y: 1});

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
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 1}),
      async function (err) {
        this.eq(err.property, 'input.y');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 1, y: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.y');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('template 3', async function () {
    const sym1 = Symbol('test1');
    const sym2 = Symbol('test2');
    const v = is.object({x: is.number(), [sym1]: is.number()});

    this.eq(v.run({x: 0, [sym1]: 0}), {x: 0, [sym1]: 0});
    this.eq(v.run({y: 1, [sym2]: 1, x: 1, [sym1]: 1}), {x: 1, [sym1]: 1});

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
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 1}),
      async function (err) {
        this.eq(err.property, "input[Symbol('test1')]");
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 1, [sym1]: 'lol'}),
      async function (err) {
        this.eq(err.property, "input[Symbol('test1')]");
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('nested template', async function () {
    const v = is.object({x: is.object({y: is.number()})});

    this.eq(v.run({x: {y: 0}}), {x: {y: 0}});
    this.eq(v.run({x: {y: 1}}), {x: {y: 1}});

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
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({x: {}}),
      async function (err) {
        this.eq(err.property, 'input.x.y');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: {y: 'lol'}}),
      async function (err) {
        this.eq(err.property, 'input.x.y');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('template with map', async function () {
    const v = is.object({
      x: is
        .string()
        .match(/^\d+$/)
        .map((x) => Number.parseInt(x, 10)),
    });

    const sym = Symbol('test');
    this.eq(v.run({x: '0'}), {x: 0});
    this.eq(v.run({x: '1'}), {x: 1});
    this.eq(v.run({x: '1', y: 2, [sym]: 3}), {x: 1});

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
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a string');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a string matching /^\\d+$/');
      }
    );
  });
});

test('object.instanceof', async function () {
  await this.throws(() => is.object().instanceof('lol'), /Cls must be a class/);

  class X {}
  class Y extends X {}

  const x1 = new X();
  const x2 = new Y();
  const x3 = Object.create(X.prototype);

  const v1 = is.object().instanceof(X);
  const v2 = is.object().instanceof(class extends X {});

  this.eq(v1.run(x1), x1);
  this.eq(v1.run(x2), x2);
  this.eq(v1.run(x3), x3);

  await this.throws(
    () => v1.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'an object');
    }
  );
  await this.throws(
    () => v1.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'an object');
    }
  );
  await this.throws(
    () => v1.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'an object instance of X');
    }
  );
  await this.throws(
    () => v1.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'an object instance of X');
    }
  );
  await this.throws(
    () => v2.run(x1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, x1);
      this.eq(err.expected, 'an object instance of anonymous class');
    }
  );
});

test('object.where', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.object().where('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const v = is.object().where('x', is.number());

    this.eq(v.run({x: NaN}), {x: NaN});
    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({x: 1}), {x: 1});

    const obj = Object.create(null);
    obj.x = 2;
    this.eq(v.run(obj), obj);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });

  test('with map', async function () {
    const s = Symbol('test');
    const v = is.object().where(
      'x',
      is
        .number()
        .finite()
        .map((x) => x + 1)
    );

    this.eq(v.run({x: 0}), {x: 1});
    this.eq(v.run({x: 1}), {x: 2});
    this.eq(v.run({x: 1, y: 2}), {x: 2, y: 2});
    this.eq(v.run({x: 1, [s]: 2}), {x: 2, [s]: 2});

    const obj1 = Object.create(null);
    obj1.x = 2;
    this.eq(v.run(obj1), {x: 3});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({x: NaN}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number finite');
      }
    );
    await this.throws(
      () => v.run({x: 'lol'}),
      async function (err) {
        this.eq(err.property, 'input.x');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a number');
      }
    );
  });
});

test('object.where.every.key', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.object().where.every.key('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const s = Symbol('test');
    const v = is.object().where.every.key(is.string().in(['x', 'y', 'z']));

    this.eq(v.run({}), {});
    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({y: 1}), {y: 1});
    this.eq(v.run({x: 0, y: 1}), {x: 0, y: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {x: 0, y: 1, z: 2});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({[s]: 1}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {[s]: 1});
        this.eq(err.expected, 'an object where every key is a string');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(
          err.expected,
          "an object\n    where every key is a string in ['x', 'y', 'z']"
        );
      }
    );
    await this.throws(
      () => v.run({x: 1, w: 2}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {x: 1, w: 2});
        this.eq(
          err.expected,
          "an object\n    where every key is a string in ['x', 'y', 'z']"
        );
      }
    );
  });

  test('with map', async function () {
    const s = Symbol('test');
    const v = is.object().where.every.key(
      is
        .string()
        .in(['x', 'y', 'z'])
        .map((x) => '_' + x)
    );

    this.eq(v.run({}), {});
    this.eq(v.run({x: 0}), {_x: 0});
    this.eq(v.run({y: 1}), {_y: 1});
    this.eq(v.run({x: 0, y: 1}), {_x: 0, _y: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {_x: 0, _y: 1, _z: 2});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({[s]: 1}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {[s]: 1});
        this.eq(err.expected, 'an object where every key is a string');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(
          err.expected,
          "an object\n    where every key is a string in ['x', 'y', 'z']"
        );
      }
    );
    await this.throws(
      () => v.run({x: 1, w: 2}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {x: 1, w: 2});
        this.eq(
          err.expected,
          "an object\n    where every key is a string in ['x', 'y', 'z']"
        );
      }
    );
  });
});

test('object.where.every.value', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.object().where.every.value('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const s = Symbol('test');
    const v = is.object().where.every.value(is.number().in([0, 1, 2]));

    this.eq(v.run({}), {});
    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({y: 1}), {y: 1});
    this.eq(v.run({x: 0, y: 1}), {x: 0, y: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {x: 0, y: 1, z: 2});
    this.eq(v.run({x: 0, [s]: 1}), {x: 0, [s]: 1});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({w: 3}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
    await this.throws(
      () => v.run({x: 1, w: 3}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
  });

  test('with map', async function () {
    const s = Symbol('test');
    const v = is.object().where.every.value(
      is
        .number()
        .in([0, 1, 2])
        .map((x) => x + 1)
    );

    this.eq(v.run({}), {});
    this.eq(v.run({x: 0}), {x: 1});
    this.eq(v.run({y: 1}), {y: 2});
    this.eq(v.run({x: 0, y: 1}), {x: 1, y: 2});
    this.eq(v.run({x: 0, y: 1, z: 2}), {x: 1, y: 2, z: 3});
    this.eq(v.run({x: 0, [s]: 1}), {x: 1, [s]: 2});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run({w: 3}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
    await this.throws(
      () => v.run({x: 1, w: 3}),
      async function (err) {
        this.eq(err.property, 'input.w');
        this.eq(err.actual, 3);
        this.eq(err.expected, 'a number in [0, 1, 2]');
      }
    );
  });
});

test('object.where.some.key', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.object().where.some.key('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const s = Symbol('test');
    const v = is.object().where.some.key(is.string().in(['x', 'y', 'z']));

    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({y: 1, w: 3}), {y: 1, w: 3});
    this.eq(v.run({x: 0, y: 1}), {x: 0, y: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {x: 0, y: 1, z: 2});
    this.eq(v.run({x: 0, y: 1, z: 2, w: 3}), {x: 0, y: 1, z: 2, w: 3});
    this.eq(v.run({x: 0, [s]: 1}), {x: 0, [s]: 1});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object with at least one key');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(
          err.expected,
          "an object\n    where some key is a string in ['x', 'y', 'z']"
        );
      }
    );
    await this.throws(
      () => v.run({w: 3, v: 4}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: 3, v: 4});
        this.eq(
          err.expected,
          "an object\n    where some key is a string in ['x', 'y', 'z']"
        );
      }
    );
  });

  test('with map', async function () {
    const s = Symbol('test');
    const v = is.object().where.some.key(
      is
        .string()
        .in(['x', 'y', 'z'])
        .map((x) => '_' + x)
    );

    this.eq(v.run({x: 0}), {_x: 0});
    this.eq(v.run({y: 1, w: 3}), {_y: 1, w: 3});
    this.eq(v.run({w: 1, y: 3}), {w: 1, _y: 3});
    this.eq(v.run({x: 0, y: 1}), {_x: 0, y: 1});
    this.eq(v.run({y: 0, x: 1}), {_y: 0, x: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {_x: 0, y: 1, z: 2});
    this.eq(v.run({x: 0, y: 1, z: 2, w: 3}), {_x: 0, y: 1, z: 2, w: 3});
    this.eq(v.run({x: 0, [s]: 1}), {_x: 0, [s]: 1});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object with at least one key');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(
          err.expected,
          "an object\n    where some key is a string in ['x', 'y', 'z']"
        );
      }
    );
    await this.throws(
      () => v.run({w: 3, v: 4}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: 3, v: 4});
        this.eq(
          err.expected,
          "an object\n    where some key is a string in ['x', 'y', 'z']"
        );
      }
    );
  });
});

test('object.where.some.value', async function () {
  test('invalid', async function () {
    await this.throws(
      () => is.object().where.some.value('lol'),
      /validator must be an instance of Monadidator/
    );
  });

  test('without map', async function () {
    const s = Symbol('test');
    const v = is.object().where.some.value(is.number().in([0, 1, 2]));

    this.eq(v.run({x: 0}), {x: 0});
    this.eq(v.run({y: 1}), {y: 1});
    this.eq(v.run({y: 4, w: 1}), {y: 4, w: 1});
    this.eq(v.run({x: 0, y: 1}), {x: 0, y: 1});
    this.eq(v.run({x: 0, y: 1, z: 2}), {x: 0, y: 1, z: 2});
    this.eq(v.run({x: 0, [s]: 1}), {x: 0, [s]: 1});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object with at least one value');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(err.expected, 'an object where some value is a number');
      }
    );
    await this.throws(
      () => v.run({w: 3}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: 3});
        this.eq(
          err.expected,
          'an object\n    where some value is a number in [0, 1, 2]'
        );
      }
    );
    await this.throws(
      () => v.run({x: 3, y: 3}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {x: 3, y: 3});
        this.eq(
          err.expected,
          'an object\n    where some value is a number in [0, 1, 2]'
        );
      }
    );
  });

  test('with map', async function () {
    const s = Symbol('test');
    const v = is.object().where.some.value(
      is
        .number()
        .in([0, 1, 2])
        .map((x) => x + 1)
    );

    this.eq(v.run({x: 0}), {x: 1});
    this.eq(v.run({y: 1}), {y: 2});
    this.eq(v.run({y: 2, w: 1}), {y: 3, w: 1});
    this.eq(v.run({y: 4, w: 1}), {y: 4, w: 2});
    this.eq(v.run({x: 0, y: 1}), {x: 1, y: 1});
    this.eq(v.run({x: 'a', y: 1, z: 2}), {x: 'a', y: 2, z: 2});
    this.eq(v.run({x: 'a', y: '1', z: 2}), {x: 'a', y: '1', z: 3});
    this.eq(v.run({x: 'a', [s]: 1}), {x: 'a', [s]: 2});
    this.eq(v.run({x: 1, [s]: 'a'}), {x: 2, [s]: 'a'});

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object with at least one value');
      }
    );
    await this.throws(
      () => v.run({w: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: null});
        this.eq(err.expected, 'an object where some value is a number');
      }
    );
    await this.throws(
      () => v.run({w: 3}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {w: 3});
        this.eq(
          err.expected,
          'an object\n    where some value is a number in [0, 1, 2]'
        );
      }
    );
    await this.throws(
      () => v.run({x: 3, y: 3}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {x: 3, y: 3});
        this.eq(
          err.expected,
          'an object\n    where some value is a number in [0, 1, 2]'
        );
      }
    );
  });

  test('nested map', async function () {
    const s = Symbol('test');
    const v = is.object().where.some.value(
      is.object().where.some.value(
        is
          .number()
          .in([0, 1, 2])
          .map((x) => x + 1)
      )
    );

    this.eq(v.run({a: {x: 0}}), {a: {x: 1}});
    this.eq(v.run({b: {x: 1}}), {b: {x: 2}});
    this.eq(v.run({a: {[s]: 0}}), {a: {[s]: 1}});
    this.eq(v.run({[s]: {x: 0}}), {[s]: {x: 1}});
    this.eq(v.run({a: {x: 1}, b: {x: 3}}), {a: {x: 2}, b: {x: 3}});
    this.eq(v.run({a: {x: 3}, b: {x: 1}}), {a: {x: 3}, b: {x: 2}});
    this.eq(v.run({a: {[s]: 'a'}, b: {x: 1}}), {
      a: {[s]: 'a'},
      b: {x: 2},
    });
    this.eq(v.run({a: {x: 'a'}, b: {[s]: 1}}), {
      a: {x: 'a'},
      b: {[s]: 2},
    });

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'an object');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'an object with at least one value');
      }
    );
    await this.throws(
      () => v.run({a: null}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {a: null});
        this.eq(err.expected, 'an object where some value is an object');
      }
    );
    await this.throws(
      () => v.run({a: {}}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {a: {}});
        this.eq(
          err.expected,
          'an object\n    where some value is an object with at least one value'
        );
      }
    );
    await this.throws(
      () => v.run({a: {x: 3}}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {a: {x: 3}});
        this.eq(
          err.expected,
          'an object\n    where some value is\n        an object\n        ' +
            'where some value is a number in [0, 1, 2]'
        );
      }
    );
  });
});
