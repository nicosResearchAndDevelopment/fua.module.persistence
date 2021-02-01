const
    _ = require('./util.js'),
    model = require('./DatasetModel.js'),
    factory = exports;

/**
 * @function termToId
 * @param {Term|Literal|Quad} term
 * @returns {string}
 */
factory.termToId = function(term) {
    switch (term.termType) {
        case 'NamedNode':
            return term.value;
        case 'BlankNode':
            return '_:' + term.value;
        case 'Literal':
            return '"' + term.value + '"'
                + (term.language ? '@' + term.language : '^^' + term.datatype.value);
        case 'Variable':
            return '?' + term.value;
        case 'DefaultGraph':
            return '';
        case 'Quad':
            return factory.termToId(term.subject) + ' '
                + factory.termToId(term.predicate) + ' '
                + factory.termToId(term.object) + ' '
                + factory.termToId(term.graph) + ' .';
    }
}; // termToId

/**
 * @function isDataset
 * @param {Dataset} that
 * @returns {boolean}
 */
factory.isDataset = function(that) {
    return that instanceof model.Dataset;
}; // isDataset

/**
 * @function dataset
 * @param {Iterable<Quad>} quads
 * @returns {Dataset}
 */
factory.dataset = function(quads) {
    return new model.Dataset(quads);
}; // dataset

/**
 * @function termIndex
 * @returns {TermIndex}
 */
factory.termIndex = function() {
    return new model.TermIndex();
}; // termIndex

/**
 * @function quadIndex
 * @returns {QuadIndex}
 */
factory.quadIndex = function() {
    return new model.QuadIndex();
}; // quadIndex