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
    return value => pattern.test(value);
};

_.isString = function(value) {
    return typeof value === 'string';
};

_.isObject = function(value) {
    return value && typeof value === 'object';
};