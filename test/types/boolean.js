'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('boolean', async function () {
  const v = is.boolean();

  this.eq(v.run(false), false);
  this.eq(v.run(true), true);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a boolean');
    }
  );
});

test('boolean.true', async function () {
  const v = is.boolean().true();

  this.eq(v.run(true), true);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'a boolean true');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a boolean');
    }
  );
});

test('boolean.false', async function () {
  const v = is.boolean().false();

  this.eq(v.run(false), false);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'a boolean false');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a boolean');
    }
  );
});

test('boolean.not.true', async function () {
  const v = is.boolean().not.true();

  this.eq(v.run(false), false);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'a boolean not true');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a boolean');
    }
  );
});

test('boolean.not.false', async function () {
  const v = is.boolean().not.false();

  this.eq(v.run(true), true);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'a boolean not false');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a boolean');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a boolean');
    }
  );
});
