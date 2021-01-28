const
    {
        // Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
        isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
        isQuad, isSubject, isPredicate, isObject, isGraph
    } = require('./DataModel.js'),
    {
        namedNode, blankNode, literal, variable, defaultGraph, quad,
        fromTerm, fromQuad
    } = require('./DataFactory.js');

exports = module.exports = {
    namedNode, blankNode, literal, variable, defaultGraph, quad,
    fromTerm, fromQuad,
    isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
    isQuad, isSubject, isPredicate, isObject, isGraph
}; // exports
