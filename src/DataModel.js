const
    { _assert, _lockProp, _strValidator, _isString } = require('./util.js'),
    // TODO rework patterns, e.g. IRI pattern, to match specifications
    _isIRI = _strValidator(/^\w+:\S+$/),
    _isId = _strValidator(/^\S+$/),
    _isName = _strValidator(/^[a-z]\w*$/i),
    _isLang = _strValidator(/^[a-z]{2}(?:-[a-z]{2})?$/i)
;

class Term {

    /**
     * @param {string} termType
     * @param {string} value
     * @abstract
     */
    constructor(termType, value) {
        _assert(new.target !== Term, 'Term#constructor : Term is abstract');
        _assert(_isString(termType), 'Term#constructor : invalid termType', TypeError);
        _assert(_isString(value), 'Term#constructor : invalid value', TypeError);
        this.termType = termType;
        this.value = value;
        _lockProp(this, 'value', 'termType');
    } // Term#constructor

    /**
     * @param {Term} other
     * @returns {boolean}
     */
    equals(other) {
        return isTerm(other)
            && this.termType === other.termType
            && this.value === other.value;
    } // Term#equals

} // Term

class NamedNode extends Term {

    /**
     * @param {string} iri
     */
    constructor(iri) {
        _assert(_isIRI(iri), 'NamedNode#constructor : invalid iri', TypeError);
        super('NamedNode', iri);
    } // NamedNode#constructor

} // NamedNode

class BlankNode extends Term {

    /**
     * @param {string} id
     */
    constructor(id) {
        _assert(_isId(id), 'BlankNode#constructor : invalid id', TypeError);
        super('BlankNode', id);
    } // BlankNode#constructor

} // BlankNode

class Literal extends Term {

    /**
     * @param {string} value
     * @param {string} language
     * @param {NamedNode} datatype
     */
    constructor(value, language, datatype) {
        if (language) {
            _assert(_isLang(language), 'Literal#constructor : invalid language', TypeError);
            _assert(isNamedNode(datatype) && datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
                'Literal#constructor : invalid datatype', TypeError);
        } else {
            _assert(_isString(language), 'Literal#constructor : invalid language', TypeError);
            _assert(isNamedNode(datatype), 'Literal#constructor : invalid datatype', TypeError);
        }
        super('Literal', value);
        this.language = language;
        this.datatype = datatype;
        _lockProp(this, 'language', 'datatype');
    } // Literal#constructor

    /**
     * @param {Term|Literal} other
     * @returns {boolean}
     */
    equals(other) {
        return super.equals(other)
            && this.language === other.language
            && this.datatype.equals(other.datatype);
    } // Literal#equals

} // Literal

class Variable extends Term {

    /**
     * @param {string} name
     */
    constructor(name) {
        _assert(_isName(name), 'Variable#constructor : invalid name', TypeError);
        super('Variable', name);
    } // Variable#constructor

} // Variable

class DefaultGraph extends Term {

    constructor() {
        super('DefaultGraph', '');
    } // DefaultGraph#constructor

} // DefaultGraph

class Quad extends Term {

    /**
     * @param {Term} subject
     * @param {Term} predicate
     * @param {Term} object
     * @param {Term} graph
     */
    constructor(subject, predicate, object, graph) {
        _assert(isSubject(subject), 'Quad#constructor : invalid subject', TypeError);
        _assert(isPredicate(predicate), 'Quad#constructor : invalid predicate', TypeError);
        _assert(isObject(object), 'Quad#constructor : invalid object', TypeError);
        _assert(isGraph(graph), 'Quad#constructor : invalid graph', TypeError);
        super('Quad', '');
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
        _lockProp(this, 'subject', 'predicate', 'object', 'graph');
    } // Quad#constructor

    /**
     * @param {Term|Quad} other
     * @returns {boolean}
     */
    equals(other) {
        return super.equals(other)
            && this.subject.equals(other.subject)
            && this.predicate.equals(other.predicate)
            && this.object.equals(other.object)
            && this.graph.equals(other.graph);
    } // Quad#equals

} // Quad

function isTerm(term) {
    return term instanceof Term;
} // isTerm

function isNamedNode(term) {
    return term instanceof NamedNode;
} // isNamedNode

function isBlankNode(term) {
    return term instanceof BlankNode;
} // isBlankNode

function isLiteral(term) {
    return term instanceof Literal;
} // isLiteral

function isVariable(term) {
    return term instanceof Variable;
} // isVariable

function isDefaultGraph(term) {
    return term instanceof DefaultGraph;
} // isDefaultGraph

function isQuad(term) {
    return term instanceof Quad;
} // isQuad

function isSubject(term) {
    return isNamedNode(term) || isBlankNode(term) || isVariable(term);
} // isSubject

function isPredicate(term) {
    return isNamedNode(term) || isVariable(term);
} // isPredicate

function isObject(term) {
    return isNamedNode(term) || isLiteral(term) || isBlankNode(term) || isVariable(term);
} // isObject

function isGraph(term) {
    return isNamedNode(term) || isDefaultGraph(term) || isVariable(term);
} // isGraph

module.exports = {
    Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
    isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
    isQuad, isSubject, isPredicate, isObject, isGraph
}; // exports
