'use strict';

const Node = require('../lib/tree');
const test = require('awfltst');

test('tree', async function () {
  const leaf = (content, path, ok) => new Node.Leaf({content, path, ok});

  test('Empty', async function () {
    const e1 = new Node.Empty();
    const e2 = new Node.Empty();
    const n1 = leaf('1', ['input'], false);

    this.ok(e1.not() === e1);
    this.ok(e1.and(n1) === n1);
    this.ok(e1.or(e2) === e2);
    this.ok(e1.or(n1) === n1);
  });

  test('Leaf', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true);
      const n2 = leaf('2', ['input'], true);
      const n3 = leaf('3', ['input'], true);

      this.eq(n1.and(e).renderText(), '1');
      this.eq(n1.or(e).renderText(), '1');

      this.eq(n1.renderText(), '1');
      this.eq(n1.not().renderText(), 'not 1');
      this.eq(n1.not().not().renderText(), '1');

      this.eq(n1.and(n2).prefix('where').renderText(), 'where 1 and 2');
      this.eq(n1.and(n2.prefix('where')).renderText(), '1 and (where 2)');
      this.eq(n1.prefix('where').and(n2).renderText(), '(where 1) and 2');

      this.eq(n1.and(n2).and(n3).renderText(), '1, 2 and 3');
      this.eq(n1.and(n2.and(n3)).renderText(), '1, 2 and 3');

      this.eq(n1.or(n2).and(n3).renderText(), '(either 1 or 2) and 3');
      this.eq(n1.or(n2.and(n3)).renderText(), 'either 1 or (2 and 3)');

      this.eq(n1.and(n2).or(n3).renderText(), 'either (1 and 2) or 3');
      this.eq(n1.and(n2.or(n3)).renderText(), '1 and (either 2 or 3)');

      this.eq(n1.or(n2).or(n3).renderText(), 'either 1, 2 or 3');
      this.eq(n1.or(n2.or(n3)).renderText(), 'either 1, 2 or 3');
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false);
      const n2 = leaf('2', ['input'], false);
      const n3 = leaf('3', ['input'], false);

      this.eq(n1.and(e).renderTree(), '✘ 1');
      this.eq(n1.or(e).renderTree(), '✘ 1');

      this.eq(n1.renderTree(), '✘ 1');
      this.eq(n1.not().renderTree(), '✔ not 1');
      this.eq(n1.not().not().renderTree(), '✘ 1');

      this.eq(
        n1.and(n2).prefix('where').renderTree(),
        '✘ where\n├─ ✘ 1\n└─ ✘ 2'
      );
      this.eq(
        n1.and(n2.prefix('where')).renderTree(),
        '✘ 1\n└─ ✘ where\n   └─ ✘ 2'
      );
      this.eq(
        n1.prefix('where').and(n2).renderTree(),
        '✘\n├─ ✘ where\n│  └─ ✘ 1\n└─ ✘ 2'
      );

      this.eq(n1.and(n2).and(n3).renderTree(), '✘ 1\n├─ ✘ 2\n└─ ✘ 3');
      this.eq(n1.and(n2.and(n3)).renderTree(), '✘ 1\n├─ ✘ 2\n└─ ✘ 3');

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✘ 3'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n└─ ✘ 2\n   └─ ✘ 3'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ 1\n│  └─ ✘ 2\n└─ ✘ 3'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✘ 1\n└─ ✘ either\n   ├─ ✘ 2\n   └─ ✘ 3'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ 1\n├─ ✘ 2\n└─ ✘ 3'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n├─ ✘ 2\n└─ ✘ 3'
      );
    });

    test('long text', async function () {
      const l = 'aoeusnthaoeusnthaoeusnthaoeusnthaoeusnthaoeusnth';
      const n = leaf(l, ['input'], true);

      this.eq(n.renderText(), l);
      this.eq(n.and(n).renderText(), `${l}\n    ${l}`);
      this.eq(n.and(n).and(n).renderText(), `${l}\n    ${l}\n    ${l}`);
    });
  });

  test('Leaf.not', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true).not();
      const n2 = leaf('2', ['input'], true).not();
      const n3 = leaf('3', ['input'], true).not();

      this.eq(n1.and(e).renderText(), 'not 1');
      this.eq(n1.or(e).renderText(), 'not 1');

      this.eq(n1.renderText(), 'not 1');
      this.eq(n1.not().renderText(), '1');
      this.eq(n1.not().not().renderText(), 'not 1');

      this.eq(n1.and(n2).and(n3).renderText(), 'not 1, not 2 and not 3');
      this.eq(n1.and(n2.and(n3)).renderText(), 'not 1, not 2 and not 3');

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '(either not 1 or not 2) and not 3'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either not 1 or (not 2 and not 3)'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either (not 1 and not 2) or not 3'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        'not 1 and (either not 2 or not 3)'
      );

      this.eq(n1.or(n2).or(n3).renderText(), 'either not 1, not 2 or not 3');
      this.eq(n1.or(n2.or(n3)).renderText(), 'either not 1, not 2 or not 3');
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false).not();
      const n2 = leaf('2', ['input'], false).not();
      const n3 = leaf('3', ['input'], false).not();

      this.eq(n1.and(e).renderTree(), '✔ not 1');
      this.eq(n1.or(e).renderTree(), '✔ not 1');

      this.eq(n1.renderTree(), '✔ not 1');
      this.eq(n1.not().renderTree(), '✘ 1');
      this.eq(n1.not().not().renderTree(), '✔ not 1');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✔ not 1\n├─ ✔ not 2\n└─ ✔ not 3'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✔ not 1\n├─ ✔ not 2\n└─ ✔ not 3'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✔\n├─ ✔ either\n│  ├─ ✔ not 1\n│  └─ ✔ not 2\n└─ ✔ not 3'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✔ either\n├─ ✔ not 1\n└─ ✔ not 2\n   └─ ✔ not 3'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔ not 1\n│  └─ ✔ not 2\n└─ ✔ not 3'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✔ not 1\n└─ ✔ either\n   ├─ ✔ not 2\n   └─ ✔ not 3'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔ not 1\n├─ ✔ not 2\n└─ ✔ not 3'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✔ either\n├─ ✔ not 1\n├─ ✔ not 2\n└─ ✔ not 3'
      );
    });
  });

  test('Branch', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true).prefix('where');
      const n2 = leaf('2', ['input'], true).prefix('where');
      const n3 = leaf('3', ['input'], true).prefix('where');

      this.eq(n1.and(e).renderText(), 'where 1');
      this.eq(n1.or(e).renderText(), 'where 1');

      this.eq(n1.renderText(), 'where 1');
      this.eq(n1.not().renderText(), 'not (where 1)');
      this.eq(n1.not().not().renderText(), 'where 1');

      this.eq(
        n1.and(n2).and(n3).renderText(),
        '(where 1), (where 2) and (where 3)'
      );
      this.eq(
        n1.and(n2.and(n3)).renderText(),
        '(where 1), (where 2) and (where 3)'
      );

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '(either (where 1) or (where 2)) and (where 3)'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either (where 1) or ((where 2) and (where 3))'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either ((where 1) and (where 2)) or (where 3)'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        '(where 1) and (either (where 2) or (where 3))'
      );

      this.eq(
        n1.or(n2).or(n3).renderText(),
        'either (where 1), (where 2) or (where 3)'
      );
      this.eq(
        n1.or(n2.or(n3)).renderText(),
        'either (where 1), (where 2) or (where 3)'
      );
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false).prefix('where');
      const n2 = leaf('2', ['input'], false).prefix('where');
      const n3 = leaf('3', ['input'], false).prefix('where');

      this.eq(n1.and(e).renderTree(), '✘ where\n└─ ✘ 1');
      this.eq(n1.or(e).renderTree(), '✘ where\n└─ ✘ 1');

      this.eq(n1.renderTree(), '✘ where\n└─ ✘ 1');
      this.eq(n1.not().renderTree(), '✔ not\n└─ ✘ where\n   └─ ✘ 1');
      this.eq(n1.not().not().renderTree(), '✘ where\n└─ ✘ 1');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✘\n├─ ✘ where\n│  └─ ✘ 1\n├─ ✘ where\n│  └─ ✘ 2\n└─ ✘ where\n' +
          '   └─ ✘ 3'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✘\n├─ ✘ where\n│  └─ ✘ 1\n├─ ✘ where\n│  └─ ✘ 2\n└─ ✘ where\n' +
          '   └─ ✘ 3'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ where\n│  │  └─ ✘ 1\n│  └─ ✘ where\n' +
          '│     └─ ✘ 2\n└─ ✘ where\n   └─ ✘ 3'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✘ either\n├─ ✘ where\n│  └─ ✘ 1\n└─ ✘\n   ├─ ✘ where\n' +
          '   │  └─ ✘ 2\n   └─ ✘ where\n      └─ ✘ 3'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘\n│  ├─ ✘ where\n│  │  └─ ✘ 1\n│  └─ ✘ where\n' +
          '│     └─ ✘ 2\n└─ ✘ where\n   └─ ✘ 3'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✘\n├─ ✘ where\n│  └─ ✘ 1\n└─ ✘ either\n   ├─ ✘ where\n' +
          '   │  └─ ✘ 2\n   └─ ✘ where\n      └─ ✘ 3'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ where\n│  └─ ✘ 1\n├─ ✘ where\n│  └─ ✘ 2\n' +
          '└─ ✘ where\n   └─ ✘ 3'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✘ either\n├─ ✘ where\n│  └─ ✘ 1\n├─ ✘ where\n│  └─ ✘ 2\n' +
          '└─ ✘ where\n   └─ ✘ 3'
      );
    });
  });

  test('And', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true).and(leaf('2', ['input'], true));
      const n2 = leaf('3', ['input'], true).and(leaf('4', ['input'], true));
      const n3 = leaf('5', ['input'], true).and(leaf('6', ['input'], true));

      this.eq(n1.and(e).renderText(), '1 and 2');
      this.eq(n1.or(e).renderText(), '1 and 2');

      this.eq(n1.renderText(), '1 and 2');
      this.eq(n1.not().renderText(), 'not (1 and 2)');
      this.eq(n1.not().not().renderText(), '1 and 2');

      this.eq(n1.and(n2).and(n3).renderText(), '1, 2, 3, 4, 5 and 6');
      this.eq(n1.and(n2.and(n3)).renderText(), '1, 2, 3, 4, 5 and 6');

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '(either (1 and 2) or (3 and 4)), 5 and 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either (1 and 2) or (3, 4, 5 and 6)'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either (1, 2, 3 and 4) or (5 and 6)'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        '1, 2 and (either (3 and 4) or (5 and 6))'
      );

      this.eq(
        n1.or(n2).or(n3).renderText(),
        'either (1 and 2), (3 and 4) or (5 and 6)'
      );
      this.eq(
        n1.or(n2.or(n3)).renderText(),
        'either (1 and 2), (3 and 4) or (5 and 6)'
      );
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false).and(leaf('2', ['input'], false));
      const n2 = leaf('3', ['input'], false).and(leaf('4', ['input'], false));
      const n3 = leaf('5', ['input'], false).and(leaf('6', ['input'], false));

      this.eq(n1.and(e).renderTree(), '✘ 1\n└─ ✘ 2');
      this.eq(n1.or(e).renderTree(), '✘ 1\n└─ ✘ 2');

      this.eq(n1.renderTree(), '✘ 1\n└─ ✘ 2');
      this.eq(n1.not().renderTree(), '✔ not\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().not().renderTree(), '✘ 1\n└─ ✘ 2');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✘ 1\n├─ ✘ 2\n├─ ✘ 3\n├─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✘ 1\n├─ ✘ 2\n├─ ✘ 3\n├─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  │  └─ ✘ 2\n│  └─ ✘ 3\n' +
          '│     └─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n│  └─ ✘ 2\n└─ ✘ 3\n   ├─ ✘ 4\n   ├─ ✘ 5\n' +
          '   └─ ✘ 6'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ 1\n│  ├─ ✘ 2\n│  ├─ ✘ 3\n│  └─ ✘ 4\n└─ ✘ 5\n' +
          '   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✘ 1\n├─ ✘ 2\n└─ ✘ either\n   ├─ ✘ 3\n   │  └─ ✘ 4\n   └─ ✘ 5\n' +
          '      └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ 1\n│  └─ ✘ 2\n├─ ✘ 3\n│  └─ ✘ 4\n└─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n│  └─ ✘ 2\n├─ ✘ 3\n│  └─ ✘ 4\n└─ ✘ 5\n   └─ ✘ 6'
      );
    });
  });

  test('Or', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true).or(leaf('2', ['input'], true));
      const n2 = leaf('3', ['input'], true).or(leaf('4', ['input'], true));
      const n3 = leaf('5', ['input'], true).or(leaf('6', ['input'], true));

      this.eq(n1.and(e).renderText(), 'either 1 or 2');
      this.eq(n1.or(e).renderText(), 'either 1 or 2');

      this.eq(n1.renderText(), 'either 1 or 2');
      this.eq(n1.not().renderText(), 'neither 1 nor 2');
      this.eq(n1.not().not().renderText(), 'either 1 or 2');

      this.eq(
        n1.and(n2).and(n3).renderText(),
        '(either 1 or 2), (either 3 or 4) and (either 5 or 6)'
      );
      this.eq(
        n1.and(n2.and(n3)).renderText(),
        '(either 1 or 2), (either 3 or 4) and (either 5 or 6)'
      );

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '(either 1, 2, 3 or 4) and (either 5 or 6)'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either 1, 2 or ((either 3 or 4) and (either 5 or 6))'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either ((either 1 or 2) and (either 3 or 4)), 5 or 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        '(either 1 or 2) and (either 3, 4, 5 or 6)'
      );

      this.eq(n1.or(n2).or(n3).renderText(), 'either 1, 2, 3, 4, 5 or 6');
      this.eq(n1.or(n2.or(n3)).renderText(), 'either 1, 2, 3, 4, 5 or 6');
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false).or(leaf('2', ['input'], false));
      const n2 = leaf('3', ['input'], false).or(leaf('4', ['input'], false));
      const n3 = leaf('5', ['input'], false).or(leaf('6', ['input'], false));

      this.eq(n1.and(e).renderTree(), '✘ either\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.or(e).renderTree(), '✘ either\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(n1.renderTree(), '✘ either\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().renderTree(), '✔ neither\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().not().renderTree(), '✘ either\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✘ either\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✘ either\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✘ either\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✘ either\n   ├─ ✘ 5\n   └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  ├─ ✘ 2\n│  ├─ ✘ 3\n│  └─ ✘ 4\n' +
          '└─ ✘ either\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n├─ ✘ 2\n└─ ✘\n   ├─ ✘ either\n   │  ├─ ✘ 3\n' +
          '   │  └─ ✘ 4\n   └─ ✘ either\n      ├─ ✘ 5\n      └─ ✘ 6'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘\n│  ├─ ✘ either\n│  │  ├─ ✘ 1\n│  │  └─ ✘ 2\n' +
          '│  └─ ✘ either\n│     ├─ ✘ 3\n│     └─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✘\n├─ ✘ either\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✘ either\n   ├─ ✘ 3\n' +
          '   ├─ ✘ 4\n   ├─ ✘ 5\n   └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✘ either\n├─ ✘ 1\n├─ ✘ 2\n├─ ✘ 3\n├─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✘ either\n├─ ✘ 1\n├─ ✘ 2\n├─ ✘ 3\n├─ ✘ 4\n├─ ✘ 5\n└─ ✘ 6'
      );
    });
  });

  test('Nand', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true)
        .and(leaf('2', ['input'], true))
        .not();
      const n2 = leaf('3', ['input'], true)
        .and(leaf('4', ['input'], true))
        .not();
      const n3 = leaf('5', ['input'], true)
        .and(leaf('6', ['input'], true))
        .not();

      this.eq(n1.and(e).renderText(), 'not (1 and 2)');
      this.eq(n1.or(e).renderText(), 'not (1 and 2)');

      this.eq(n1.renderText(), 'not (1 and 2)');
      this.eq(n1.not().renderText(), '1 and 2');
      this.eq(n1.not().not().renderText(), 'not (1 and 2)');

      this.eq(
        n1.and(n2).and(n3).renderText(),
        '(not (1 and 2)), (not (3 and 4)) and (not (5 and 6))'
      );
      this.eq(
        n1.and(n2.and(n3)).renderText(),
        '(not (1 and 2)), (not (3 and 4)) and (not (5 and 6))'
      );

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '\n    either (not (1 and 2)) or (not (3 and 4))\n    not (5 and 6)'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either\n    not (1 and 2)\n    (not (3 and 4)) and (not (5 and 6))'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either\n    (not (1 and 2)) and (not (3 and 4))\n    not (5 and 6)'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        '\n    not (1 and 2)\n    either (not (3 and 4)) or (not (5 and 6))'
      );

      this.eq(
        n1.or(n2).or(n3).renderText(),
        'either (not (1 and 2)), (not (3 and 4)) or (not (5 and 6))'
      );
      this.eq(
        n1.or(n2.or(n3)).renderText(),
        'either (not (1 and 2)), (not (3 and 4)) or (not (5 and 6))'
      );
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false)
        .and(leaf('2', ['input'], false))
        .not();
      const n2 = leaf('3', ['input'], false)
        .and(leaf('4', ['input'], false))
        .not();
      const n3 = leaf('5', ['input'], false)
        .and(leaf('6', ['input'], false))
        .not();

      this.eq(n1.and(e).renderTree(), '✔ not\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.or(e).renderTree(), '✔ not\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(n1.renderTree(), '✔ not\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().renderTree(), '✘ 1\n└─ ✘ 2');
      this.eq(n1.not().not().renderTree(), '✔ not\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✔\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ not\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✔\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ not\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n   └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✔\n├─ ✔ either\n│  ├─ ✔ not\n│  │  ├─ ✘ 1\n│  │  └─ ✘ 2\n' +
          '│  └─ ✔ not\n│     ├─ ✘ 3\n│     └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n' +
          '   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✔ either\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✔\n   ├─ ✔ not\n' +
          '   │  ├─ ✘ 3\n   │  └─ ✘ 4\n   └─ ✔ not\n      ├─ ✘ 5\n' +
          '      └─ ✘ 6'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔\n│  ├─ ✔ not\n│  │  ├─ ✘ 1\n│  │  └─ ✘ 2\n' +
          '│  └─ ✔ not\n│     ├─ ✘ 3\n│     └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n' +
          '   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✔\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✔ either\n   ├─ ✔ not\n' +
          '   │  ├─ ✘ 3\n   │  └─ ✘ 4\n   └─ ✔ not\n      ├─ ✘ 5\n' +
          '      └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ not\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✔ either\n├─ ✔ not\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ not\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ not\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
    });
  });

  test('Nor', async function () {
    test('text', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], true)
        .or(leaf('2', ['input'], true))
        .not();
      const n2 = leaf('3', ['input'], true)
        .or(leaf('4', ['input'], true))
        .not();
      const n3 = leaf('5', ['input'], true)
        .or(leaf('6', ['input'], true))
        .not();

      this.eq(n1.and(e).renderText(), 'neither 1 nor 2');
      this.eq(n1.or(e).renderText(), 'neither 1 nor 2');

      this.eq(n1.renderText(), 'neither 1 nor 2');
      this.eq(n1.not().renderText(), 'either 1 or 2');
      this.eq(n1.not().not().renderText(), 'neither 1 nor 2');

      this.eq(
        n1.and(n2).and(n3).renderText(),
        '\n    neither 1 nor 2\n    neither 3 nor 4\n    neither 5 nor 6'
      );
      this.eq(
        n1.and(n2.and(n3)).renderText(),
        '\n    neither 1 nor 2\n    neither 3 nor 4\n    neither 5 nor 6'
      );

      this.eq(
        n1.or(n2).and(n3).renderText(),
        '\n    either (neither 1 nor 2) or (neither 3 nor 4)\n' +
          '    neither 5 nor 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderText(),
        'either\n    neither 1 nor 2\n' +
          '    (neither 3 nor 4) and (neither 5 nor 6)'
      );

      this.eq(
        n1.and(n2).or(n3).renderText(),
        'either\n    (neither 1 nor 2) and (neither 3 nor 4)\n' +
          '    neither 5 nor 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderText(),
        '\n    neither 1 nor 2\n' +
          '    either (neither 3 nor 4) or (neither 5 nor 6)'
      );

      this.eq(
        n1.or(n2).or(n3).renderText(),
        'either\n    neither 1 nor 2\n    neither 3 nor 4\n    neither 5 nor 6'
      );
      this.eq(
        n1.or(n2.or(n3)).renderText(),
        'either\n    neither 1 nor 2\n    neither 3 nor 4\n    neither 5 nor 6'
      );
    });

    test('tree', async function () {
      const e = new Node.Empty();
      const n1 = leaf('1', ['input'], false)
        .or(leaf('2', ['input'], false))
        .not();
      const n2 = leaf('3', ['input'], false)
        .or(leaf('4', ['input'], false))
        .not();
      const n3 = leaf('5', ['input'], false)
        .or(leaf('6', ['input'], false))
        .not();

      this.eq(n1.and(e).renderTree(), '✔ neither\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.or(e).renderTree(), '✔ neither\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(n1.renderTree(), '✔ neither\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().renderTree(), '✘ either\n├─ ✘ 1\n└─ ✘ 2');
      this.eq(n1.not().not().renderTree(), '✔ neither\n├─ ✘ 1\n└─ ✘ 2');

      this.eq(
        n1.and(n2).and(n3).renderTree(),
        '✔\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ neither\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ neither\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.and(n3)).renderTree(),
        '✔\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ neither\n│  ├─ ✘ 3\n' +
          '│  └─ ✘ 4\n└─ ✔ neither\n   ├─ ✘ 5\n   └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).and(n3).renderTree(),
        '✔\n├─ ✔ either\n│  ├─ ✔ neither\n│  │  ├─ ✘ 1\n│  │  └─ ✘ 2\n' +
          '│  └─ ✔ neither\n│     ├─ ✘ 3\n│     └─ ✘ 4\n└─ ✔ neither\n' +
          '   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.and(n3)).renderTree(),
        '✔ either\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✔\n' +
          '   ├─ ✔ neither\n   │  ├─ ✘ 3\n   │  └─ ✘ 4\n   └─ ✔ neither\n' +
          '      ├─ ✘ 5\n      └─ ✘ 6'
      );

      this.eq(
        n1.and(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔\n│  ├─ ✔ neither\n│  │  ├─ ✘ 1\n│  │  └─ ✘ 2\n' +
          '│  └─ ✔ neither\n│     ├─ ✘ 3\n│     └─ ✘ 4\n└─ ✔ neither\n' +
          '   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.and(n2.or(n3)).renderTree(),
        '✔\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n└─ ✔ either\n' +
          '   ├─ ✔ neither\n   │  ├─ ✘ 3\n   │  └─ ✘ 4\n   └─ ✔ neither\n' +
          '      ├─ ✘ 5\n      └─ ✘ 6'
      );

      this.eq(
        n1.or(n2).or(n3).renderTree(),
        '✔ either\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ neither\n' +
          '│  ├─ ✘ 3\n│  └─ ✘ 4\n└─ ✔ neither\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
      this.eq(
        n1.or(n2.or(n3)).renderTree(),
        '✔ either\n├─ ✔ neither\n│  ├─ ✘ 1\n│  └─ ✘ 2\n├─ ✔ neither\n' +
          '│  ├─ ✘ 3\n│  └─ ✘ 4\n└─ ✔ neither\n   ├─ ✘ 5\n   └─ ✘ 6'
      );
    });
  });
});
