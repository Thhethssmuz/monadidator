'use strict';
/* eslint-disable no-empty-function */

const {is} = require('../..');
const test = require('awfltst');

test('function', async function () {
  const v = is.function();

  const f1 = () => {};
  const f2 = function () {};
  const f3 = async function () {};
  const f4 = function* () {};
  const f5 = async function* nameedFunction() {};
  const f6 = Math.floor;

  this.eq(v.run(f1), f1);
  this.eq(v.run(f2), f2);
  this.eq(v.run(f3), f3);
  this.eq(v.run(f4), f4);
  this.eq(v.run(f5), f5);
  this.eq(v.run(f6), f6);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a function');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a function');
    }
  );
  await this.throws(
    () => v.run('function () {}'),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 'function () {}');
      this.eq(err.expected, 'a function');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a function');
    }
  );
});
