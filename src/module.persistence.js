const persistence = exports;

persistence.TermFactory = require('./module.persistence.TermFactory.js');
persistence.DataFactory = require('./module.persistence.DataFactory.js');
persistence.Dataset     = require('./module.persistence.Dataset.js');
persistence.DataStore   = require('./module.persistence.DataStore.js');

Object.freeze(persistence);