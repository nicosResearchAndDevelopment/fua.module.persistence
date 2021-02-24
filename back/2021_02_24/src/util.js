const
    _ = exports,
    MODULE_NAME = 'module.persistence';

_.assert = function(value, errMsg = 'undefined error', errType = Error) {
    if (!value) {
        const err = new errType(`${MODULE_NAME} : ${errMsg}`);
        Error.captureStackTrace(err, _.assert);
        throw err;
    }
};

_.lockProp = function(obj, ...keys) {
    const lock = { writable: false, configurable: false };
    for (let key of keys) {
        Object.defineProperty(obj, key, lock);
    }
};

_.strValidator = function(pattern) {
    return (value) => _.isString(value) && pattern.test(value);
};

_.arrValidator = function(checker) {
    return (value) => _.isArray(value) && value.every(checker);
};

_.isBoolean = function(value) {
    return typeof value === 'boolean';
};

_.isNumber = function(value) {
    return typeof value === 'number' && !isNaN(value);
};

_.isString = function(value) {
    return typeof value === 'string';
};

_.isFunction = function(value) {
    return typeof value === 'function';
};

_.isObject = function(value) {
    return value && typeof value === 'object';
};

_.isArray = Array.isArray;

_.isIterable = function(value) {
    try {
        return _.isFunction(value[Symbol.iterator]);
    } catch (err) {
        return false;
    }
};