const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    // JsonModel    = require('./module.persistence.json-model.js'),
    FactoryModel = require('./module.persistence.factory-model.js'),
    StoreModel   = require('./module.persistence.store-model.js');

exports.model       = DataModel;
exports.TermFactory = FactoryModel.TermFactory;
exports.DataFactory = FactoryModel.DataFactory;
exports.Dataset     = StoreModel.Dataset;
exports.DataStore   = StoreModel.DataStore;

util.lockAllProp(exports, Infinity);
