const
    {
        Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
        isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
        isQuad, isSubject, isPredicate, isObject, isGraph
    } = require('./DataModel.js'),
    {
        namedNode, blankNode, literal, variable, defaultGraph, quad,
        fromTerm, fromQuad
    } = require('./DataFactory.js');

exports = module.exports = {
    // Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,

    isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
    isQuad, isSubject, isPredicate, isObject, isGraph,

    namedNode, blankNode, literal, variable, defaultGraph, quad,
    fromTerm, fromQuad
}; // exports
