const {
    namedNode, blankNode, literal, variable, defaultGraph, quad,
    fromTerm, fromQuad,
    isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
    isQuad, isSubject, isPredicate, isObject, isGraph
} = require('./DataFactory.js'), {
    dataset, isDataset
} = require('./DatasetFactory.js');

module.exports = {
    fromTerm, isTerm,
    namedNode, isNamedNode,
    blankNode, isBlankNode,
    literal, isLiteral,
    variable, isVariable,
    defaultGraph, isDefaultGraph,
    quad, fromQuad, isQuad,
    isSubject, isPredicate, isObject, isGraph,
    dataset, isDataset
};
