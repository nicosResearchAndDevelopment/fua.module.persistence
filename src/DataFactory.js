const
    { Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad } = require('./DataModel.js'),
    graph_defaultGraph = new DefaultGraph(),
    dt_string = new NamedNode('http://www.w3.org/2001/XMLSchema#string'),
    dt_langString = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');

//#region >> PRIVATE

function _assert(value, errMsg = 'undefined error', errType = Error) {
    if (!value) {
        const err = new errType('module.persistence : DataFactory : ' + errMsg);
        Error.captureStackTrace(err, _assert);
        throw err;
    }
} // _assert

function _isString(value) {
    return typeof value === 'string';
} // _isString

function _isObject(value) {
    return value && typeof value === 'object';
} // _isObject

//#endregion << PRIVATE
//#region >> METHODS

/**
 * @param {IriString} iri
 * @returns {NamedNode}
 */
function namedNode(iri) {
    return new NamedNode(iri);
} // namedNode

/**
 * @param {IdString} id
 * @returns {BlankNode}
 */
function blankNode(id) {
    return new BlankNode(id);
} // blankNode

/**
 * @param {string} value
 * @param {LangString|NamedNode} [langOrDt=NamedNode<"http://www.w3.org/2001/XMLSchema#string">]
 * @returns {Literal}
 */
function literal(value, langOrDt = dt_string) {
    return _isString(langOrDt)
        ? new Literal(value, langOrDt, dt_langString)
        : new Literal(value, '', langOrDt);
} // literal

/**
 * @param {NameString} name
 * @returns {Variable}
 */
function variable(name) {
    return new Variable(name);
} // variable

/**
 * @returns {DefaultGraph}
 */
function defaultGraph() {
    return graph_defaultGraph;
} // defaultGraph

/**
 * @param {Term} subject
 * @param {Term} predicate
 * @param {Term} object
 * @param {Term} [graph=DefaultGraph<>]
 * @returns {Quad}
 */
function quad(subject, predicate, object, graph = defaultGraph()) {
    return new Quad(subject, predicate, object, graph);
} // quad

/**
 * @param {*} original
 * @returns {Term}
 */
function fromTerm(original) {
    _assert(_isObject(original), 'fromTerm : invalid original', TypeError);
    _assert(_isString(original.termType), 'fromTerm : invalid termType', TypeError);
    switch (original.termType) {
        case 'NamedNode':
            return namedNode(original.value);
        case 'BlankNode':
            return blankNode(original.value);
        case 'Literal':
            return literal(original.value, original.language || (original.datatype ? fromTerm(original.datatype) : dt_string));
        case 'Variable':
            return variable(original.value);
        case 'DefaultGraph':
            return defaultGraph();
        case 'Quad':
            return fromQuad(original);
    }
    _assert(false, 'fromTerm : unknown termType ' + original.termType);
} // fromTerm

/**
 * @param {*} original
 * @returns {Quad}
 */
function fromQuad(original) {
    _assert(_isObject(original), 'fromQuad : invalid original', TypeError);
    _assert(!original.termType || original.termType === 'Quad', 'fromQuad : invalid termType', TypeError);
    return quad(
        fromTerm(original.subject),
        fromTerm(original.predicate),
        fromTerm(original.object),
        original.graph ? fromTerm(original.graph) : defaultGraph()
    );
} // fromQuad

//#endregion << METHODS

exports = module.exports = {
    namedNode, blankNode, literal, variable, defaultGraph, quad,
    fromTerm, fromQuad
}; // exports 