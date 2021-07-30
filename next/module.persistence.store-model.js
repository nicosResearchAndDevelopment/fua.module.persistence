const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    FactoryModel = require('./module.persistence.factory-model.js'),
    StoreModel   = exports;

/**
 * @class StoreModel.Dataset
 * @see https://rdf.js.org/dataset-spec/#dataset-interface
 * @memberOf exports
 * @public
 */
StoreModel.Dataset = class Dataset {

}; // StoreModel.Dataset

/**
 * @abstract
 * @class StoreModel.DataStore
 * @memberOf exports
 * @public
 */
StoreModel.DataStore = class DataStore {

}; // StoreModel.DataStore
