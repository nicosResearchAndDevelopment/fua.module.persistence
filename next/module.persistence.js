const
    persistence = exports,
    util        = require('./module.persistence.util.js');

persistence.model       = require('./module.persistence.model.js');
persistence.TermFactory = require('./module.persistence.factory.js');
persistence.Dataset     = require('./module.persistence.dataset.js');
persistence.DataStore   = require('./module.persistence.store.js');

util.lockAllProp(persistence, Infinity);
