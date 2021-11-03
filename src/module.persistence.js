const persistence = exports;

/** @type {typeof fua.module.persistence.TermFactory} */
persistence.TermFactory = require('./module.persistence.TermFactory.js');
/** @type {typeof fua.module.persistence.DataFactory} */
persistence.DataFactory = require('./module.persistence.DataFactory.js');
/** @type {typeof fua.module.persistence.Dataset} */
persistence.Dataset     = require('./module.persistence.Dataset.js');
/** @type {typeof fua.module.persistence.DataStore} */
persistence.DataStore   = require('./module.persistence.DataStore.js');

Object.freeze(persistence);
