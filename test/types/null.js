'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('null', async function () {
  const v = is.null();

  this.eq(v.run(null), null);

  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'null');
    }
  );
  await this.throws(
    () => v.run(false),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, false);
      this.eq(err.expected, 'null');
    }
  );
  await this.throws(
    () => v.run(true),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, true);
      this.eq(err.expected, 'null');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'null');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'null');
    }
  );
});
