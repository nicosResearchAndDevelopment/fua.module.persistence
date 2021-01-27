//#region >> PRIVATE

function _assert(value, errMsg = 'undefined error', errType = Error) {
    if (!value) {
        const err = new errType('module.persistence : DataModel : ' + errMsg);
        Error.captureStackTrace(err, _assert);
        throw err;
    }
} // _assert

function _lockProp(obj, ...keys) {
    const lock = { writable: false, configurable: false };
    for (let key of keys) {
        Object.defineProperty(obj, key, lock);
    }
} // _lockProp

function _patternValidator(pattern) {
    return value => pattern.test(value);
} // _patternValidator

function _isString(value) {
    return typeof value === 'string';
} // _isString

/**
 * @typedef {"NamedNode"|"BlankNode"|"Literal"|"Variable"|"DefaultGraph"|"Quad"} TermType
 * @pattern /^(?:NamedNode|BlankNode|Literal|Variable|DefaultGraph|Quad)$/
 */
// const _isTermType = _patternValidator(/^(?:NamedNode|BlankNode|Literal|Variable|DefaultGraph|Quad)$/);
const _isTermType = _isString;

/**
 * @typedef {string} IriString
 * @pattern /^\w+:\S+$/
 */
const _isIriString = _patternValidator(/^\w+:\S+$/);

/**
 * @typedef {string} IdString
 * @pattern /^\S+$/
 */
const _isIdString = _patternValidator(/^\S+$/);

/**
 * @typedef {string} NameString
 * @pattern /^[a-z]\w*$/i
 */
const _isNameString = _patternValidator(/^[a-z]\w*$/i);

/**
 * @typedef {string} LangString
 * @pattern /^[a-z]{2}(?:-[a-z]{2})?$/i
 */
const _isLangString = _patternValidator(/^[a-z]{2}(?:-[a-z]{2})?$/i);

//#endregion << PRIVATE
//#region >> CLASSES

/**
 * @typedef Term
 * @property {TermType} termType
 * @property {string} value
 */
class Term {

    /**
     * @param {TermType} termType
     * @param {string} value
     * @abstract
     */
    constructor(termType, value) {
        _assert(new.target !== Term, 'Term#constructor : Term is abstract');
        _assert(_isTermType(termType), 'Term#constructor : invalid termType', TypeError);
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

/**
 * @typedef {Term} NamedNode
 * @property {"NamedNode"} termType
 * @property {IriString} value
 */
class NamedNode extends Term {

    /**
     * @param {IriString} iri
     */
    constructor(iri) {
        _assert(_isIriString(iri), 'NamedNode#constructor : invalid iri', TypeError);

        super('NamedNode', iri);
    } // NamedNode#constructor

} // NamedNode

/**
 * @typedef {Term} BlankNode
 * @property {"BlankNode"} termType
 * @property {IdString} value
 */
class BlankNode extends Term {

    /**
     * @param {IdString} id
     */
    constructor(id) {
        _assert(_isIdString(id), 'BlankNode#constructor : invalid id', TypeError);

        super('BlankNode', id);
    } // BlankNode#constructor

} // BlankNode

/**
 * @typedef {Term} Literal
 * @property {"Literal"} termType
 * @property {string} value
 * @property {LangString} language
 * @property {NamedNode} datatype
 */
class Literal extends Term {

    /**
     * @param {string} value
     * @param {LangString} [language]
     * @param {NamedNode} datatype
     */
    constructor(value, language, datatype) {
        if (language) {
            _assert(_isLangString(language), 'Literal#constructor : invalid language', TypeError);
            _assert(isNamedNode(datatype) && datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
                'Literal#constructor : invalid datatype', TypeError);
        } else {
            _assert(isNamedNode(datatype), 'Literal#constructor : invalid datatype', TypeError);
            language = '';
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

/**
 * @typedef {Term} Variable
 * @property {"Variable"} termType
 * @property {NameString} value
 */
class Variable extends Term {

    /**
     * @param {NameString} name
     */
    constructor(name) {
        _assert(_isNameString(name), 'Variable#constructor : invalid name', TypeError);

        super('Variable', name);
    } // Variable#constructor

} // Variable

/**
 * @typedef {Term} DefaultGraph
 * @property {"DefaultGraph"} termType
 * @property {""} value
 */
class DefaultGraph extends Term {

    constructor() {
        super('DefaultGraph', '');
    } // DefaultGraph#constructor

} // DefaultGraph

/**
 * @typedef {Term} Quad
 * @property {"Quad"} termType
 * @property {""} value
 * @property {Term} subject
 * @property {Term} predicate
 * @property {Term} object
 * @property {Term} graph
 */
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

//#endregion << CLASSES
//#region >> METHODS

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isTerm(term) {
    return term instanceof Term;
} // isTerm

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isNamedNode(term) {
    return term instanceof NamedNode;
} // isNamedNode

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isBlankNode(term) {
    return term instanceof BlankNode;
} // isBlankNode

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isLiteral(term) {
    return term instanceof Literal;
} // isLiteral

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isVariable(term) {
    return term instanceof Variable;
} // isVariable

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isDefaultGraph(term) {
    return term instanceof DefaultGraph;
} // isDefaultGraph

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isQuad(term) {
    return term instanceof Quad;
} // isQuad

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isSubject(term) {
    return isNamedNode(term) || isBlankNode(term) || isVariable(term);
} // isSubject

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isPredicate(term) {
    return isNamedNode(term) || isVariable(term);
} // isPredicate

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isObject(term) {
    return isNamedNode(term) || isLiteral(term) || isBlankNode(term) || isVariable(term);
} // isObject

/**
 * @param {Term} term
 * @returns {boolean}
 */
function isGraph(term) {
    return isNamedNode(term) || isDefaultGraph(term) || isVariable(term);
} // isGraph

//#endregion << METHODS

exports = module.exports = {
    Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
    isTerm, isNamedNode, isBlankNode, isLiteral, isVariable, isDefaultGraph,
    isQuad, isSubject, isPredicate, isObject, isGraph
}; // exports
