'use strict';
/* eslint-disable getter-return, no-empty-function */

const show = require('../lib/show');
const test = require('awfltst');

test('show', async function () {
  this.eq(show(null), 'null');
  this.eq(show(undefined), 'undefined');
  this.eq(show(true), 'true');
  this.eq(show(false), 'false');
  this.eq(show(NaN), 'NaN');
  this.eq(show(Infinity), 'Infinity');
  this.eq(show(-Infinity), '-Infinity');
  this.eq(show(0), '0');
  this.eq(show(0n), '0n');
  this.eq(show(''), "''");
  this.eq(show('lol'), "'lol'");
  this.eq(show(Symbol('test')), "Symbol('test')");
  this.eq(show(new Date('lol')), 'Invalid Date');
  this.eq(show(new Date('2022-01-01')), '2022-01-01T00:00:00.000Z');
  this.eq(show(/^\d+$/), '/^\\d+$/');
  this.eq(show(/^\d+$/g), '/^\\d+$/g');
  this.eq(show([]), '[]');
  this.eq(show([1, 2, 3]), '[1, 2, 3]');
  this.eq(show({}), '{}');
  this.eq(show({a: 1}), '{a: 1}');
  this.eq(show(Object.create(null)), '[Object: null prototype] {}');
  this.eq(show(new (class X {})()), 'X {}');
  this.eq(show(new Error('lol')), 'Error {...}');
  this.eq(
    show(() => {}),
    '[Function (anonymous)]'
  );
  this.eq(
    show(async () => {}),
    '[Function (anonymous)]'
  );
  this.eq(show(Buffer.from('lol')), "Buffer {'0': 108, '1': 111, '2': 108}");
});

test('show.string', async function () {
  this.eq(show.string('aoeu', -1), "''...");
  this.eq(show.string('aoeu', 0), "''...");
  this.eq(show.string('aoeu', 1), "''...");
  this.eq(show.string('aoeu', 2), "''...");
  this.eq(show.string('aoeu', 3), "''...");
  this.eq(show.string('aoeu', 4), "''...");
  this.eq(show.string('aoeu', 5), "''...");
  this.eq(show.string('aoeu', 6), "'aoeu'");
  this.eq(show.string('aoeu', 7), "'aoeu'");
  this.eq(show.string('aoeu', 8), "'aoeu'");

  this.eq(show.string('testing', 5), "''...");
  this.eq(show.string('testing', 6), "'t'...");
  this.eq(show.string('testing', 7), "'te'...");
  this.eq(show.string('testing', 8), "'tes'...");
  this.eq(show.string('testing', 9), "'testing'");

  this.eq(show.string('abcdefghijklmnopqrstuvwxyz', 10), "'abcde'...");
  this.eq(show.string('abcdefghij', 10), "'abcde'...");
  this.eq(show.string('abcdefghi', 10), "'abcde'...");
  this.eq(show.string('abcdefgh', 10), "'abcdefgh'");
  this.eq(show.string('abcdefg', 10), "'abcdefg'");
  this.eq(show.string('abcdef', 10), "'abcdef'");

  this.eq(show.string("\0\b\t\n\v\f\r'\\"), "'\\0\\b\\t\\n\\v\\f\\r\\'\\\\'");
  this.eq(show.string('abc\x07\x08æaå'), "'abc\\x07\\bæaå'");
});

test('show.symbol', async function () {
  this.eq(show.symbol(Symbol('abcdefghij'), 16), "Symbol('abc'...)");
  this.eq(show.symbol(Symbol('abcdefghi'), 16), "Symbol('abc'...)");
  this.eq(show.symbol(Symbol('abcdefg'), 16), "Symbol('abc'...)");
  this.eq(show.symbol(Symbol('abcdef'), 16), "Symbol('abcdef')");
  this.eq(show.symbol(Symbol('abcde'), 16), "Symbol('abcde')");
  this.eq(show.symbol(Symbol('abcd'), 16), "Symbol('abcd')");
});

test('show.array', async function () {
  this.eq(show.array([1, 2, 3], -1), '[...]');
  this.eq(show.array([1, 2, 3], 0), '[...]');
  this.eq(show.array([1, 2, 3], 1), '[...]');
  this.eq(show.array([1, 2, 3], 2), '[...]');
  this.eq(show.array([1, 2, 3], 3), '[...]');
  this.eq(show.array([1, 2, 3], 4), '[...]');
  this.eq(show.array([1, 2, 3], 5), '[...]');
  this.eq(show.array([1, 2, 3], 6), '[...]');
  this.eq(show.array([1, 2, 3], 7), '[...]');
  this.eq(show.array([1, 2, 3], 8), '[1, ...]');
  this.eq(show.array([1, 2, 3], 9), '[1, 2, 3]');
  this.eq(show.array([1, 2, 3], 10), '[1, 2, 3]');

  this.eq(show.array([1, 2, 3, 4, 5, 6, 7, 8], 19), '[1, 2, 3, 4, ...]');
  this.eq(show.array([1, 2, 3, 4, 5, 6, 7], 19), '[1, 2, 3, 4, ...]');
  this.eq(show.array([1, 2, 3, 4, 5, 6], 19), '[1, 2, 3, 4, 5, 6]');
  this.eq(show.array([1, 2, 3, 4, 5], 19), '[1, 2, 3, 4, 5]');
  this.eq(show.array([1, 2, 3, 4], 19), '[1, 2, 3, 4]');
  this.eq(show.array([1, 2, 3], 19), '[1, 2, 3]');

  this.eq(show.array([1, 2, 3, 4, 5, 6, 7, 8], 20), '[1, 2, 3, 4, 5, ...]');
  this.eq(show.array([1, 2, 3, 4, 5, 6, 7], 20), '[1, 2, 3, 4, 5, ...]');
  this.eq(show.array([1, 2, 3, 4, 5, 6], 20), '[1, 2, 3, 4, 5, 6]');
  this.eq(show.array([1, 2, 3, 4, 5], 20), '[1, 2, 3, 4, 5]');
  this.eq(show.array([1, 2, 3, 4], 20), '[1, 2, 3, 4]');
  this.eq(show.array([1, 2, 3], 20), '[1, 2, 3]');
});

test('show.date', async function () {
  this.eq(show.date(new Date('2022-01-01')), '2022-01-01T00:00:00.000Z');
  this.eq(show.date(new Date('lol')), 'Invalid Date');
});

test('show.regexp', async function () {
  this.eq(show.regexp(/^\d+$/gi, -1), '//... /gi');
  this.eq(show.regexp(/^\d+$/gi, 0), '//... /gi');
  this.eq(show.regexp(/^\d+$/gi, 1), '//... /gi');

  this.eq(show.regexp(/^\d+$/gi, 7), '//... /gi');
  this.eq(show.regexp(/^\d+$/gi, 8), '//... /gi');
  this.eq(show.regexp(/^\d+$/gi, 9), '/^\\d+$/gi');
  this.eq(show.regexp(/^\d+$/gi, 10), '/^\\d+$/gi');
  this.eq(show.regexp(/^\d+$/gi, 11), '/^\\d+$/gi');
  this.eq(show.regexp(/^\d+$/gi, 12), '/^\\d+$/gi');

  this.eq(show.regexp(/^testing$/gi, 8), '//... /gi');
  this.eq(show.regexp(/^testing$/gi, 9), '//... /gi');
  this.eq(show.regexp(/^testing$/gi, 10), '/^/... /gi');
  this.eq(show.regexp(/^testing$/gi, 11), '/^t/... /gi');
  this.eq(show.regexp(/^testing$/gi, 12), '/^te/... /gi');
  this.eq(show.regexp(/^testing$/gi, 13), '/^testing$/gi');
  this.eq(show.regexp(/^testing$/gi, 14), '/^testing$/gi');

  this.eq(show.regexp(/^[0123456789]+$/gi, 16), '/^[01234/... /gi');
  this.eq(show.regexp(/^[012345678]+$/gi, 16), '/^[01234/... /gi');
  this.eq(show.regexp(/^[01234567]+$/gi, 16), '/^[01234/... /gi');
  this.eq(show.regexp(/^[0123456]+$/gi, 16), '/^[0123456]+$/gi');
  this.eq(show.regexp(/^[012345]+$/gi, 16), '/^[012345]+$/gi');
  this.eq(show.regexp(/^[01234]+$/gi, 16), '/^[01234]+$/gi');
});

test('show.accessor', async function () {
  this.eq(show.accessor(0), '[0]');
  this.eq(show.accessor(1), '[1]');
  this.eq(show.accessor(-1), "['-1']");
  this.eq(show.accessor(0.1), "['0.1']");

  this.eq(show.accessor(Symbol(1)), "[Symbol('1')]");
  this.eq(show.accessor(Symbol('a')), "[Symbol('a')]");
  this.eq(show.accessor(Symbol('abcdefgh'), 18), "[Symbol('abc'...)]");

  this.eq(show.accessor('a'), '.a');
  this.eq(show.accessor('a\0'), "['a\\0']");
  this.eq(show.accessor('abcdefghijklmnopqrstuvwxyz', 10), "['abcde'...]");
});

test('show.objectKey', async function () {
  this.eq(show.objectKey('testing', -1), "''...");
  this.eq(show.objectKey('testing', 0), "''...");
  this.eq(show.objectKey('testing', 1), "''...");
  this.eq(show.objectKey('testing', 2), "''...");
  this.eq(show.objectKey('testing', 3), "''...");
  this.eq(show.objectKey('testing', 4), "''...");
  this.eq(show.objectKey('testing', 5), "''...");
  this.eq(show.objectKey('testing', 6), "'t'...");
  this.eq(show.objectKey('testing', 7), 'testing');
  this.eq(show.objectKey('testing', 9), 'testing');

  this.eq(show.objectKey('abcdefghijklmnopqrstuvwxyz', 10), "'abcde'...");
  this.eq(show.objectKey('abcdefghijklm', 10), "'abcde'...");
  this.eq(show.objectKey('abcdefghijkl', 10), "'abcde'...");
  this.eq(show.objectKey('abcdefghijk', 10), "'abcde'...");
  this.eq(show.objectKey('abcdefghij', 10), 'abcdefghij');
  this.eq(show.objectKey('abcdefghi', 10), 'abcdefghi');
  this.eq(show.objectKey('abcdefgh', 10), 'abcdefgh');

  this.eq(show.objectKey(1), "'1'");

  this.eq(show.objectKey(Symbol('testing'), -1), "[Symbol(''...)]");
  this.eq(show.objectKey(Symbol('testing'), 0), "[Symbol(''...)]");
  this.eq(show.objectKey(Symbol('testing'), 1), "[Symbol(''...)]");

  this.eq(show.objectKey(Symbol('testing'), 14), "[Symbol(''...)]");
  this.eq(show.objectKey(Symbol('testing'), 15), "[Symbol(''...)]");
  this.eq(show.objectKey(Symbol('testing'), 16), "[Symbol('t'...)]");
  this.eq(show.objectKey(Symbol('testing'), 17), "[Symbol('te'...)]");
  this.eq(show.objectKey(Symbol('testing'), 18), "[Symbol('tes'...)]");
  this.eq(show.objectKey(Symbol('testing'), 19), "[Symbol('testing')]");
  this.eq(show.objectKey(Symbol('testing'), 20), "[Symbol('testing')]");
});

test('show.object', async function () {
  this.eq(show.object({a: 1}, -1), '{...}');
  this.eq(show.object({a: 1}, 0), '{...}');
  this.eq(show.object({a: 1}, 1), '{...}');
  this.eq(show.object({a: 1}, 2), '{...}');
  this.eq(show.object({a: 1}, 3), '{...}');
  this.eq(show.object({a: 1}, 4), '{...}');
  this.eq(show.object({a: 1}, 5), '{...}');
  this.eq(show.object({a: 1}, 6), '{a: 1}');
  this.eq(show.object({a: 1}, 7), '{a: 1}');

  this.eq(show.object({a: 1, b: 2}, 9), '{...}');
  this.eq(show.object({a: 1, b: 2}, 10), '{...}');
  this.eq(show.object({a: 1, b: 2}, 11), '{a: 1, ...}');
  this.eq(show.object({a: 1, b: 2}, 12), '{a: 1, b: 2}');
  this.eq(show.object({a: 1, b: 2}, 13), '{a: 1, b: 2}');

  this.eq(show.object({a: 10, b: 20}, 10), '{...}');
  this.eq(show.object({a: 10, b: 20}, 11), '{...}');
  this.eq(show.object({a: 10, b: 20}, 12), '{a: 10, ...}');
  this.eq(show.object({a: 10, b: 20}, 13), '{a: 10, ...}');
  this.eq(show.object({a: 10, b: 20}, 14), '{a: 10, b: 20}');
  this.eq(show.object({a: 10, b: 20}, 14), '{a: 10, b: 20}');

  this.eq(show.object({abcdefghijklmnopq: 1}, 20), '{...}');
  this.eq(show.object({abcdefghijklmnopq: 1}, 21), '{...}');
  this.eq(show.object({abcdefghijklmnopq: 1}, 22), '{abcdefghijklmnopq: 1}');
  this.eq(show.object({abcdefghijklmnopq: 1}, 23), '{abcdefghijklmnopq: 1}');

  this.eq(show.object({a: 123456789}, 12), '{...}');
  this.eq(show.object({a: 123456789}, 13), '{...}');
  this.eq(show.object({a: 123456789}, 14), '{a: 123456789}');
  this.eq(show.object({a: 123456789}, 15), '{a: 123456789}');

  this.eq(show.object({get a() {}}, 11), '{...}');
  this.eq(show.object({get a() {}}, 12), '{...}');
  this.eq(show.object({get a() {}}, 13), '{a: [Getter]}');
  this.eq(show.object({get a() {}}, 14), '{a: [Getter]}');

  this.eq(show.object({set a(a) {}}, 11), '{...}');
  this.eq(show.object({set a(a) {}}, 12), '{...}');
  this.eq(show.object({set a(a) {}}, 13), '{a: [Setter]}');
  this.eq(show.object({set a(a) {}}, 14), '{a: [Setter]}');

  this.eq(show.object({get a() {}, set a(a) {}}, 18), '{...}');
  this.eq(show.object({get a() {}, set a(a) {}}, 19), '{...}');
  this.eq(show.object({get a() {}, set a(a) {}}, 20), '{a: [Getter/Setter]}');
  this.eq(show.object({get a() {}, set a(a) {}}, 21), '{a: [Getter/Setter]}');

  this.eq(show.object(Object.create(null)), '[Object: null prototype] {}');
  this.eq(show.object(new (class X {})()), 'X {}');
});

test('show.fn', async function () {
  this.eq(
    show.fn(() => {}),
    '[Function (anonymous)]'
  );
  this.eq(
    show.fn(async () => {}),
    '[Function (anonymous)]'
  );
  this.eq(
    show.fn(function () {}),
    '[Function (anonymous)]'
  );
  this.eq(
    show.fn(async function () {}),
    '[Function (anonymous)]'
  );

  this.eq(
    show.fn(function f() {}),
    '[Function: f]'
  );
  this.eq(
    show.fn(function fn() {}),
    '[Function: fn]'
  );
});
