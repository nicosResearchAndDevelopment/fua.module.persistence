const {
          Assert,
          lockProp,
          stringToRegExp,
          StringValidator, ArrayValidator,
          isDefined, isTruthy, isFalsy,
          isBoolean, isNumber, isString,
          isFunction, isObject,
          isArray, isIterable
      } = require('@nrd/fua.core.util');

module.exports = {
    assert:       new Assert('module.persistence'),
    lockProp,
    strToRegex:   stringToRegExp,
    strValidator: StringValidator,
    arrValidator: ArrayValidator,
    isDefined, isTruthy, isFalsy,
    isBoolean, isNumber, isString,
    isFunction, isObject,
    isArray, isIterable
};