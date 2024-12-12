const {
          Assert,
          lockProp,
          isDefined, isTruthy, isFalsy,
          isBoolean, isNumber, isString,
          isFunction, isObject,
          isArray, isIterable
      } = require('@fua/core.util');

module.exports = {
    assert: new Assert('module.persistence'),
    lockProp,
    isDefined, isTruthy, isFalsy,
    isBoolean, isNumber, isString,
    isFunction, isObject,
    isArray, isIterable
};