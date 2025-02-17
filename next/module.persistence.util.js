const
    util = require('@fua/core.util'),
    uuid = require('@fua/core.uuid');

exports = module.exports = {
    ...util,
    assert:           new util.Assert('module.persistence'),
    isNonEmptyString: new util.StringValidator(/\S/),
    /**
     * @see https://tools.ietf.org/html/rfc3987#section-2.2
     * @see https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid/36667242#answer-36667242
     */
    isIRIString:        new util.StringValidator(/^[a-z][a-z0-9+.-]*:[^\s"<>\\^`{|}]*$/i),
    isPrefixString:     new util.StringValidator(/^[a-z][a-z0-9+.-]*$/i),
    isIdentifierString: new util.StringValidator(/^\S+$/),
    isVariableString:   new util.StringValidator(/^[a-z]\w*$/i),
    isLanguageString:   new util.StringValidator(/^[a-z]{1,3}(?:-[a-z0-9]{1,8})*$/i),
    generateBlankId:    () => uuid.v1(),
    encodeLiteralValue: (value) => encodeURIComponent(value),
    decodeLiteralValue: (value) => decodeURIComponent(value)
};
