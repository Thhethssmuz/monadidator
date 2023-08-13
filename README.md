# Monadidator

Because validation can be expressed as a monad.

...but more likely because you want to have a validator that also allows you to modify the input as you are validating it.

# Usage

```javascript
const {is} = require('monadidator');

const pointValidator = is.object({
  x: is.number().finite(),
  y: is.number().finite(),
}).or(is.array([
  is.number().finite(),
  is.number().finite(),
]).map(([x, y]) => ({x, y})));

const lengthBetweenPoints = function (point1, point2) {
  const {x: x1, y: y2} = pointValidator.run(point1, 'point1');
  const {x: x2, y: y2} = pointValidator.run(point2, 'point2');
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};
```

## Docs

The validator API may be summed up as follows:

```
is.<type>(...)
is.<type>(...).<restriction>(...)
is.<type>(...).where(<sub-property>, validator)
is.<type>(...).where.<frequency>.<entry-type>(validator)
is.<type>(...).not.<restriction>(...)
is.<type>(...).not.where(<sub-property>, validator)
is.<type>(...).not.where.<frequency>.<entry-type>(validator)
```

### Types

A `<type>` validator is a primitive validator that validates that a value is of a given type, typically through using the JavaScript `typeof` or `instanceof` operators. All types are static functions that return an instance of a validator class specific to the type.

### Restrictions

Restrictions are validators that allow one to restrict the range of valid inputs to a subset of the base type. Restrictions are type specific, i.e. which restrictions are available depends on the base type. Every restriction is a method on the class instance returned by the base type, and returns a new modified instance of the same class so that you may chain multiple restrictions together, e.g.:

```js
const v = is.number().finite().greaterThan(0);
// v.run(NaN); // throws
// v.run(0);   // throws
v.run(1);      // ok
```

Restrictions may also be negated using the `not` property. This property is a special `Proxy` object that has all the same restrictions as the base type, but where every validator is negated, e.g.:

```js
const v = is.number().finite().not.greaterThan(0);
// v.run(NaN); // throws
// v.run(1);   // throws
v.run(0);      // ok
```

Note that the `not` property only negates the next validator in the chain, i.e. the validator to its immediate right. The not property will also negate itself. Note that the `not` property is not a function, but rather an object. And perhaps confusingly, there also exist a `not` method that functions as a single restriction. So for maximum silliness, behold this monstrosity:

```js
const v = is.number().not.not.not(is.number().not.finite());
// v.run(NaN); // throws
v.run(1);      // ok
```

### Map

The `map` method allow one to perform transformations on the value being validated. It functions similarly to the `map` method on arrays, but instead of applying the transformation function on each element in the array, it applies the function to the value being validated, if the validator is successful.

For example:

```js
const v = is.string().match(/^\d+$/).map(x => parseInt(x, 10));
// v.run(1);     // throws
// v.run('lol'); // throws
v.run('123');    // ok => returns 123 (as a number)
```

### Where

The `where` method allows one to specify a validator for a given sub-property of a value. The given validator will then be run against the values sub-property. E.g.:

```js
const v = is.string().where('length', is.number().greaterThan(1));
// v.run(''); // throws
v.run('lol'); // ok
```

Note that if you apply a transformation to the sub-property using the `map` method, then the `where` method will return a new object with the modified property. However, if the property is non-configurable then this is not valid and will instead throw an error. Furthermore, if the property is an object, this may subtly change the value, as the new value will be created using a plain object, i.e.: `{...originalValue, [property]: resultOfWhere}`. Notably the object will loose its prototype, and any non-enumerable properties will be lost.

```js
const v = is.string().where('length', is.number().map(x => x + 1));
// v.run(null); // throws, expects a string
// v.run('');   // throws, cannot assign to read only property 'length'
```

```js
const v = is.object().where('x', is.number().map(x => x + 1));
// v.run(null);      // throws, expects an object
// v.run({});        // expects, input.x to be a number
v.run({x: 1});       // ok, returns {x: 2}
v.run({x: 1, y: 2}); // ok, returns {x: 2, y: 2}
```

```js
class SomeClass {}
const someInstance = new SomeClass();
someInstance.x = 1;

const v = is.object().where('x', is.number().map(x => x + 1));
v.run(someInstance); // ok, but returns {x: 2} (not instance of SomeClass)
```

### Where iterators

There also exist some sub methods under `where`, i.e.: the `where.<frequency>.<entry-type>` pattern. These methods, however, are type specific and are only available for objects and arrays, and subclasses thereof. These methods function much like the `where` method itself, but instead of declaring a validator for a single sub-property it declares a validator for a collection of sub-properties. E.g.:

```js
const v = is.array().where.every.element(is.number());
v.run([1, 2, 3]);           // ok
// v.run([1, 2, 3, 'lol']); // throws
```

Note that if the inner validator uses `map` then these methods will return new objects similar to the `where` method itself. But for each `<entry-type>` only the properties of the given type will be preserved.

| `<entry-type>`     |  **Properties**             |
|:-------------------|:----------------------------|
| `key`              | enumerable + symbol         |
| `value`            | enumerable + symbol         |
| `enumerable.key`   | enumerable                  |
| `enumerable.value` | enumerable                  |
| `enum`             | _alias for `enumerable`_    |
| `symbol.key`       | symbols                     |
| `symbol.value`     | symbols                     |
| `element`          | _alias for `element.value`_ |
| `element.key`      | Array elements              |
| `element.value`    | Array elements              |
| `elem`             | _alias for `element`_       |

```js
const v = is.object().where.every.enumerable.value(is.number());
v.run({x: 1, y: 2, [Symbol('test')]: 3}) // ok, but returns {x: 1, y: 2} and
                                         // the symbol property is neither
                                         // validated nor returned.
```

# API

<a name="is"></a>

## is : object

Main object containing all type validators.



* [is](#is) : object
    * [.{any,anything}()](#is.{any,anything}) ⇒ [`AnyValidator`](#AnyValidator)
    * [.array([tmpl])](#is.array) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.boolean()](#is.boolean) ⇒ [`BooleanValidator`](#BooleanValidator)
    * [.date()](#is.date) ⇒ [`DateValidator`](#DateValidator)
    * [.function()](#is.function) ⇒ [`FunctionValidator`](#FunctionValidator)
    * [.null()](#is.null) ⇒ [`NullValidator`](#NullValidator)
    * [.number()](#is.number) ⇒ [`NumberValidator`](#NumberValidator)
    * [.object([tmpl])](#is.object) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.string()](#is.string) ⇒ [`StringValidator`](#StringValidator)
    * [.undefined()](#is.undefined) ⇒ [`UndefinedValidator`](#UndefinedValidator)
    * [.url([baseUrl])](#is.url) ⇒ [`UrlValidator`](#UrlValidator)

<a name="is.{any,anything}"></a>

### is.{any,anything}() ⇒ [`AnyValidator`](#AnyValidator)

A function that returns a new validator that always succeeds.


<a name="is.array"></a>

### is.array([tmpl]) ⇒ [`ArrayValidator`](#ArrayValidator)

A function that returns a new validator that succeeds if the given input is
an array, and fails otherwise, i.e. if the input satisfies the condition
`Array.isArray(input)`.

You may also pass a template, i.e.: an array of validators that will run
each validator in the template, against their corresponding value in the
array that is being validated according to their index. Note that when using
a template array a new array is yielded as the result containing only those
indexed elements present in the template array.


- `[tmpl]` (Array)

**Example**  
```js
const v is.array([is.number().finite(), is.number().finite()]);
// v.run([1, 'lol']); // throws
v.run([1, 2]);        // ok
```
<a name="is.boolean"></a>

### is.boolean() ⇒ [`BooleanValidator`](#BooleanValidator)

A function that returns a new validator that succeeds if the given input is
a boolean, and fails otherwise, i.e. if the input satisfies the condition
`typeof input === 'boolean'`.


<a name="is.date"></a>

### is.date() ⇒ [`DateValidator`](#DateValidator)

A function that returns a new validator that succeeds if the given input is
a date, and fails otherwise, i.e. if the input satisfies the condition
`input instanceof Date`.


<a name="is.function"></a>

### is.function() ⇒ [`FunctionValidator`](#FunctionValidator)

A function that returns a new validator that succeeds if the given input is
a function, and fails otherwise, i.e. if the input satisfies the condition
`typeof input === 'function'`.


<a name="is.null"></a>

### is.null() ⇒ [`NullValidator`](#NullValidator)

A function that returns a new validator that succeeds if the given input is
null, and fails otherwise, i.e. if the input satisfies the condition
`input === null`.


<a name="is.number"></a>

### is.number() ⇒ [`NumberValidator`](#NumberValidator)

A function that returns a new validator that succeeds if the given input is
a number, and fails otherwise, i.e. if the input satisfies the condition
`typeof input === 'number'`.


<a name="is.object"></a>

### is.object([tmpl]) ⇒ [`ObjectValidator`](#ObjectValidator)

A function that returns a new validator that succeeds if the given input is
an object, and fails otherwise, i.e. if the input satisfies the condition
`input !== null && typeof input === 'object'`. Note that unlike the normal
JavaScript `typeof` operator Monadidator does not interpret `null` as an
object.

You may also pass a template, i.e.: an object of validators that will run
each validator in the template, against their corresponding value in the
input that is being validated according to their key. Note that when using a
template object a new object is yielded as the result containing only those
properties present in the template object.


- `[tmpl]` (Object)

**Example**  
```js
const v = is.object({x: is.number().finite(), y: is.number().finite()});
// v.run({x: 1, y: 'lol'}); // throws
v.run({x: 1, y: 2});        // ok
```
<a name="is.string"></a>

### is.string() ⇒ [`StringValidator`](#StringValidator)

A function that returns a new validator that succeeds if the given input is
a string, and fails otherwise, i.e. if the input satisfies the condition
`typeof input === 'string'`.


<a name="is.undefined"></a>

### is.undefined() ⇒ [`UndefinedValidator`](#UndefinedValidator)

A function that returns a new validator that succeeds if the given input is
undefined, and fails otherwise, i.e. if the input satisfies the condition
`typeof input === 'undefined'`.


<a name="is.url"></a>

### is.url([baseUrl]) ⇒ [`UrlValidator`](#UrlValidator)

A function that returns a new validator that succeeds if the given input is
a URL, and fails otherwise, i.e. if the input satisfies the condition
`input instanceof URL`. Alternatively it may be a string that is coercible to
a URL trough `new URL`, although this is most useful when combined with the
baseUrl parameter.


- `[baseUrl]` (string | URL)


<a name="Monadidator"></a>

## Monadidator



* [Monadidator](#Monadidator)
    * _instance_
        * [.map(f)](#Monadidator.map) ⇒ [`Monadidator`](#Monadidator)
        * [.{or,concat}(validator)](#Monadidator.{or,concat}) ⇒ [`Monadidator`](#Monadidator)
        * [.{and,then}(validator)](#Monadidator.{and,then}) ⇒ [`Monadidator`](#Monadidator)
        * [.not(validator)](#Monadidator.not) ⇒ [`Monadidator`](#Monadidator)
        * [.where(property, validator)](#Monadidator.where) ⇒ [`Monadidator`](#Monadidator)
        * [.{satisfy,satisfies,satisfying}(predicate)](#Monadidator.{satisfy,satisfies,satisfying}) ⇒ [`Monadidator`](#Monadidator)
        * [.label(msg)](#Monadidator.label) ⇒ [`Monadidator`](#Monadidator)
        * [.{run,validate}(input, [name])](#Monadidator.{run,validate}) ⇒ \*
        * [.{asyncRun,asyncValidate}(input, [name])](#Monadidator.{asyncRun,asyncValidate}) ⇒ Promise.&lt;\*&gt;
    * _static_
        * [.mkType(Cls, options)](#Monadidator.mkType) ⇒ function

<a name="Monadidator.map"></a>

### Monadidator.map(f) ⇒ [`Monadidator`](#Monadidator)

A method that returns a new validator that behaves exactly like `this`
validator, but if `this` validator succeeds it applies the given function
to the result and yields the transformed result.

Note that the `map` function will always return a validator of the same
type as before the transformation, such that you may continue to chain
methods as normal. However, this does not work if the transformation
function turns the value into a different type, then you need to explicitly
`and` (or `then`) the result with the new type in order to continue
chaining methods.


- `f` (function)

**Example**  
```js
is.string()
  .map(x => x.trim())           // transform from string to string
  .matching(/^\d+$/)
  .map(x => parseInt(x, 10))    // transform from string to number
  .then(is
    .number()
    .between(0, 100));
```
<a name="Monadidator.{or,concat}"></a>

### Monadidator.{or,concat}(validator) ⇒ [`Monadidator`](#Monadidator)

A method that returns a new validator that first tries to validate using
`this` validator, but if `this` fails tries to run the given `validator`.
Succeeds if either validator succeeds and fails otherwise.


- `validator` ([`Monadidator`](#Monadidator))

<a name="Monadidator.{and,then}"></a>

### Monadidator.{and,then}(validator) ⇒ [`Monadidator`](#Monadidator)

A method that returns a new validator that first applies `this` validator
and then applies the given `validator`. Succeeds only if both validators
succeeds and fails otherwise.


- `validator` ([`Monadidator`](#Monadidator))

<a name="Monadidator.not"></a>

### Monadidator.not(validator) ⇒ [`Monadidator`](#Monadidator)

A type-restriction method that succeeds if the given `validator` fails, and
fails otherwise. NOTE that this is not actually a function, but rather a
special `Proxy` object that behaves like both a function and an object.

When used as an object it operates like a special negated version of
`this`. I.e. when used as an object it will have all the same
type-restrictions as are available on `this`, but where every
type-restriction is negated.

When used as a function it will simply negate the given `validator`. NOTE
that this may not behave exactly like you might initially expect, for
example: the validator `is.any().not(is.number().lt(0))` is not equal to
the validator `is.number().not.lt(0)`! For example, when run on an input
value of type string, this value will be ok when run against the first
validator, but not the second. As the first will negate the whole validator
whereas the second will only negate the type-restriction `lt`. Thus for the
first the input is strictly `not (a number less than 0)` and will therefore
be ok, and for the second the number must be `a number && not less then 0`.


- `validator` ([`Monadidator`](#Monadidator))

**Example**  
```js
const v1 = is.any().not(is.number().lt(0));
const v2 = is.number().not.lt(0);

v1.run('lol');     // ok
// v1.run(-1);     // throws
v1.run(1);         // ok

// v2.run('lol');  // throws
// v2.run(-1);     // throws
v2.run(1);         // ok
```
<a name="Monadidator.where"></a>

### Monadidator.where(property, validator) ⇒ [`Monadidator`](#Monadidator)

A type-restriction method that succeeds if the current input has the
sub-property given by `property`, and the given `validator` succeeds when
run against the sub-property, and fails otherwise.


- `property` (\*)
- `validator` ([`Monadidator`](#Monadidator))

<a name="Monadidator.{satisfy,satisfies,satisfying}"></a>

### Monadidator.{satisfy,satisfies,satisfying}(predicate) ⇒ [`Monadidator`](#Monadidator)

A type-restriction method that succeeds if the given predicate function
returns true for the current input, and fails otherwise.


- `predicate` (function)

<a name="Monadidator.label"></a>

### Monadidator.label(msg) ⇒ [`Monadidator`](#Monadidator)

A method that returns a new validator that behaves exactly like `this`
validator, but if `this` validator fails it replaces the expected error
message with the expected error `msg`.


- `msg` (String)

<a name="Monadidator.{run,validate}"></a>

### Monadidator.{run,validate}(input, [name]) ⇒ \*

Execute a validator, i.e. run the validator against the given `input`.
Returns a transformed version of the input, if the validator contains any
transformations, i.e. if the validator uses the `map` method, when the
validator is successful and throws an error otherwise.


- `input` (\*)
- `[name]` (String) <code> = &#x27;input&#x27;</code>

**Example**  
```js
const v = is.string().match(/^\d+$/).map(x => parseInt(x, 10));
// v.run(123);   // => throws, expects a string
// v.run('lol'); // => throws, expects a string matching /^\d+$/
v.run('123');    // => ok, returns 123 (number)
```
<a name="Monadidator.{asyncRun,asyncValidate}"></a>

### Monadidator.{asyncRun,asyncValidate}(input, [name]) ⇒ Promise.&lt;\*&gt;

Async version of `run` that automatically awaits any asynchronous
transformations, ie. uses of the `map` method that return promises.


- `input` (\*)
- `[name]` (String) <code> = &#x27;input&#x27;</code>

<a name="Monadidator.mkType"></a>

### Monadidator.mkType(Cls, options) ⇒ function

Helper function for creating type validators. Each type validator returns an
instance of some sub-class of Monadidator that contains all the
type-restriction methods that should be available for the type.

Most notably this function will setup all the prerequisites for the `not`
proxy object to function correctly, as well as the `where` methods where
applicable.


- `Cls` (function) - The class you want to turn into a type validator.
- `options` (Object) - Options object.
    - `.name` (String) - The name of the type to be used in the error output.
    - `.predicate` (function) - A predicate function that determines if the given value is of this type.
    - `[.clone]` (function) - A function that determines how to clone a value of the given type. This is
required for the `where` method to function correctly.
    - `[.empty]` (function) - A function that returns an empty value of the given type. This is required
for the `where.every` and `where.some` methods to function correctly.
- returns (function) - A function that returns a validator.

<a name="AnyValidator"></a>

## AnyValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


* [AnyValidator](#AnyValidator) ⇐ [`Monadidator`](#Monadidator)
    * [.nullish()](#AnyValidator.nullish) ⇒ [`AnyValidator`](#AnyValidator)
    * [.truthy()](#AnyValidator.truthy) ⇒ [`AnyValidator`](#AnyValidator)
    * [.falsy()](#AnyValidator.falsy) ⇒ [`AnyValidator`](#AnyValidator)

<a name="AnyValidator.nullish"></a>

### AnyValidator.nullish() ⇒ [`AnyValidator`](#AnyValidator)

A type-restriction method that succeeds if the given input is "nullish",
and fails otherwise, i.e. if the input satisfies the condition
`input == null`.


<a name="AnyValidator.truthy"></a>

### AnyValidator.truthy() ⇒ [`AnyValidator`](#AnyValidator)

A type-restriction method that succeeds if the given input is "truthy",
and fails otherwise, i.e. if the input satisfies the condition
`Boolean(input)`.


<a name="AnyValidator.falsy"></a>

### AnyValidator.falsy() ⇒ [`AnyValidator`](#AnyValidator)

A type-restriction method that succeeds if the given input is "falsy",
and fails otherwise, i.e. if the input satisfies the condition
`!input`.


<a name="ArrayValidator"></a>

## ArrayValidator ⇐ [`ObjectValidator`](#ObjectValidator)

**Extends**: [`ObjectValidator`](#ObjectValidator)  


* [ArrayValidator](#ArrayValidator) ⇐ [`ObjectValidator`](#ObjectValidator)
    * [.where(property, validator)](#ArrayValidator.where) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.every](#ArrayValidator.where.every) : object
            * [.{elem,element}(validator)](#ArrayValidator.where.every.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
                * [.key(validator)](#ArrayValidator.where.every.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
                * [.value(validator)](#ArrayValidator.where.every.{elem,element}.value) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.some](#ArrayValidator.where.some) : object
            * [.{elem,element}(validator)](#ArrayValidator.where.some.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
                * [.key(validator)](#ArrayValidator.where.some.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
                * [.element(validator)](#ArrayValidator.where.some.{elem,element}.element) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where"></a>

### ArrayValidator.where(property, validator) ⇒ [`ArrayValidator`](#ArrayValidator)

Inherited [`ObjectValidator.where`](#ObjectValidator.where).


- `property` (\*)
- `validator` ([`ArrayValidator`](#ArrayValidator))


* [.where(property, validator)](#ArrayValidator.where) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.every](#ArrayValidator.where.every) : object
        * [.{elem,element}(validator)](#ArrayValidator.where.every.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
            * [.key(validator)](#ArrayValidator.where.every.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
            * [.value(validator)](#ArrayValidator.where.every.{elem,element}.value) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.some](#ArrayValidator.where.some) : object
        * [.{elem,element}(validator)](#ArrayValidator.where.some.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
            * [.key(validator)](#ArrayValidator.where.some.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
            * [.element(validator)](#ArrayValidator.where.some.{elem,element}.element) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where.every"></a>

#### where.every : object

Inherited [`ObjectValidator.where.every`](#ObjectValidator.where.every).



* [.every](#ArrayValidator.where.every) : object
    * [.{elem,element}(validator)](#ArrayValidator.where.every.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.key(validator)](#ArrayValidator.where.every.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.value(validator)](#ArrayValidator.where.every.{elem,element}.value) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where.every.{elem,element}"></a>

##### every.{elem,element}(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all values in the input array, and fails otherwise. Note
that if the input has no values then this will always succeed.


- `validator` ([`ArrayValidator`](#ArrayValidator))


* [.{elem,element}(validator)](#ArrayValidator.where.every.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.key(validator)](#ArrayValidator.where.every.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.value(validator)](#ArrayValidator.where.every.{elem,element}.value) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where.every.{elem,element}.key"></a>

###### {elem,element}.key(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all keys in the input array, and fails otherwise. Note
that if the input has no keys then this will always succeed.


- `validator` ([`ArrayValidator`](#ArrayValidator))

<a name="ArrayValidator.where.every.{elem,element}.value"></a>

###### {elem,element}.value(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all values in the input array, and fails otherwise. Note
that if the input has no values then this will always succeed.


- `validator` ([`ArrayValidator`](#ArrayValidator))

<a name="ArrayValidator.where.some"></a>

#### where.some : object

Inherited [`ObjectValidator.where.some`](#ObjectValidator.where.some).



* [.some](#ArrayValidator.where.some) : object
    * [.{elem,element}(validator)](#ArrayValidator.where.some.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.key(validator)](#ArrayValidator.where.some.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
        * [.element(validator)](#ArrayValidator.where.some.{elem,element}.element) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where.some.{elem,element}"></a>

##### some.{elem,element}(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one value in the input array, and fails otherwise. Note that
if the input has no values then this will always fail.


- `validator` ([`ArrayValidator`](#ArrayValidator))


* [.{elem,element}(validator)](#ArrayValidator.where.some.{elem,element}) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.key(validator)](#ArrayValidator.where.some.{elem,element}.key) ⇒ [`ArrayValidator`](#ArrayValidator)
    * [.element(validator)](#ArrayValidator.where.some.{elem,element}.element) ⇒ [`ArrayValidator`](#ArrayValidator)

<a name="ArrayValidator.where.some.{elem,element}.key"></a>

###### {elem,element}.key(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one key in the input array, and fails otherwise. Note that
if the input has no keys then this will always fail.


- `validator` ([`ArrayValidator`](#ArrayValidator))

<a name="ArrayValidator.where.some.{elem,element}.element"></a>

###### {elem,element}.element(validator) ⇒ [`ArrayValidator`](#ArrayValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one value in the input array, and fails otherwise. Note that
if the input has no values then this will always fail.


- `validator` ([`ArrayValidator`](#ArrayValidator))

<a name="BooleanValidator"></a>

## BooleanValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


* [BooleanValidator](#BooleanValidator) ⇐ [`Monadidator`](#Monadidator)
    * [.true()](#BooleanValidator.true) ⇒ [`BooleanValidator`](#BooleanValidator)
    * [.false()](#BooleanValidator.false) ⇒ [`BooleanValidator`](#BooleanValidator)

<a name="BooleanValidator.true"></a>

### BooleanValidator.true() ⇒ [`BooleanValidator`](#BooleanValidator)

A type-restriction method that succeeds if the given input is `true`, and
fails otherwise, i.e. if the input satisfies the condition
`input === true`.


<a name="BooleanValidator.false"></a>

### BooleanValidator.false() ⇒ [`BooleanValidator`](#BooleanValidator)

A type-restriction method that succeeds if the given input is `false`, and
fails otherwise, i.e. if the input satisfies the condition
`input === false`.


<a name="DateValidator"></a>

## DateValidator ⇐ [`ObjectValidator`](#ObjectValidator)

**Extends**: [`ObjectValidator`](#ObjectValidator)  


* [DateValidator](#DateValidator) ⇐ [`ObjectValidator`](#ObjectValidator)
    * [.valid()](#DateValidator.valid) ⇒ [`DateValidator`](#DateValidator)
    * [.invalid()](#DateValidator.invalid) ⇒ [`DateValidator`](#DateValidator)
    * [.{gt,greater,greaterThan}()](#DateValidator.{gt,greater,greaterThan}) ⇒ [`DateValidator`](#DateValidator)
    * [.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}()](#DateValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}) ⇒ [`DateValidator`](#DateValidator)
    * [.{eq,equal,equals,equalTo}()](#DateValidator.{eq,equal,equals,equalTo}) ⇒ [`DateValidator`](#DateValidator)
    * [.{ne,notEqual,notEquals,notEqualTo}()](#DateValidator.{ne,notEqual,notEquals,notEqualTo}) ⇒ [`DateValidator`](#DateValidator)
    * [.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}()](#DateValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}) ⇒ [`DateValidator`](#DateValidator)
    * [.{lt,less,lessThan}()](#DateValidator.{lt,less,lessThan}) ⇒ [`DateValidator`](#DateValidator)
    * [.between(min, max, [inclusivity])](#DateValidator.between) ⇒ [`DateValidator`](#DateValidator)

<a name="DateValidator.valid"></a>

### DateValidator.valid() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the given input is a valid date,
and fails otherwise, i.e. if the input satisfies the condition
`Number.isFinite(input.valueOf())`.


<a name="DateValidator.invalid"></a>

### DateValidator.invalid() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the given input is a an invalid
date, and fails otherwise, i.e. if the input satisfies the condition
`!Number.isFinite(input.valueOf())`.


<a name="DateValidator.{gt,greater,greaterThan}"></a>

### DateValidator.{gt,greater,greaterThan}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is greater than the
given `date`, and fails otherwise, i.e. if the input satisfies the
condition `input.valueOf() > date.valueOf()`.


<a name="DateValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}"></a>

### DateValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is greater than or
equal to the given `date`, and fails otherwise, i.e. if the input satisfies
the condition `input.valueOf() >= date.valueOf()`.


<a name="DateValidator.{eq,equal,equals,equalTo}"></a>

### DateValidator.{eq,equal,equals,equalTo}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is equal to the given
`date`, and fails otherwise, i.e. if the input satisfies the condition
`input.valueOf() === date.valueOf()`.


<a name="DateValidator.{ne,notEqual,notEquals,notEqualTo}"></a>

### DateValidator.{ne,notEqual,notEquals,notEqualTo}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is not equal to the
given `date`, and fails otherwise, i.e. if the input satisfies the
condition `input.valueOf() !== date.valueOf()`.


<a name="DateValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}"></a>

### DateValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is less than or equal
to the given `date`, and fails otherwise, i.e. if the input satisfies the
condition `input.valueOf() <= date.valueOf()`.


<a name="DateValidator.{lt,less,lessThan}"></a>

### DateValidator.{lt,less,lessThan}() ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the input is less than the given
`date`, and fails otherwise, i.e. if the input satisfies the condition
`input.valueOf() < date.valueOf()`.


<a name="DateValidator.between"></a>

### DateValidator.between(min, max, [inclusivity]) ⇒ [`DateValidator`](#DateValidator)

A type-restriction method that succeeds if the given input is between the
given dates `min` and `max`, and fails otherwise.

The `min` and `max` parameters are not strictly ordered, so if `min` are
larger than `max` then the inputs are swapped. Furthermore the
`inclusivity` controls if the range includes the `min` and `max` values,
i.e.:

| **Inclusivity**` | **Condition**                   |
|:-----------------|:--------------------------------|
| `'()'`           |  `min <  input && input <  max` |
| `'(]'`           |  `min <  input && input <= max` |
| `'[)'`           |  `min <= input && input <  max` |
| `'[]'`           |  `min <= input && input <= max` |


- `min` (Date)
- `max` (Date)
- `[inclusivity]` (String) <code> = &#x27;[]&#x27;</code>

<a name="FunctionValidator"></a>

## FunctionValidator ⇐ [`ObjectValidator`](#ObjectValidator)

**Extends**: [`ObjectValidator`](#ObjectValidator)  

<a name="NullValidator"></a>

## NullValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  

<a name="NumberValidator"></a>

## NumberValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


* [NumberValidator](#NumberValidator) ⇐ [`Monadidator`](#Monadidator)
    * [.{nan,NaN}()](#NumberValidator.{nan,NaN}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.finite()](#NumberValidator.finite) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{gt,greater,greaterThan}(n)](#NumberValidator.{gt,greater,greaterThan}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}(n)](#NumberValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{eq,equal,equals,equalTo}(n)](#NumberValidator.{eq,equal,equals,equalTo}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{ne,notEqual,notEquals,notEqualTo}(n)](#NumberValidator.{ne,notEqual,notEquals,notEqualTo}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}(n)](#NumberValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{lt,less,lessThan}(n)](#NumberValidator.{lt,less,lessThan}) ⇒ [`NumberValidator`](#NumberValidator)
    * [.between(min, max, [inclusivity])](#NumberValidator.between) ⇒ [`NumberValidator`](#NumberValidator)
    * [.{in,elem,elemOf,element,elementOf}(ns)](#NumberValidator.{in,elem,elemOf,element,elementOf}) ⇒ [`NumberValidator`](#NumberValidator)

<a name="NumberValidator.{nan,NaN}"></a>

### NumberValidator.{nan,NaN}() ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is `NaN`, and
fails otherwise, i.e. if the input satisfies the condition
`Number.isNaN(input)`.


<a name="NumberValidator.finite"></a>

### NumberValidator.finite() ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is finite, and
fails otherwise, i.e. if the input satisfies the condition
`Number.isFinite(input)`.


<a name="NumberValidator.{gt,greater,greaterThan}"></a>

### NumberValidator.{gt,greater,greaterThan}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is greater than
the given number `n`, and fails otherwise, i.e. if the input satisfies the
condition `input > n`.


- `n` (Number)

<a name="NumberValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}"></a>

### NumberValidator.{gte,greaterOrEqual,greaterOrEquals,greaterOrEqualTo,greaterThanOrEqual,greaterThanOrEquals,greaterThanOrEqualTo}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is greater than
or equal to the given number `n`, and fails otherwise, i.e. if the input
satisfies the condition `input >= n`.


- `n` (Number)

<a name="NumberValidator.{eq,equal,equals,equalTo}"></a>

### NumberValidator.{eq,equal,equals,equalTo}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is equal to the
given number `n`, and fails otherwise, i.e. if the input satisfies the
condition `input === n`.


- `n` (Number)

<a name="NumberValidator.{ne,notEqual,notEquals,notEqualTo}"></a>

### NumberValidator.{ne,notEqual,notEquals,notEqualTo}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is not equal to
the given number `n`, and fails otherwise, i.e. if the input satisfies the
condition `input !== n`.


- `n` (Number)

<a name="NumberValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}"></a>

### NumberValidator.{lte,lessOrEqual,lessOrEquals,lessThanOrEqual,lessThanOrEquals,lessThanOrEqualTo}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is less then or
equal to the given number `n`, and fails otherwise, i.e. if the input
satisfies the condition `input <= n`.


- `n` (Number)

<a name="NumberValidator.{lt,less,lessThan}"></a>

### NumberValidator.{lt,less,lessThan}(n) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is less then the
given number `n`, and fails otherwise, i.e. if the input satisfies the
condition `input < n`.


- `n` (Number)

<a name="NumberValidator.between"></a>

### NumberValidator.between(min, max, [inclusivity]) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is between the
given numbers `min` and `max`, and fails otherwise.

The `min` and `max` parameters are not strictly ordered, so if `min` are
larger than `max` then the inputs are swapped. Furthermore the
`inclusivity` controls if the range includes the `min` and `max` values,
i.e.:

| **Inclusivity**` | **Condition**                   |
|:-----------------|:--------------------------------|
| `'()'`           |  `min <  input && input <  max` |
| `'(]'`           |  `min <  input && input <= max` |
| `'[)'`           |  `min <= input && input <  max` |
| `'[]'`           |  `min <= input && input <= max` |


- `min` (Number)
- `max` (Number)
- `[inclusivity]` (String) <code> = &#x27;[]&#x27;</code>

<a name="NumberValidator.{in,elem,elemOf,element,elementOf}"></a>

### NumberValidator.{in,elem,elemOf,element,elementOf}(ns) ⇒ [`NumberValidator`](#NumberValidator)

A type-restriction method that succeeds if the given input is in the
given list of numbers `ns`, and fails otherwise, i.e. if the input
satisfies the condition `ns.includes(input)`.


- `ns` (Array.&lt;Number&gt;)

<a name="ObjectValidator"></a>

## ObjectValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


* [ObjectValidator](#ObjectValidator) ⇐ [`Monadidator`](#Monadidator)
    * [.{instance,instanceof,instanceOf}()](#ObjectValidator.{instance,instanceof,instanceOf}) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.where(property, validator)](#ObjectValidator.where) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.every](#ObjectValidator.where.every) : object
            * [.{enum,enumerable}](#ObjectValidator.where.every.{enum,enumerable}) : object
                * [.key(validator)](#ObjectValidator.where.every.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
                * [.value(validator)](#ObjectValidator.where.every.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.symbol](#ObjectValidator.where.every.symbol) : object
                * [.key(validator)](#ObjectValidator.where.every.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
                * [.value(validator)](#ObjectValidator.where.every.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.key(validator)](#ObjectValidator.where.every.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.every.value) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.some](#ObjectValidator.where.some) : object
            * [.{enum,enumerable}](#ObjectValidator.where.some.{enum,enumerable}) : object
                * [.key(validator)](#ObjectValidator.where.some.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
                * [.value(validator)](#ObjectValidator.where.some.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.symbol](#ObjectValidator.where.some.symbol) : object
                * [.key(validator)](#ObjectValidator.where.some.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
                * [.value(validator)](#ObjectValidator.where.some.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.key(validator)](#ObjectValidator.where.some.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.some.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.{instance,instanceof,instanceOf}"></a>

### ObjectValidator.{instance,instanceof,instanceOf}() ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the input is an instance of the
given class `Cls`, and fails otherwise, i.e. if the input satisfies the
condition `input instanceof Cls`.


<a name="ObjectValidator.where"></a>

### ObjectValidator.where(property, validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the current input has the
sub-property given by `property`, and the given `validator` succeeds when
run against the sub-property, and fails otherwise. Note that if the given
`validator` uses `map`, then a new object is yielded as the result.


- `property` (\*)
- `validator` ([`ObjectValidator`](#ObjectValidator))


* [.where(property, validator)](#ObjectValidator.where) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.every](#ObjectValidator.where.every) : object
        * [.{enum,enumerable}](#ObjectValidator.where.every.{enum,enumerable}) : object
            * [.key(validator)](#ObjectValidator.where.every.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.every.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.symbol](#ObjectValidator.where.every.symbol) : object
            * [.key(validator)](#ObjectValidator.where.every.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.every.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.key(validator)](#ObjectValidator.where.every.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.every.value) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.some](#ObjectValidator.where.some) : object
        * [.{enum,enumerable}](#ObjectValidator.where.some.{enum,enumerable}) : object
            * [.key(validator)](#ObjectValidator.where.some.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.some.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.symbol](#ObjectValidator.where.some.symbol) : object
            * [.key(validator)](#ObjectValidator.where.some.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
            * [.value(validator)](#ObjectValidator.where.some.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.key(validator)](#ObjectValidator.where.some.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.some.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.every"></a>

#### where.every : object

ObjectValidator.where.every



* [.every](#ObjectValidator.where.every) : object
    * [.{enum,enumerable}](#ObjectValidator.where.every.{enum,enumerable}) : object
        * [.key(validator)](#ObjectValidator.where.every.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.every.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.symbol](#ObjectValidator.where.every.symbol) : object
        * [.key(validator)](#ObjectValidator.where.every.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.every.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.key(validator)](#ObjectValidator.where.every.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.every.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.every.{enum,enumerable}"></a>

##### every.{enum,enumerable} : object

"{enum,enumerable}"



* [.{enum,enumerable}](#ObjectValidator.where.every.{enum,enumerable}) : object
    * [.key(validator)](#ObjectValidator.where.every.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.every.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.every.{enum,enumerable}.key"></a>

###### {enum,enumerable}.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all enumerable keys in the input object, and fails
otherwise. Note that if the input has no enumerable keys then this will
always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.every.{enum,enumerable}.value"></a>

###### {enum,enumerable}.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all enumerable values in the input object, and fails
otherwise. Note that if the input has no enumerable values then this will
always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.every.symbol"></a>

##### every.symbol : object

ObjectValidator.where.every.symbol



* [.symbol](#ObjectValidator.where.every.symbol) : object
    * [.key(validator)](#ObjectValidator.where.every.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.every.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.every.symbol.key"></a>

###### symbol.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all symbol keys in the input object, and fails
otherwise. Note that if the input has no symbol keys then this will
always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.every.symbol.value"></a>

###### symbol.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all symbol values in the input object, and fails
otherwise. Note that if the input has no symbol values then this will
always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.every.key"></a>

##### every.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all keys (both enumerable and symbols) in the input
object, and fails otherwise. Note that if the input has no keys then this
will always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.every.value"></a>

##### every.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
when run against all values (both enumerable and symbols) in the input
object, and fails otherwise. Note that if the input has no values then
this will always succeed.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some"></a>

#### where.some : object

ObjectValidator.where.some



* [.some](#ObjectValidator.where.some) : object
    * [.{enum,enumerable}](#ObjectValidator.where.some.{enum,enumerable}) : object
        * [.key(validator)](#ObjectValidator.where.some.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.some.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.symbol](#ObjectValidator.where.some.symbol) : object
        * [.key(validator)](#ObjectValidator.where.some.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
        * [.value(validator)](#ObjectValidator.where.some.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.key(validator)](#ObjectValidator.where.some.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.some.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.some.{enum,enumerable}"></a>

##### some.{enum,enumerable} : object

"{enum,enumerable}"



* [.{enum,enumerable}](#ObjectValidator.where.some.{enum,enumerable}) : object
    * [.key(validator)](#ObjectValidator.where.some.{enum,enumerable}.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.some.{enum,enumerable}.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.some.{enum,enumerable}.key"></a>

###### {enum,enumerable}.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one enumerable key, in the input object, and fails
otherwise. Note that if the input has no enumerable keys then this will
always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some.{enum,enumerable}.value"></a>

###### {enum,enumerable}.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one enumerable value, in the input object, and fails
otherwise. Note that if the input has no enumerable values then this will
always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some.symbol"></a>

##### some.symbol : object

ObjectValidator.where.some.symbol



* [.symbol](#ObjectValidator.where.some.symbol) : object
    * [.key(validator)](#ObjectValidator.where.some.symbol.key) ⇒ [`ObjectValidator`](#ObjectValidator)
    * [.value(validator)](#ObjectValidator.where.some.symbol.value) ⇒ [`ObjectValidator`](#ObjectValidator)

<a name="ObjectValidator.where.some.symbol.key"></a>

###### symbol.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one symbol key, in the input object, and fails otherwise.
Note that if the input has no symbol keys then this will always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some.symbol.value"></a>

###### symbol.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one symbol value, in the input object, and fails otherwise.
Note that if the input has no symbol values then this will always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some.key"></a>

##### some.key(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one key (either enumerable or symbol), in the input object,
and fails otherwise. Note that if the input has no keys then this will
always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="ObjectValidator.where.some.value"></a>

##### some.value(validator) ⇒ [`ObjectValidator`](#ObjectValidator)

A type-restriction method that succeeds if the given `validator` succeeds
for at least one value (either enumerable or symbol), in the input
object, and fails otherwise. Note that if the input has no values then
this will always fail.


- `validator` ([`ObjectValidator`](#ObjectValidator))

<a name="StringValidator"></a>

## StringValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


* [StringValidator](#StringValidator) ⇐ [`Monadidator`](#Monadidator)
    * [.empty()](#StringValidator.empty) ⇒ [`StringValidator`](#StringValidator)
    * [.{match,matches,matching}()](#StringValidator.{match,matches,matching}) ⇒ [`StringValidator`](#StringValidator)
    * [.{contain,contains,containing}()](#StringValidator.{contain,contains,containing}) ⇒ [`StringValidator`](#StringValidator)
    * [.{eq,equal,equals,equalTo}()](#StringValidator.{eq,equal,equals,equalTo}) ⇒ [`StringValidator`](#StringValidator)
    * [.{ne,notEqual,notEquals,notEqualTo}()](#StringValidator.{ne,notEqual,notEquals,notEqualTo}) ⇒ [`StringValidator`](#StringValidator)
    * [.{in,elem,elemOf,element,elementOf}()](#StringValidator.{in,elem,elemOf,element,elementOf}) ⇒ [`StringValidator`](#StringValidator)

<a name="StringValidator.empty"></a>

### StringValidator.empty() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input is empty, and
fails otherwise, i.e. if the input satisfies the condition
`input.length === 0`.


<a name="StringValidator.{match,matches,matching}"></a>

### StringValidator.{match,matches,matching}() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input is matches the
given regular expression `r`, and fails otherwise, i.e. if the input
satisfies the condition `r.test(input)`.


<a name="StringValidator.{contain,contains,containing}"></a>

### StringValidator.{contain,contains,containing}() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input contains the
given substring `str`, and fails otherwise, i.e. if the input satisfies the
condition `input.indexOf(str) !== -1`.


<a name="StringValidator.{eq,equal,equals,equalTo}"></a>

### StringValidator.{eq,equal,equals,equalTo}() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input is equal to the
given string `str`, and fails otherwise, i.e. if the input satisfies the
condition `input === str`.


<a name="StringValidator.{ne,notEqual,notEquals,notEqualTo}"></a>

### StringValidator.{ne,notEqual,notEquals,notEqualTo}() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input is not equal to
the given string `str`, and fails otherwise, i.e. if the input satisfies
the condition `input !== str`.


<a name="StringValidator.{in,elem,elemOf,element,elementOf}"></a>

### StringValidator.{in,elem,elemOf,element,elementOf}() ⇒ [`StringValidator`](#StringValidator)

A type-restriction method that succeeds if the given input is in the
supplied list of strings `xs`, and fails otherwise, i.e. if the input
satisfies the condition `xs.includes(input)`.


<a name="UndefinedValidator"></a>

## UndefinedValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  

<a name="UrlValidator"></a>

## UrlValidator ⇐ [`Monadidator`](#Monadidator)

**Extends**: [`Monadidator`](#Monadidator)  


