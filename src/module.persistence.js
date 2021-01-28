const
    {
        isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
        isQuad, isSubject, isPredicate, isObject, isGraph
    } = require('./DataModel.js'),
    {
        namedNode, blankNode, literal, variable, defaultGraph, quad,
        fromTerm, fromQuad
    } = require('./DataFactory.js'),
    {
        dataset, isDataset
    } = require('./DatasetFactory.js');

exports = module.exports = {
    fromTerm, isTerm,
    namedNode, isNamedNode,
    blankNode, isBlankNode,
    literal, isLiteral,
    variable, isVariable,
    defaultGraph, isDefaultGraph,
    isSubject, isPredicate, isObject, isGraph,
    quad, fromQuad, isQuad,
    dataset, isDataset
}; // exports
