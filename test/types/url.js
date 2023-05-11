'use strict';

const {is} = require('../..');
const test = require('awfltst');

test('url', async function () {
  test('without baseUrl', async function () {
    const v = is.url();

    this.eq(v.run('https://localhost'), new URL('https://localhost'));
    this.eq(v.run(new URL('https://localhost')), new URL('https://localhost'));

    await this.throws(
      () => v.run(),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a url');
      }
    );
    await this.throws(
      () => v.run('lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, 'lol');
        this.eq(err.expected, 'a url');
      }
    );
    await this.throws(
      () => v.run('/lol'),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, '/lol');
        this.eq(err.expected, 'a url');
      }
    );
  });

  test('with baseUrl', async function () {
    await this.throws(() => is.url(123), /baseUrl must be a url/);
    await this.throws(() => is.url('lol'), /baseUrl must be a url/);
    await this.throws(() => is.url('/lol'), /baseUrl must be a url/);

    const v = is.url('https://localhost:3000/a/b/c?d=1');

    this.eq(v.run(''), new URL('https://localhost:3000/a/b/c?d=1'));
    this.eq(v.run('?e=2'), new URL('https://localhost:3000/a/b/c?e=2'));
    this.eq(v.run('lol'), new URL('https://localhost:3000/a/b/lol'));
    this.eq(v.run('/lol'), new URL('https://localhost:3000/lol'));
    this.eq(
      v.run('http://localhost:8080/lol'),
      new URL('http://localhost:8080/lol')
    );
    this.eq(
      v.run(new URL('http://localhost:8080/lol')),
      new URL('http://localhost:8080/lol')
    );

    await this.throws(
      () => v.run(),
      async function (err) {
        this.eq(err.property, 'input');
        this.eq(err.actual, undefined);
        this.eq(err.expected, 'a url');
      }
    );
  });

  test('sub-properties', async function () {
    const v = is
      .url('https://localhost')
      .where('protocol', is.string().eq('https:'));

    this.eq(v.run(''), new URL('https://localhost'));
    this.eq(v.run('/lol'), new URL('https://localhost/lol'));

    await this.throws(
      () => v.run('http://localhost'),
      async function (err) {
        this.eq(err.property, 'input.protocol');
        this.eq(err.actual, 'http:');
        this.eq(err.expected, "a string equal to 'https:'");
      }
    );
  });
});
