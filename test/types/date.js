'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('date', async function () {
  const v = is.date();

  const d1 = new Date();
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);
  this.eq(v.run(d3), d3);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
});

test('date.valid', async function () {
  const v = is.date().valid();

  const d1 = new Date();
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(err.expected, 'a date not Invalid Date');
    }
  );
});

test('date.invalid', async function () {
  const v = is.date().invalid();

  const d1 = new Date();
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d3), d3);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d1);
      this.eq(err.expected, 'a date Invalid Date');
    }
  );
  await this.throws(
    () => v.run(d2),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d2);
      this.eq(err.expected, 'a date Invalid Date');
    }
  );
});

test('date.gt', async function () {
  await this.throws(
    () => is.date().gt('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().gt(new Date('1969-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(err.expected, 'a date greater than 1969-01-01T00:00:00.000Z');
    }
  );
});

test('date.gte', async function () {
  await this.throws(
    () => is.date().gte('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().gte(new Date('1970-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(
        err.expected,
        'a date\n    greater than or equal to 1970-01-01T00:00:00.000Z'
      );
    }
  );
});

test('date.eq', async function () {
  await this.throws(
    () => is.date().eq('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().eq(new Date('1970-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d1);
      this.eq(err.expected, 'a date equal to 1970-01-01T00:00:00.000Z');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(err.expected, 'a date equal to 1970-01-01T00:00:00.000Z');
    }
  );
});

test('date.ne', async function () {
  await this.throws(
    () => is.date().ne('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().ne(new Date('1970-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d3), d3);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d2),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d2);
      this.eq(err.expected, 'a date not equal to 1970-01-01T00:00:00.000Z');
    }
  );
});

test('date.lte', async function () {
  await this.throws(
    () => is.date().lte('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().lte(new Date('2020-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(
        err.expected,
        'a date\n    less than or equal to 2020-01-01T00:00:00.000Z'
      );
    }
  );
});

test('date.lt', async function () {
  await this.throws(
    () => is.date().lt('lol'),
    /date must be an instance of Date/
  );
  const v = is.date().lt(new Date('2021-01-01'));

  const d1 = new Date('2020-01-01');
  const d2 = new Date(0);
  const d3 = new Date('lol');

  this.eq(v.run(d1), d1);
  this.eq(v.run(d2), d2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run({}),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, {});
      this.eq(err.expected, 'a date');
    }
  );
  await this.throws(
    () => v.run(d3),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, d3);
      this.eq(err.expected, 'a date less than 2021-01-01T00:00:00.000Z');
    }
  );
});

test('date.between', async function () {
  await this.test('inclusivity = default', async function () {
    await this.throws(
      () => is.date().between('lol', new Date()),
      /min must be an instance of Date/
    );
    await this.throws(
      () => is.date().between(new Date(), 'lol'),
      /max must be an instance of Date/
    );

    const v = is.date().between(new Date('2020-01-01'), new Date('2021-01-01'));

    const d1 = new Date('2019-12-31T23:59:59.999Z');
    const d2 = new Date('2020-01-01');
    const d3 = new Date('2020-01-01T00:00:00.001Z');
    const d4 = new Date('2020-12-31T23:59:59.999Z');
    const d5 = new Date('2021-01-01');
    const d6 = new Date('2021-01-01T00:00:00.001Z');

    this.eq(v.run(d2), d2);
    this.eq(v.run(d3), d3);
    this.eq(v.run(d4), d4);
    this.eq(v.run(d5), d5);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(d1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d1);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
    await this.throws(
      () => v.run(d6),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d6);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
  });

  await this.test('invalid inclusivity', async function () {
    await this.throws(
      () => is.date().between(new Date(), new Date(), '{}'),
      /inclusivity must be either '\(\)', '\(\]', '\[\)' or '\[\]'/
    );
  });

  await this.test("inclusivity = '()'", async function () {
    const v = is
      .date()
      .between(new Date('2020-01-01'), new Date('2021-01-01'), '()');

    const d1 = new Date('2019-12-31T23:59:59.999Z');
    const d2 = new Date('2020-01-01');
    const d3 = new Date('2020-01-01T00:00:00.001Z');
    const d4 = new Date('2020-12-31T23:59:59.999Z');
    const d5 = new Date('2021-01-01');
    const d6 = new Date('2021-01-01T00:00:00.001Z');

    this.eq(v.run(d3), d3);
    this.eq(v.run(d4), d4);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(d1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d1);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
    await this.throws(
      () => v.run(d2),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d2);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
    await this.throws(
      () => v.run(d5),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d5);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
    await this.throws(
      () => v.run(d6),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d6);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
  });

  await this.test("inclusivity = '(]'", async function () {
    const v = is
      .date()
      .between(new Date('2020-01-01'), new Date('2021-01-01'), '(]');

    const d1 = new Date('2019-12-31T23:59:59.999Z');
    const d2 = new Date('2020-01-01');
    const d3 = new Date('2020-01-01T00:00:00.001Z');
    const d4 = new Date('2020-12-31T23:59:59.999Z');
    const d5 = new Date('2021-01-01');
    const d6 = new Date('2021-01-01T00:00:00.001Z');

    this.eq(v.run(d3), d3);
    this.eq(v.run(d4), d4);
    this.eq(v.run(d5), d5);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(d1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d1);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
    await this.throws(
      () => v.run(d2),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d2);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
    await this.throws(
      () => v.run(d6),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d6);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '(2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
  });

  await this.test("inclusivity = '[)'", async function () {
    const v = is
      .date()
      .between(new Date('2020-01-01'), new Date('2021-01-01'), '[)');

    const d1 = new Date('2019-12-31T23:59:59.999Z');
    const d2 = new Date('2020-01-01');
    const d3 = new Date('2020-01-01T00:00:00.001Z');
    const d4 = new Date('2020-12-31T23:59:59.999Z');
    const d5 = new Date('2021-01-01');
    const d6 = new Date('2021-01-01T00:00:00.001Z');

    this.eq(v.run(d2), d2);
    this.eq(v.run(d3), d3);
    this.eq(v.run(d4), d4);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(d1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d1);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
    await this.throws(
      () => v.run(d5),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d5);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
    await this.throws(
      () => v.run(d6),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d6);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z)'
        );
      }
    );
  });

  await this.test("inclusivity = '[]'", async function () {
    const v = is
      .date()
      .between(new Date('2020-01-01'), new Date('2021-01-01'), '[]');

    const d1 = new Date('2019-12-31T23:59:59.999Z');
    const d2 = new Date('2020-01-01');
    const d3 = new Date('2020-01-01T00:00:00.001Z');
    const d4 = new Date('2020-12-31T23:59:59.999Z');
    const d5 = new Date('2021-01-01');
    const d6 = new Date('2021-01-01T00:00:00.001Z');

    this.eq(v.run(d2), d2);
    this.eq(v.run(d3), d3);
    this.eq(v.run(d4), d4);
    this.eq(v.run(d5), d5);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run({}),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, {});
        this.eq(err.expected, 'a date');
      }
    );
    await this.throws(
      () => v.run(d1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d1);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
    await this.throws(
      () => v.run(d6),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, d6);
        this.eq(
          err.expected,
          'a date\n    between ' +
            '[2020-01-01T00:00:00.000Z, 2021-01-01T00:00:00.000Z]'
        );
      }
    );
  });
});
