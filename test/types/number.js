'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('number', async function () {
  const v = is.number();

  this.eq(v.run(NaN), NaN);
  this.eq(v.run(-1), -1);
  this.eq(v.run(0), 0);
  this.eq(v.run(1), 1);
  this.eq(v.run(Infinity), Infinity);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );

  await this.throws(
    () => v.run(0n),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0n);
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.satisfy', async function () {
  await this.throws(
    () => is.number().satisfies(),
    /predicate must be a function/
  );
  const v = is.number().satisfy((x) => x % 2 === 0);

  this.eq(v.run(0), 0);
  this.eq(v.run(2), 2);
  this.eq(v.run(4), 4);
  this.eq(v.run(6), 6);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number satisfying anonymous function');
    }
  );
  await this.throws(
    () => v.run(Infinity),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Infinity);
      this.eq(err.expected, 'a number satisfying anonymous function');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number satisfying anonymous function');
    }
  );
});

test('number.nan', async function () {
  const v = is.number().nan();

  this.eq(v.run(NaN), NaN);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a number NaN');
    }
  );
  await this.throws(
    () => v.run(Infinity),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Infinity);
      this.eq(err.expected, 'a number NaN');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.finite', async function () {
  const v = is.number().finite();

  this.eq(v.run(-1), -1);
  this.eq(v.run(0), 0);
  this.eq(v.run(1), 1);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number finite');
    }
  );
  await this.throws(
    () => v.run(-Infinity),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, -Infinity);
      this.eq(err.expected, 'a number finite');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.gt', async function () {
  await this.throws(() => is.number().gt('lol'), /n must be a number/);
  const v = is.number().gt(1);

  this.eq(v.run(2), 2);
  this.eq(v.run(3), 3);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number greater than 1');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number greater than 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.gte', async function () {
  await this.throws(() => is.number().gte('lol'), /n must be a number/);
  const v = is.number().gte(1);

  this.eq(v.run(1), 1);
  this.eq(v.run(2), 2);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number greater than or equal to 1');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a number greater than or equal to 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.eq', async function () {
  await this.throws(() => is.number().eq('lol'), /n must be a number/);
  const v = is.number().eq(1);

  this.eq(v.run(1), 1);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number equal to 1');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a number equal to 1');
    }
  );
  await this.throws(
    () => v.run(2),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 2);
      this.eq(err.expected, 'a number equal to 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.ne', async function () {
  await this.throws(() => is.number().ne('lol'), /n must be a number/);
  const v = is.number().ne(1);

  this.eq(v.run(0), 0);
  this.eq(v.run(2), 2);
  this.eq(v.run(NaN), NaN);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number not equal to 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.lte', async function () {
  await this.throws(() => is.number().lte('lol'), /n must be a number/);
  const v = is.number().lte(1);

  this.eq(v.run(0), 0);
  this.eq(v.run(1), 1);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number less than or equal to 1');
    }
  );
  await this.throws(
    () => v.run(2),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 2);
      this.eq(err.expected, 'a number less than or equal to 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.lt', async function () {
  await this.throws(() => is.number().lt('lol'), /n must be a number/);
  const v = is.number().lt(1);

  this.eq(v.run(-1), -1);
  this.eq(v.run(0), 0);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number less than 1');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number less than 1');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.between', async function () {
  await this.test('inclusivity = default', async function () {
    await this.throws(
      () => is.number().between('lol', 10),
      /min must be a number/
    );
    await this.throws(
      () => is.number().between(1, 'lol'),
      /max must be a number/
    );
    const v = is.number().between(1, 10);

    this.eq(v.run(1), 1);
    this.eq(v.run(10), 10);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(NaN),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(11),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 11);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(Object.create(null)),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Object.create(null));
        this.eq(err.expected, 'a number');
      }
    );
  });

  await this.test('invalid inclusivity', async function () {
    await this.throws(
      () => is.number().between(1, 10, '{}'),
      /inclusivity must be either '\(\)', '\(\]', '\[\)' or '\[\]'/
    );
  });

  await this.test("inclusivity = '()'", async function () {
    const v = is.number().between(1, 10, '()');

    this.eq(v.run(2), 2);
    this.eq(v.run(9), 9);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(NaN),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number between (1, 10)');
      }
    );
    await this.throws(
      () => v.run(1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 1);
        this.eq(err.expected, 'a number between (1, 10)');
      }
    );
    await this.throws(
      () => v.run(10),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 10);
        this.eq(err.expected, 'a number between (1, 10)');
      }
    );
    await this.throws(
      () => v.run(Object.create(null)),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Object.create(null));
        this.eq(err.expected, 'a number');
      }
    );
  });

  await this.test("inclusivity = '(]'", async function () {
    const v = is.number().between(1, 10, '(]');

    this.eq(v.run(2), 2);
    this.eq(v.run(10), 10);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(NaN),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number between (1, 10]');
      }
    );
    await this.throws(
      () => v.run(1),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 1);
        this.eq(err.expected, 'a number between (1, 10]');
      }
    );
    await this.throws(
      () => v.run(11),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 11);
        this.eq(err.expected, 'a number between (1, 10]');
      }
    );
    await this.throws(
      () => v.run(Object.create(null)),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Object.create(null));
        this.eq(err.expected, 'a number');
      }
    );
  });

  await this.test("inclusivity = '[)'", async function () {
    const v = is.number().between(1, 10, '[)');

    this.eq(v.run(1), 1);
    this.eq(v.run(9), 9);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(NaN),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number between [1, 10)');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number between [1, 10)');
      }
    );
    await this.throws(
      () => v.run(10),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 10);
        this.eq(err.expected, 'a number between [1, 10)');
      }
    );
    await this.throws(
      () => v.run(Object.create(null)),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Object.create(null));
        this.eq(err.expected, 'a number');
      }
    );
  });

  await this.test("inclusivity = '[]'", async function () {
    const v = is.number().between(1, 10, '[]');

    this.eq(v.run(1), 1);
    this.eq(v.run(10), 10);

    await this.throws(
      () => v.run(null),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, null);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(undefined),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a number');
      }
    );
    await this.throws(
      () => v.run(NaN),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, NaN);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(0),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 0);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(11),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 11);
        this.eq(err.expected, 'a number between [1, 10]');
      }
    );
    await this.throws(
      () => v.run(Object.create(null)),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, Object.create(null));
        this.eq(err.expected, 'a number');
      }
    );
  });
});

test('number.in', async function () {
  await this.throws(() => is.number().in('lol'), /ns must be an array/);
  await this.throws(
    () => is.number().in(['lol']),
    /ns must contain only numbers/
  );
  const v = is.number().in([2, 3, 5, 7]);

  this.eq(v.run(2), 2);
  this.eq(v.run(7), 7);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number in [2, 3, 5, 7]');
    }
  );
  await this.throws(
    () => v.run(1),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 1);
      this.eq(err.expected, 'a number in [2, 3, 5, 7]');
    }
  );
  await this.throws(
    () => v.run(4),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 4);
      this.eq(err.expected, 'a number in [2, 3, 5, 7]');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.not.nan', async function () {
  const v = is.number().not.nan();

  this.eq(v.run(-1), -1);
  this.eq(v.run(0), 0);
  this.eq(v.run(1), 1);
  this.eq(v.run(Infinity), Infinity);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(NaN),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, NaN);
      this.eq(err.expected, 'a number not NaN');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});

test('number.not.finite', async function () {
  const v = is.number().not.finite();

  this.eq(v.run(NaN), NaN);
  this.eq(v.run(Infinity), Infinity);

  await this.throws(
    () => v.run(null),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, null);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(undefined),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, undefined);
      this.eq(err.expected, 'a number');
    }
  );
  await this.throws(
    () => v.run(0),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, 0);
      this.eq(err.expected, 'a number not finite');
    }
  );
  await this.throws(
    () => v.run(Object.create(null)),
    async function (err) {
      this.eq(err.property, 'input');
      this.eq(err.actual, Object.create(null));
      this.eq(err.expected, 'a number');
    }
  );
});
