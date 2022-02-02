'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('string', async function () {
  const v = is.string();

  this.eq(v.run(''), '');
  this.eq(v.run('x'), 'x');
  this.eq(v.run('xyz'), 'xyz');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a string');
    }
  );
});

test('string.satisfy', async function () {
  const isPalindrome = (x) => x === Array.from(x).reverse().join('');
  const v = is.string().satisfy(isPalindrome);

  this.eq(v.run(''), '');
  this.eq(v.run('lol'), 'lol');
  this.eq(v.run('tacocat'), 'tacocat');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('rofl'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'rofl');
      this.eq(err.expected, 'a string satisfying function isPalindrome');
    }
  );
});

test('string.empty', async function () {
  const v = is.string().empty();

  this.eq(v.run(''), '');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'a string empty');
    }
  );
});

test('string.match', async function () {
  await this.throws(
    () => is.string().match('lol'),
    /r must be an instance of RegExp/
  );

  const v = is.string().match(/lol/);

  this.eq(v.run('lol'), 'lol');
  this.eq(v.run('lollygag'), 'lollygag');
  this.eq(v.run('loblolly'), 'loblolly');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('rofl'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'rofl');
      this.eq(err.expected, 'a string matching /lol/');
    }
  );
});

test('string.contains', async function () {
  await this.throws(() => is.string().contains(123), /str must be a string/);
  const v = is.string().contains('lol');

  this.eq(v.run('lol'), 'lol');
  this.eq(v.run('lollygag'), 'lollygag');
  this.eq(v.run('loblolly'), 'loblolly');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('rofl'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'rofl');
      this.eq(err.expected, "a string containing 'lol'");
    }
  );
});

test('string.eq', async function () {
  await this.throws(() => is.string().eq(123), /str must be a string/);
  const v = is.string().eq('lol');

  this.eq(v.run('lol'), 'lol');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('lollygag'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lollygag');
      this.eq(err.expected, "a string equal to 'lol'");
    }
  );
});

test('string.ne', async function () {
  await this.throws(() => is.string().ne(123), /str must be a string/);
  const v = is.string().ne('lol');

  this.eq(v.run('loblolly'), 'loblolly');
  this.eq(v.run('lollygag'), 'lollygag');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, "a string not equal to 'lol'");
    }
  );
});

test('string.in', async function () {
  await this.throws(() => is.string().in('lol'), /xs must be an array/);
  await this.throws(
    () => is.string().in([123]),
    /xs must contain only strings/
  );
  const v = is.string().in(['lol', 'rofl']);

  this.eq(v.run('lol'), 'lol');
  this.eq(v.run('rofl'), 'rofl');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run('lollygag'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lollygag');
      this.eq(err.expected, "a string in ['lol', 'rofl']");
    }
  );
});

test('string.where', async function () {
  await await this.throws(() => {
    is.string()
      .where(
        'length',
        is.number().map((x) => x + 1)
      )
      .run('aoeu');
  }, /Cannot assign to read only property 'length' of string 'aoeu'/);

  const v = is.string().where('length', is.number().gt(1));

  this.eq(v.run('ab'), 'ab');
  this.eq(v.run('abc'), 'abc');

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run([]),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, []);
      this.eq(err.expected, 'a string');
    }
  );
  await this.throws(
    () => v.run(''),
    async function (err) {
      this.eq(err.property, 'input.length');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a number greater than 1');
    }
  );
  await this.throws(
    () => v.run('a'),
    async function (err) {
      this.eq(err.property, 'input.length');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number greater than 1');
    }
  );
});
