const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    // FactoryModel = require('./module.persistence.factory-model.js'),
    // StoreModel   = require('./module.persistence.store-model.js'),
    JsonModel    = exports;

/**
 * @class JsonModel.ResourceNode
 */
JsonModel.ResourceNode = class ResourceNode {

    /**
     * @param {string|DataModel.NamedNode|DataModel.BlankNode} id
     */
    constructor(id) {
        if (id instanceof DataModel.NamedNode) id = id.value;
        else if (id instanceof DataModel.BlankNode) id = '_:' + id;
        else util.assert(util.isIdentifierString(id), 'ResourceNode#constructor : expected id to be an identifier', TypeError);

        this['@id'] = id;
        util.lockProp(this, '@id');
    } // ResourceNode#constructor

}; // ResourceNode

/**
 * @class JsonModel.ObjectLiteral
 */
JsonModel.ObjectLiteral = class ObjectLiteral {

    /**
     * @param {string|DataModel.Literal} value
     * @param {string} [language]
     * @param {string|DataModel.NamedNode} [datatype]
     */
    constructor(value, language, datatype) {
        if (value instanceof DataModel.Literal) {
            language = value.language;
            datatype = value.datatype.value;
        } else {
            util.assert(util.isString(value), 'ObjectLiteral#constructor : expected value to be a string', TypeError);
            util.assert(!language || util.isLanguageString(language), 'ObjectLiteral#constructor : expected language to be a Language', TypeError);
            if (datatype instanceof DataModel.NamedNode) datatype = datatype.value;
            else util.assert(!datatype || util.isIRIString(datatype), 'ObjectLiteral#constructor : expected datatype to be an IRI', TypeError);
        }

        this['@value'] = value;
        if (language) this['@language'] = language;
        else if (datatype) this['@type'] = datatype;
        util.lockProp(this, '@value', '@language', '@type');
    } // ObjectLiteral#constructor

}; // ObjectLiteral

module.exports = JsonModel;
