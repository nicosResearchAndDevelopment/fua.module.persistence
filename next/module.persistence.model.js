const
    /** @type {exports} */
    model = exports,
    util  = require('./module.persistence.util.js');

/**
 * @class model.Term
 */
model.Term = class Term {

    /**
     * @param {string} value
     */
    constructor(value) {
        util.assert(new.target !== model.Term, 'Term is an abstract class');
        util.assert(util.isString(value), 'expected value to be a string');

        /** @type {"NamedNode"|"BlankNode"|"Literal"|"Variable"|"DefaultGraph"|"Quad"} */
        this.termType = new.target.name;

        /** @type {string} */
        this.value = value;

        util.lockProp(this, 'termType', 'value');
    } // model.Term#constructor

    /**
     * @param {model.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value;
    } // model.Term#equals

    /**
     * @returns {string}
     */
    toString() {
        return '';
    } // model.Term#toString

}; // model.Term

/**
 * @class model.NamedNode
 * @extends {model.Term}
 */
model.NamedNode = class NamedNode extends model.Term {

    /** @type {boolean} */
    #absoluteIRI = true;

    /**
     * @param {string} iri
     */
    constructor(iri) {
        util.assert(util.isIRIString(iri), 'expected iri to be an IRI');
        const absoluteIRI = iri.substr(iri.indexOf(':'), 2) === '//';

        super(iri);

        this.#absoluteIRI = absoluteIRI;
    } // model.NamedNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return this.#absoluteIRI && '<' + this.value + '>' || this.value;
    } // model.NamedNode#toString

}; // model.NamedNode

/**
 * @class model.BlankNode
 * @extends {model.Term}
 */
model.BlankNode = class BlankNode extends model.Term {

    /**
     * @param {string} id
     */
    constructor(id) {
        util.assert(util.isIdentifierString(id), 'expected id to be an Identifier');

        super(id);
    } // model.BlankNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '_:' + this.value;
    } // model.BlankNode#toString

}; // model.BlankNode

/**
 * @class model.Literal
 * @extends {model.Term}
 */
model.Literal = class Literal extends model.Term {

    /** @type {"\""|"'"|"\"\"\""|"'''"} */
    #quoteMark = '"';
    /** @type {string} */
    #typeTag   = '';

    /**
     * @param {string} value
     * @param {string} language
     * @param {model.NamedNode} datatype
     */
    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'expected value to be a string');
        const quoteMark = !value.includes('\n') && (!value.includes('"') && '"' || !value.includes("'") && "'")
            || !value.includes('"""') && '"""' || !value.includes("'''") && "'''" || null;
        util.assert(quoteMark, 'expected to be able to generate quotation marks for the value');
        util.assert(language === '' || util.isLanguageString(language), 'expected language to be a Language');
        util.assert(datatype instanceof model.NamedNode, 'expected datatype to be a NamedNode');
        const typeTag = language && '@' + language || '^^' + datatype.toString();

        super(value);

        /** @type {string} */
        this.language = language;
        /** @type {model.NamedNode} */
        this.datatype = datatype;

        util.lockProp(this, 'language', 'datatype');

        this.#quoteMark = quoteMark;
        this.#typeTag   = typeTag;
    } // model.Literal#constructor

    /**
     * @param {model.Literal|model.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value
            && this.language === other.language
            && this.datatype.equals(other.datatype);
    } // model.Literal#equals

    /**
     * @returns {string}
     */
    toString() {
        return this.#quoteMark + this.value + this.#quoteMark + this.#typeTag;
        // IDEA return '"' + encodeURIComponent(this.value) + '"' + this.#typeTag;
    } // model.Literal#toString

}; // model.Literal

/**
 * @class model.Variable
 * @extends {model.Term}
 */
model.Variable = class Variable extends model.Term {

    /**
     * @param {string} name
     */
    constructor(name) {
        util.assert(util.isVariableString(name), 'expected name to be a Variable');

        super(name);
    } // model.Variable#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '?' + this.value;
    } // model.Variable#toString

}; // model.Variable

/**
 * @class model.DefaultGraph
 * @extends {model.Term}
 */
model.DefaultGraph = class DefaultGraph extends model.Term {

    constructor() {
        super('');
    } // model.DefaultGraph#constructor

}; // model.DefaultGraph

/**
 * @class model.Quad
 * @extends {model.Term}
 */
model.Quad = class Quad extends model.Term {

    /**
     * @param {model.Term} subject
     * @param {model.Term} predicate
     * @param {model.Term} object
     * @param {model.Term} graph
     */
    constructor(subject, predicate, object, graph) {
        util.assert(subject instanceof model.Term, 'expected subject to be a Term');
        util.assert(predicate instanceof model.Term, 'expected predicate to be a Term');
        util.assert(object instanceof model.Term, 'expected object to be a Term');
        util.assert(graph instanceof model.Term, 'expected graph to be a Term');

        super('');

        /** @type {model.Term} */
        this.subject = subject;
        /** @type {model.Term} */
        this.predicate = predicate;
        /** @type {model.Term} */
        this.object = object;
        /** @type {model.Term} */
        this.graph = graph;

        util.lockProp(this, 'subject', 'predicate', 'object', 'graph');
    } // model.Quad#constructor

    /**
     * @param {model.Quad|model.Term} other
     * @returns {boolean}
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.subject.equals(other.subject)
            && this.predicate.equals(other.predicate)
            && this.object.equals(other.object)
            && this.graph.equals(other.graph);
    } // model.Quad#equals

    /**
     * @returns {string}
     */
    toString() {
        return this.subject.toString() + ' ' + this.predicate.toString() + ' ' + this.object.toString()
            + (this.graph instanceof model.DefaultGraph ? this.graph.toString() : '') + ' .';
    } // model.Quad#toString

}; // model.Quad
