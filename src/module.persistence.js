const
	{
		Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
		isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
		isQuad, isSubject, isPredicate, isObject, isGraph, isData,
		isDataQuad, isDataSubject, isDataPredicate, isDataObject, isDataGraph
	} = require('./DataModel.js'),
	{
		namedNode, blankNode, literal, variable, defaultGraph, quad,
		fromTerm, fromQuad, fromString
	} = require('./DataFactory.js'),
	DataFactory = require('./DataFactory.js'),
	n3 = require('n3');

/**
 * @param {Term} term
 * @returns {string}
 */
function termToString(term) {
	return n3.termToId(term);
}

/**
 * @param {string} termStr
 * @returns {Term}
 */
function termFromString(termStr) {
	return n3.termFromId(termStr, DataFactory);
}

exports = module.exports = {
	Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
	isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
	isQuad, isSubject, isPredicate, isObject, isGraph, isData,
	isDataQuad, isDataSubject, isDataPredicate, isDataObject, isDataGraph,

	namedNode, blankNode, literal, variable, defaultGraph, quad,
	fromTerm, fromQuad, fromString,

	termToString, termFromString
}; // exports
