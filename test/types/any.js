'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('any', async function () {
  const v = is.any();

  this.eq(v.run(), undefined);
  this.eq(v.run(null), null);
  this.eq(v.run(undefined), undefined);
  this.eq(v.run(false), false);
  this.eq(v.run(NaN), NaN);
  this.eq(v.run(0), 0);
  this.eq(v.run(Object.create(null)), Object.create(null));
  this.eq(v.run({}), {});
  this.eq(v.run([]), []);
});

test('any.nullish', async function () {
  const v = is.any().nullish();

  this.eq(v.run(null), null);
  this.eq(v.run(undefined), undefined);

  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'anything nullish');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'anything nullish');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'anything nullish');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'anything nullish');
    }
  );
});

test('any.truthy', async function () {
  const v = is.any().truthy();

  this.eq(v.run(true), true);
  this.eq(v.run(1), 1);
  this.eq(v.run('lol'), 'lol');
  this.eq(v.run(Object.create(null)), Object.create(null));

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'anything truthy');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'anything truthy');
    }
  );
  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'anything truthy');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'anything truthy');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'anything truthy');
    }
  );
  await this.throws(
    () => v.run(''),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, '');
      this.eq(err.expected, 'anything truthy');
    }
  );
});

test('any.falsy', async function () {
  const v = is.any().falsy();

  this.eq(v.run(null), null);
  this.eq(v.run(undefined), undefined);
  this.eq(v.run(false), false);
  this.eq(v.run(NaN), NaN);
  this.eq(v.run(0), 0);
  this.eq(v.run(''), '');

  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'anything falsy');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'anything falsy');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'anything falsy');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'anything falsy');
    }
  );
});

test('any.not', async function () {
  await this.throws(
    () => is.any().not(),
    /validator must be an instance of Monadidator/
  );
  const v = is.any().not(is.string());

  this.eq(v.run(null), null);
  this.eq(v.run(undefined), undefined);
  this.eq(v.run(false), false);
  this.eq(v.run(true), true);
  this.eq(v.run(NaN), NaN);
  this.eq(v.run(0), 0);
  this.eq(v.run(1), 1);
  this.eq(v.run([]), []);

  await this.throws(
    () => v.run(''),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, '');
      this.eq(err.expected, 'anything and not a string');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'anything and not a string');
    }
  );
});

test('any.not.truthy', async function () {
  const v = is.any().not.truthy();

  this.eq(v.run(null), null);
  this.eq(v.run(undefined), undefined);
  this.eq(v.run(false), false);
  this.eq(v.run(NaN), NaN);
  this.eq(v.run(0), 0);
  this.eq(v.run(''), '');

  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'anything not truthy');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'anything not truthy');
    }
  );
  await this.throws(
    () => v.run('lol'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'lol');
      this.eq(err.expected, 'anything not truthy');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'anything not truthy');
    }
  );
});

test('any.not.falsy', async function () {
  const v = is.any().not.falsy();

  this.eq(v.run(true), true);
  this.eq(v.run(1), 1);
  this.eq(v.run('lol'), 'lol');
  this.eq(v.run(Object.create(null)), Object.create(null));

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'anything not falsy');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'anything not falsy');
    }
  );
  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'anything not falsy');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'anything not falsy');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'anything not falsy');
    }
  );
  await this.throws(
    () => v.run(''),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, '');
      this.eq(err.expected, 'anything not falsy');
    }
  );
});
