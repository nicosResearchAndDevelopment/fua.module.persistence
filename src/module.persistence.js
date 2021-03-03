const persistence = exports;

persistence.TermFactory = require('./module.persistence.TermFactory.js');
persistence.DataFactory = require('./module.persistence.DataFactory.js');
persistence.Dataset     = require('./module.persistence.Dataset.js');
persistence.DataStore   = require('./module.persistence.DataStore.js');

persistence.wrapFactory = (factory) => ({
    namedNode:    (iri) => factory.namedNode(iri),
    blankNode:    (id) => factory.blankNode(id),
    literal:      (value, langOrDt) => factory.literal(value, langOrDt),
    variable:     (name) => factory.variable(name),
    defaultGraph: () => factory.defaultGraph(),
    quad:         (subj, pred, obj, graph) => factory.quad(subj, pred, obj, graph),
    dataset:      (quads) => new persistence.Dataset(quads, factory)
});

Object.freeze(persistence);