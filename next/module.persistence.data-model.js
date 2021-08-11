const
    util      = require('./module.persistence.util.js'),
    DataModel = exports;

/**
 * @abstract
 * @class DataModel.Term
 * @see https://rdf.js.org/data-model-spec/#term-interface
 */
DataModel.Term = class Term {

    /**
     * @param {string} value
     */
    constructor(value) {
        util.assert(new.target !== DataModel.Term, 'Term#constructor : Term is an abstract class');
        util.assert(util.isString(value), 'Term#constructor : expected value to be a string', TypeError);

        /** @type {"NamedNode"|"BlankNode"|"Literal"|"Variable"|"DefaultGraph"|"Quad"} */
        this.termType = new.target.name;

        /** @type {string} */
        this.value = value;

        util.lockProp(this, 'termType', 'value');
    } // Term#constructor

    /**
     * @param {DataModel.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value;
    } // Term#equals

    /**
     * @returns {string}
     */
    toString() {
        return '';
    } // Term#toString

}; // Term

/**
 * @class DataModel.NamedNode
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
DataModel.NamedNode = class NamedNode extends DataModel.Term {

    /** @type {boolean} */
    #isPrefixed = false;

    /**
     * @param {string} iri
     */
    constructor(iri) {
        util.assert(util.isIRIString(iri), 'NamedNode#constructor : expected iri to be an IRI', TypeError);

        super(iri);

        const colonIndex = iri.indexOf(':');
        this.#isPrefixed = colonIndex > 0 && iri.charAt(colonIndex + 1) !== '/';
    } // NamedNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return this.#isPrefixed ? this.value : '<' + this.value + '>';
    } // NamedNode#toString

}; // NamedNode

/**
 * @class DataModel.BlankNode
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#blanknode-interface
 */
DataModel.BlankNode = class BlankNode extends DataModel.Term {

    /**
     * @param {string} id
     */
    constructor(id) {
        util.assert(util.isIdentifierString(id), 'BlankNode#constructor : expected id to be an Identifier', TypeError);

        super(id);
    } // BlankNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '_:' + this.value;
    } // BlankNode#toString

}; // BlankNode

/**
 * @class DataModel.Literal
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
DataModel.Literal = class Literal extends DataModel.Term {

    /** @type {string} */
    #typeTag = '';

    /**
     * @param {string} value
     * @param {string} language
     * @param {DataModel.NamedNode} datatype
     */
    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'Literal#constructor : expected value to be a string', TypeError);
        util.assert(language === '' || util.isLanguageString(language), 'Literal#constructor : expected language to be a Language', TypeError);
        util.assert(datatype instanceof DataModel.NamedNode, 'Literal#constructor : expected datatype to be a NamedNode', TypeError);
        const typeTag = language && '@' + language || '^^' + datatype.toString();

        super(value);

        /** @type {string} */
        this.language = language;
        /** @type {DataModel.NamedNode} */
        this.datatype = datatype;

        util.lockProp(this, 'language', 'datatype');

        this.#typeTag = typeTag;
    } // Literal#constructor

    /**
     * @param {DataModel.Literal|DataModel.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value
            && this.language === other.language
            && this.datatype.equals(other.datatype);
    } // Literal#equals

    /**
     * @returns {string}
     */
    toString() {
        return '"' + util.encodeLiteralValue(this.value) + '"' + this.#typeTag;
    } // Literal#toString

}; // Literal

/**
 * @class DataModel.Variable
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#variable-interface
 */
DataModel.Variable = class Variable extends DataModel.Term {

    /**
     * @param {string} name
     */
    constructor(name) {
        util.assert(util.isVariableString(name), 'Variable#constructor : expected name to be a Variable', TypeError);

        super(name);
    } // Variable#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '?' + this.value;
    } // Variable#toString

}; // Variable

/**
 * @class DataModel.DefaultGraph
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#defaultgraph-interface
 */
DataModel.DefaultGraph = class DefaultGraph extends DataModel.Term {

    constructor() {
        super('');
    } // DefaultGraph#constructor

}; // DefaultGraph

/**
 * @name DataModel.Subject
 * @see https://rdf.js.org/data-model-spec/#dfn-subject
 */
DataModel.Subject = {
    [Symbol.hasInstance](instance) {
        return (instance instanceof DataModel.NamedNode)
            || (instance instanceof DataModel.BlankNode)
            || (instance instanceof DataModel.Variable)
            || (instance instanceof DataModel.Quad);
    } // Subject.@@hasInstance
}; // Subject

/**
 * @name DataModel.Predicate
 * @see https://rdf.js.org/data-model-spec/#dfn-predicate
 */
DataModel.Predicate = {
    [Symbol.hasInstance](instance) {
        return (instance instanceof DataModel.NamedNode)
            || (instance instanceof DataModel.Variable);
    } // Predicate.@@hasInstance
}; // Predicate

/**
 * @name DataModel.Object
 * @see https://rdf.js.org/data-model-spec/#dfn-object
 */
DataModel.Object = {
    [Symbol.hasInstance](instance) {
        return (instance instanceof DataModel.NamedNode)
            || (instance instanceof DataModel.Literal)
            || (instance instanceof DataModel.BlankNode)
            || (instance instanceof DataModel.Variable);
    } // Object.@@hasInstance
}; // Object

/**
 * @name DataModel.Graph
 * @see https://rdf.js.org/data-model-spec/#dfn-graph
 */
DataModel.Graph = {
    [Symbol.hasInstance](instance) {
        return (instance instanceof DataModel.DefaultGraph)
            || (instance instanceof DataModel.NamedNode)
            || (instance instanceof DataModel.BlankNode)
            || (instance instanceof DataModel.Variable);
    } // Graph.@@hasInstance
}; // Graph

/**
 * @class DataModel.Quad
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#quad-interface
 */
DataModel.Quad = class Quad extends DataModel.Term {

    /**
     * @param {DataModel.Term} subject
     * @param {DataModel.Term} predicate
     * @param {DataModel.Term} object
     * @param {DataModel.Term} graph
     */
    constructor(subject, predicate, object, graph) {
        util.assert(subject instanceof DataModel.Subject, 'Quad#constructor : expected subject to be a Subject Term', TypeError);
        util.assert(predicate instanceof DataModel.Predicate, 'Quad#constructor : expected predicate to be a Predicate Term', TypeError);
        util.assert(object instanceof DataModel.Object, 'Quad#constructor : expected object to be a Object Term', TypeError);
        util.assert(graph instanceof DataModel.Graph, 'Quad#constructor : expected graph to be a Graph Term', TypeError);

        super('');

        /** @type {DataModel.Term} */
        this.subject = subject;
        /** @type {DataModel.Term} */
        this.predicate = predicate;
        /** @type {DataModel.Term} */
        this.object = object;
        /** @type {DataModel.Term} */
        this.graph = graph;

        util.lockProp(this, 'subject', 'predicate', 'object', 'graph');
    } // Quad#constructor

    /**
     * @param {DataModel.Quad|DataModel.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.subject.equals(other.subject)
            && this.predicate.equals(other.predicate)
            && this.object.equals(other.object)
            && this.graph.equals(other.graph);
    } // Quad#equals

    /**
     * @returns {string}
     */
    toString() {
        return '{' + this.subject.toString()
            + ' ' + this.predicate.toString()
            + ' ' + this.object.toString()
            + (this.graph instanceof DataModel.DefaultGraph ? '' : ' ' + this.graph.toString())
            + '}';
    } // Quad#toString

}; // Quad

/**
 * @name DataModel.Triple
 */
DataModel.Triple = {
    [Symbol.hasInstance](instance) {
        return (instance instanceof DataModel.Quad)
            && (instance.graph instanceof DataModel.DefaultGraph);
    } // Triple.@@hasInstance
}; // Triple

module.exports = DataModel;
