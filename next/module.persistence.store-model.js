const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    FactoryModel = require('./module.persistence.factory-model.js'),
    /** @namespace StoreModel */
    StoreModel   = exports;

/**
 * @class TermIndex
 * @memberOf StoreModel
 */
StoreModel.TermIndex = class TermIndex {

    // TODO

}; // StoreModel.TermIndex

/**
 * @class QuadIndex
 * @memberOf StoreModel
 */
StoreModel.QuadIndex = class QuadIndex {

    // TODO

}; // StoreModel.QuadIndex

/**
 * @class Dataset
 * @memberOf StoreModel
 * @see https://rdf.js.org/dataset-spec/#dataset-interface
 */
StoreModel.Dataset = class Dataset {

    // TODO

}; // StoreModel.Dataset

/**
 * @abstract
 * @class DataStore
 * @memberOf StoreModel
 */
StoreModel.DataStore = class DataStore {

    // TODO

}; // StoreModel.DataStore

module.exports = StoreModel;
