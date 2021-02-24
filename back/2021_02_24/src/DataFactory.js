// REM: never override the module.exports for a factory, use exports instead

const
    _ = require('./util.js'),
    model = require('./DataModel.js'),
    factory = exports,
    graph_defaultGraph = new model.DefaultGraph(),
    dt_string = new model.NamedNode('http://www.w3.org/2001/XMLSchema#string'),
    dt_langString = new model.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');

/**
 * @function isTerm
 * @param {Term} term
 * @returns {boolean}
 */
factory.isTerm = function(term) {
    return term instanceof model.Term;
}; // isTerm

/**
 * @function isNamedNode
 * @param {Term} term
 * @returns {boolean}
 */
factory.isNamedNode = function(term) {
    return term instanceof model.NamedNode;
}; // isNamedNode

/**
 * @function isBlankNode
 * @param {Term} term
 * @returns {boolean}
 */
factory.isBlankNode = function(term) {
    return term instanceof model.BlankNode;
}; // isBlankNode

/**
 * @function isLiteral
 * @param {Term} term
 * @returns {boolean}
 */
factory.isLiteral = function(term) {
    return term instanceof model.Literal;
}; // isLiteral

/**
 * @function isVariable
 * @param {Term} term
 * @returns {boolean}
 */
factory.isVariable = function(term) {
    return term instanceof model.Variable;
}; // isVariable

/**
 * @function isDefaultGraph
 * @param {Term} term
 * @returns {boolean}
 */
factory.isDefaultGraph = function(term) {
    return term instanceof model.DefaultGraph;
}; // isDefaultGraph

/**
 * @function isQuad
 * @param {Term} term
 * @returns {boolean}
 */
factory.isQuad = function(term) {
    return term instanceof model.Quad;
}; // isQuad

/**
 * @function isSubject
 * @param {Term} term
 * @returns {boolean}
 */
factory.isSubject = function(term) {
    return factory.isNamedNode(term)
        || factory.isBlankNode(term)
        || factory.isVariable(term);
}; // isSubject

/**
 * @function isPredicate
 * @param {Term} term
 * @returns {boolean}
 */
factory.isPredicate = function(term) {
    return factory.isNamedNode(term)
        || factory.isVariable(term);
}; // isPredicate

/**
 * @function isObject
 * @param {Term} term
 * @returns {boolean}
 */
factory.isObject = function(term) {
    return factory.isNamedNode(term)
        || factory.isLiteral(term)
        || factory.isBlankNode(term)
        || factory.isVariable(term);
}; // isObject

/**
 * @function isGraph
 * @param {Term} term
 * @returns {boolean}
 */
factory.isGraph = function(term) {
    return factory.isNamedNode(term)
        || factory.isDefaultGraph(term)
        || factory.isVariable(term);
}; // isGraph

/**
 * @function namedNode
 * @param {string} iri
 * @returns {NamedNode}
 */
factory.namedNode = function(iri) {
    return new model.NamedNode(iri);
}; // namedNode

/**
 * @function blankNode
 * @param {string} id
 * @returns {BlankNode}
 */
factory.blankNode = function(id) {
    return new model.BlankNode(id);
}; // blankNode

/**
 * @function literal
 * @param {string} value
 * @param {string|NamedNode} [langOrDt]
 * @returns {Literal}
 */
factory.literal = function(value, langOrDt) {
    return langOrDt && _.isString(langOrDt)
        ? new model.Literal(value, langOrDt, dt_langString)
        : new model.Literal(value, '', langOrDt || dt_string);
}; // literal 

/**
 * @function variable
 * @param {string} name
 * @returns {Variable}
 */
factory.variable = function(name) {
    return new model.Variable(name);
}; // variable

/**
 * @function defaultGraph
 * @returns {DefaultGraph}
 */
factory.defaultGraph = function() {
    return graph_defaultGraph;
}; // defaultGraph 

/**
 * @function quad
 * @param {Term} subject
 * @param {Term} predicate
 * @param {Term} object
 * @param {Term} [graph]
 * @returns {Quad}
 */
factory.quad = function(subject, predicate, object, graph) {
    return new model.Quad(subject, predicate, object, graph || graph_defaultGraph);
}; // quad

/**
 * @function fromTerm
 * @param {{termType: string, value: string, language?: string, datatype?: {termType: "NamedNode", value: string}}} original
 * @returns {Term}
 */
factory.fromTerm = function(original) {
    _.assert(_.isObject(original), 'fromTerm : invalid original', TypeError);
    if (factory.isTerm(original)) return original;
    _.assert(_.isString(original.termType), 'fromTerm : invalid termType', TypeError);
    switch (original.termType) {
        case 'NamedNode':
            return factory.namedNode(original.value);
        case 'BlankNode':
            return factory.blankNode(original.value);
        case 'Literal':
            return factory.literal(original.value,
                original.language ||
                (original.datatype ? factory.fromTerm(original.datatype) : dt_string));
        case 'Variable':
            return factory.variable(original.value);
        case 'DefaultGraph':
            return graph_defaultGraph;
        case 'Quad':
            return factory.fromQuad(original);
    }
    _.assert(false, 'fromTerm : unknown termType ' + original.termType);
}; // fromTerm

/**
 * @function fromQuad
 * @param {{termType?: "Quad", subject: Object, predicate: Object, object: Object, graph?: Object}} original
 * @returns {Quad}
 */
factory.fromQuad = function(original) {
    _.assert(_.isObject(original), 'fromQuad : invalid original', TypeError);
    if (factory.isQuad(original)) return original;
    _.assert(!original.termType || original.termType === 'Quad', 'fromQuad : invalid termType', TypeError);
    return factory.quad(
        factory.fromTerm(original.subject),
        factory.fromTerm(original.predicate),
        factory.fromTerm(original.object),
        original.graph ? factory.fromTerm(original.graph) : graph_defaultGraph
    );
}; // fromQuad
