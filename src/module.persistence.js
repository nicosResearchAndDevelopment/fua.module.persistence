const
	rdflib = require('rdflib'),
	n3 = require('n3');

/**
 * @param {string} uri
 * @returns {NamedNode}
 */
exports.namedNode = function(uri) {
	return rdflib.namedNode(uri);
};

/**
 * @param {string} id
 * @returns {BlankNode}
 */
exports.blankNode = function(id) {
	return rdflib.blankNode(id);
};

/**
 * @param {string} value
 * @param {string|NamedNode} [langOrDt]
 * @returns {Literal}
 */
exports.literal = function(value, langOrDt) {
	return rdflib.literal(value, langOrDt);
};

/**
 * @param {string} name
 * @returns {Variable}
 */
exports.variable = function(name) {
	return rdflib.variable(name);
};

/**
 * @returns {DefaultGraph}
 */
exports.defaultGraph = function() {
	return rdflib.defaultGraph();
};

/**
 * @param {Term} subject
 * @param {Term} predicate
 * @param {Term} object
 * @param {Term} [graph]
 * @returns {Quad}
 */
exports.quad = function(subject, predicate, object, graph) {
	const quad = rdflib.quad(subject, predicate, object, graph);
	quad.termType = 'Quad';
	return quad;
};

/**
 * @param {Term} original
 * @returns {Term}
 */
exports.fromTerm = function(original) {
	switch (original.termType) {
		case 'NamedNode':
			return exports.namedNode(original.value);
		case 'BlankNode':
			return exports.blankNode(original.value);
		case 'Literal':
			return exports.literal(original.value, original.language || original.datatype);
		case 'Variable':
			return exports.variable(original.value);
		case 'DefaultGraph':
			return exports.defaultGraph();
	}
};

/**
 * @param {Quad} original
 * @returns {Quad}
 */
exports.fromQuad = function(original) {
	return exports.quad(
		exports.fromTerm(original.subject),
		exports.fromTerm(original.predicate),
		exports.fromTerm(original.object),
		exports.fromTerm(original.graph)
	);
};

/**
 * @param {NamedNode|*} that
 * @returns {true|false}
 */
exports.isNamedNode = function(that) {
	return rdflib.isNamedNode(that);
};

/**
 * @param {BlankNode|*} that
 * @returns {true|false}
 */
exports.isBlankNode = function(that) {
	return rdflib.isBlankNode(that);
};

/**
 * @param {Literal|*} that
 * @returns {true|false}
 */
exports.isLiteral = function(that) {
	return rdflib.isLiteral(that);
};

/**
 * @param {Variable|*} that
 * @returns {true|false}
 */
exports.isVariable = function(that) {
	return rdflib.isVariable(that);
};

/**
 * @param {DefaultGraph|*} that
 * @returns {true|false}
 */
exports.isDefaultGraph = function(that) {
	return rdflib.isDefaultGraph(that);
};

/**
 * @param {Quad|*} that
 * @returns {true|false}
 */
exports.isQuad = function(that) {
	return rdflib.isQuad(that);
};

/**
 * @param {Term} term
 * @returns {string}
 */
exports.termToString = function(term) {
	return n3.termToId(term);
};

/**
 * @param {string} termStr
 * @returns {Term}
 */
exports.termFromString = function(termStr) {
	return n3.termFromId(termStr, exports);
};