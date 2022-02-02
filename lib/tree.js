'use strict';

const {DYNAMIC_PATH, NEGATE} = require('./symbols');

const indent = (leading, trailing, str) => {
  return leading + str.split('\n').join('\n' + trailing);
};

/**
 * Path equality.
 * @private
 * @param {String[]} xs
 * @param {String[]} ys
 * @return {Boolean}
 */
const peq = (xs, ys) =>
  xs.length === ys.length && xs.every((x, i) => x === ys[i]);

const join = (xs) => xs.filter((x) => x && typeof x === 'string').join(' ');

const Node = class Node {
  constructor(opts = {}) {
    this.children = opts.children || [];
    this.content = opts.content || null;
    this.ok = opts.ok || false;
    this.path = opts.path || ['?'];
    this.type = opts.type || null;

    this.contentPrefix = opts.contentPrefix || null;
    this.branchPrefix = opts.branchPrefix || null;
    this.branchSeparator = opts.branchSeparator || null;
  }

  trim() {
    return this;
  }

  get checkmark() {
    return this.ok ? '✔' : '✘';
  }
};

Node.Empty = class Empty extends Node {
  and(node) {
    return node;
  }

  or(node) {
    return node;
  }

  not() {
    return this;
  }

  prefix() {
    return this;
  }
};

Node.Leaf = class Leaf extends Node {
  and(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.And) {
      return new Node.Branch.And({
        children: [this].concat(node.children),
        ok: this.ok && node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.And({
      children: [this].concat(node),
      ok: this.ok && node.ok,
      path: this.path,
      type: this.type,
    });
  }

  or(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.Or) {
      return new Node.Branch.Or({
        children: [this].concat(node.children),
        ok: this.ok || node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.Or({
      children: [this].concat(node),
      ok: this.ok || node.ok,
      path: this.path,
      type: this.type,
    });
  }

  not() {
    return new Node.Leaf({
      content: this.content,
      ok: !this.ok,
      path: this.path,
      type: this.type,
      contentPrefix: this.contentPrefix === 'not' ? '' : 'not',
    });
  }

  prefix(prefix) {
    return new Node.Branch({
      children: [this],
      content: prefix,
      ok: this.ok,
      path: this.path,
      type: this.type,
    });
  }

  renderText() {
    return join([this.contentPrefix, String(this.content)]);
  }

  renderTree() {
    return join([this.checkmark, this.contentPrefix, String(this.content)]);
  }
};

Node.Branch = class Branch extends Node {
  and(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.And) {
      return new Node.Branch.And({
        children: [this].concat(node.children),
        ok: this.ok && node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.And({
      children: [this, node],
      ok: this.ok && node.ok,
      path: this.path,
      type: this.type,
    });
  }

  or(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.Or) {
      return new Node.Branch.Or({
        children: [this].concat(node.children),
        ok: this.ok || node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.Or({
      children: [this, node],
      ok: this.ok || node.ok,
      path: this.path,
      type: this.type,
    });
  }

  not() {
    const branchPrefix = new Map([
      [null, 'not'],
      ['either', 'neither'],
      ['not', null],
      ['neither', 'either'],
    ]).get(this.branchPrefix);

    const branchSeparator = new Map([
      ['and', 'and'],
      ['or', 'nor'],
      ['nor', 'or'],
    ]).get(this.branchSeparator);

    if (branchPrefix !== undefined && branchSeparator !== undefined) {
      return new Node.Branch({
        children: this.children,
        content: this.content,
        ok: !this.ok,
        path: this.path,
        type: this.type,
        branchPrefix,
        branchSeparator,
      });
    }

    return new Node.Branch.Nand({
      children: [this],
      ok: !this.ok,
      path: this.path,
      type: this.type,
    });
  }

  prefix(prefix) {
    return new Node.Branch({
      children: this.children,
      content: prefix,
      ok: this.ok,
      path: this.path,
      type: this.type,
      branchPrefix: this.branchPrefix,
      branchSeparator: this.branchSeparator,
    });
  }

  trim(level = 0) {
    if (level === 0) {
      const faliedSubProperties = this.children.filter(
        (x) => !x.ok && !peq(x.path, this.path)
      );
      if (faliedSubProperties.length) {
        if (!faliedSubProperties[0].path.includes(DYNAMIC_PATH)) {
          return faliedSubProperties[0].trim(level);
        }
      }
    }

    const filtered = this.children
      .filter((x) => peq(x.path, this.path) || !x.ok)
      .map((x) => x.trim(level + 1));

    return new this.constructor({
      children: filtered,
      content: level === 0 ? null : this.content,
      ok: this.ok,
      path: this.path,
      type: this.type,
      contentPrefix: this.contentPrefix,
      branchPrefix: this.branchPrefix,
      branchSeparator: this.branchSeparator,
    });
  }

  renderText() {
    const oneline = this.children.reduce((r, x, i, xs) => {
      if (r === null) return null;

      let text = x.renderText();
      if (text.indexOf('\n') !== -1 || r.length + text.length > 48) return null;

      if (i === 1 && xs.length === 2) {
        if (this.type && this.type === x.type) return `${r} ${text}`;
        if (this.type && this.type[NEGATE] === x.type) return `${r} ${text}`;
        if (!peq(xs[0].path, x.path)) return `${r} ${text}`;
      }

      if (x instanceof Node.Branch) text = `(${text})`;

      if (i === 0) return text;

      if (i === xs.length - 1)
        return `${r} ${this.branchSeparator || 'and'} ${text}`;
      return `${r}, ${text}`;
    }, '');

    if (oneline && oneline.length <= 64) {
      if (this instanceof Node.Branch.Nand && this.children.length > 1)
        return join([this.content, this.branchPrefix, '(' + oneline + ')']);
      return join([this.content, this.branchPrefix, oneline]);
    }

    const children = this.children.map((x) => x.renderText());

    if (
      this.content ||
      this.branchPrefix ||
      (this.children[0] instanceof Node.Branch &&
        (this.children[0].content || this.children[0].branchPrefix))
    ) {
      return [
        join([this.content, this.branchPrefix]),
        ...children.slice(0, -1).map((x) => indent('    ', '    ', x)),
        ...children.slice(-1).map((x) => indent('    ', '    ', x)),
      ].join('\n');
    }

    return [
      ...children.slice(0, 1).map((x) => x),
      ...children.slice(1, -1).map((x) => indent('    ', '    ', x)),
      ...children.slice(-1).map((x) => indent('    ', '    ', x)),
    ].join('\n');
  }

  renderTree() {
    const children = this.children.map((x) => x.renderTree());

    if (
      this.content ||
      this.branchPrefix ||
      (this.children[0] instanceof Node.Branch &&
        (this.children[0].content || this.children[0].branchPrefix))
    ) {
      return [
        join([this.checkmark, this.content, this.branchPrefix]),
        ...children.slice(0, -1).map((x) => indent('├─ ', '│  ', x)),
        ...children.slice(-1).map((x) => indent('└─ ', '   ', x)),
      ].join('\n');
    }

    return [
      ...children.slice(0, 1).map((x) => x),
      ...children.slice(1, -1).map((x) => indent('├─ ', '│  ', x)),
      ...children.slice(-1).map((x) => indent('└─ ', '   ', x)),
    ].join('\n');
  }
};

Node.Branch.And = class And extends Node.Branch {
  constructor(...args) {
    super(...args);
    this.branchSeparator = 'and';
  }

  and(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.And) {
      return new Node.Branch.And({
        children: this.children.concat(node.children),
        ok: this.ok && node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.And({
      children: this.children.concat(node),
      ok: this.ok && node.ok,
      path: this.path,
      type: this.type,
    });
  }

  not() {
    return new Node.Branch.Nand({
      children: this.children,
      ok: !this.ok,
      path: this.path,
      type: this.type,
    });
  }
};

Node.Branch.Or = class Or extends Node.Branch {
  constructor(...args) {
    super(...args);
    this.branchPrefix = 'either';
    this.branchSeparator = 'or';
  }

  or(node) {
    if (node instanceof Node.Empty) return this;

    if (node instanceof Node.Branch.Or) {
      return new Node.Branch.Or({
        children: this.children.concat(node.children),
        ok: this.ok || node.ok,
        path: this.path,
        type: this.type,
      });
    }

    return new Node.Branch.Or({
      children: this.children.concat(node),
      ok: this.ok || node.ok,
      path: this.path,
      type: this.type,
    });
  }

  not() {
    return new Node.Branch.Nor({
      children: this.children,
      ok: !this.ok,
      path: this.path,
      type: this.type,
    });
  }
};

Node.Branch.Nand = class Nand extends Node.Branch {
  constructor(...args) {
    super(...args);
    this.branchPrefix = 'not';
    this.branchSeparator = 'and';
  }

  not() {
    if (this.children.length === 1) return this.children[0];

    return new Node.Branch.And({
      children: this.children,
      ok: !this.ok,
      path: this.path,
      type: this.type,
    });
  }
};

Node.Branch.Nor = class Nor extends Node.Branch {
  constructor(...args) {
    super(...args);
    this.branchPrefix = 'neither';
    this.branchSeparator = 'nor';
  }

  not() {
    return new Node.Branch.Or({
      children: this.children,
      ok: !this.ok,
      path: this.path,
      type: this.type,
    });
  }
};

module.exports = Node;
