// REM: never require the DataModel before the DataFactory
// TODO rework patterns, e.g. IRI pattern, to match specifications

const
    _ = require('./util.js'),
    model = exports,
    factory = require('./DataFactory.js'),
    _isIRI = _.strValidator(/^\w+:\S+$/),
    _isId = _.strValidator(/^\S+$/),
    _isName = _.strValidator(/^[a-z]\w*$/i),
    _isLang = _.strValidator(/^[a-z]{2}(?:-[a-z]{2})?$/i);

/**
 * @class Term
 */
model.Term = class {

    /**
     * @param {string} termType
     * @param {string} value
     * @abstract
     */
    constructor(termType, value) {
        _.assert(new.target !== model.Term, 'Term#constructor : Term is abstract');
        _.assert(_.isString(termType), 'Term#constructor : invalid termType', TypeError);
        _.assert(_.isString(value), 'Term#constructor : invalid value', TypeError);
        /** @type {string} */
        this.termType = termType;
        /** @type {string} */
        this.value = value;
        _.lockProp(this, 'value', 'termType');
    } // Term#constructor

    /**
     * @param {Term} other
     * @returns {boolean}
     */
    equals(other) {
        return factory.isTerm(other)
            && this.termType === other.termType
            && this.value === other.value;
    } // Term#equals

    /**
     * @returns {string}
     */
    toString() {
        return `${this.termType}<${this.value}>`;
    } // Term#toString

}; // Term

/**
 * @class NamedNode
 * @extends Term
 */
model.NamedNode = class extends model.Term {

    /**
     * @param {string} iri
     */
    constructor(iri) {
        _.assert(_isIRI(iri), 'NamedNode#constructor : invalid iri', TypeError);
        super('NamedNode', iri);
    } // NamedNode#constructor

}; // NamedNode

/**
 * @class BlankNode
 * @extends Term
 */
model.BlankNode = class extends model.Term {

    /**
     * @param {string} id
     */
    constructor(id) {
        _.assert(_isId(id), 'BlankNode#constructor : invalid id', TypeError);
        super('BlankNode', id);
    } // BlankNode#constructor

}; // BlankNode

/**
 * @class Literal
 * @extends Term
 */
model.Literal = class extends model.Term {

    /**
     * @param {string} value
     * @param {string} language
     * @param {NamedNode} datatype
     */
    constructor(value, language, datatype) {
        if (language) {
            _.assert(_isLang(language), 'Literal#constructor : invalid language', TypeError);
            _.assert(factory.isNamedNode(datatype) && datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
                'Literal#constructor : invalid datatype', TypeError);
        } else {
            _.assert(_.isString(language), 'Literal#constructor : invalid language', TypeError);
            _.assert(factory.isNamedNode(datatype), 'Literal#constructor : invalid datatype', TypeError);
        }
        super('Literal', value);
        /** @type {string} */
        this.language = language;
        /** @type {NamedNode} */
        this.datatype = datatype;
        _.lockProp(this, 'language', 'datatype');
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

    /**
     * @returns {string}
     */
    toString() {
        return `${this.termType}<${this.value},${this.language},${this.datatype}>`;
    } // Literal#toString

}; // Literal

/**
 * @class Variable
 * @extends Term
 */
model.Variable = class extends model.Term {

    /**
     * @param {string} name
     */
    constructor(name) {
        _.assert(_isName(name), 'Variable#constructor : invalid name', TypeError);
        super('Variable', name);
    } // Variable#constructor

}; // Variable

/**
 * @class DefaultGraph
 * @extends Term
 */
model.DefaultGraph = class extends model.Term {

    constructor() {
        super('DefaultGraph', '');
    } // DefaultGraph#constructor

}; // DefaultGraph

/**
 * @class DefaultGraph
 * @extends Term
 */
model.Quad = class extends model.Term {

    /**
     * @param {Term} subject
     * @param {Term} predicate
     * @param {Term} object
     * @param {Term} graph
     */
    constructor(subject, predicate, object, graph) {
        _.assert(factory.isSubject(subject), 'Quad#constructor : invalid subject', TypeError);
        _.assert(factory.isPredicate(predicate), 'Quad#constructor : invalid predicate', TypeError);
        _.assert(factory.isObject(object), 'Quad#constructor : invalid object', TypeError);
        _.assert(factory.isGraph(graph), 'Quad#constructor : invalid graph', TypeError);
        super('Quad', '');
        /** @type {Term} */
        this.subject = subject;
        /** @type {Term} */
        this.predicate = predicate;
        /** @type {Term} */
        this.object = object;
        /** @type {Term} */
        this.graph = graph;
        _.lockProp(this, 'subject', 'predicate', 'object', 'graph');
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

    /**
     * @returns {string}
     */
    toString() {
        return `${this.termType}<${this.subject},${this.predicate},${this.object},${this.graph}>`;
    } // Quad#toString

}; // Quad
