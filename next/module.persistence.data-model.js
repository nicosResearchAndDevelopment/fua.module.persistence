const
    util      = require('./module.persistence.util.js'),
    /** @namespace DataModel */
    DataModel = exports;

/**
 * @abstract
 * @class Term
 * @memberOf DataModel
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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'Term.fromString : expected termStr to be a string', TypeError);

        if (termStr.includes(' ')) return DataModel.Quad.fromString(termStr);
        if (termStr.startsWith('_:')) return DataModel.BlankNode.fromString(termStr);
        if (termStr.startsWith('?')) return DataModel.Variable.fromString(termStr);
        if (termStr.startsWith('"')) return DataModel.Literal.fromString(termStr);
        return DataModel.NamedNode(termStr);
    } // Term.fromString

}; // Term

/**
 * @class NamedNode
 * @memberOf DataModel
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
DataModel.NamedNode = class NamedNode extends DataModel.Term {

    /** @type {boolean} */
    #absoluteIRI = true;

    /**
     * @param {string} iri
     */
    constructor(iri) {
        util.assert(util.isIRIString(iri), 'NamedNode#constructor : expected iri to be an IRI', TypeError);
        const absoluteIRI = iri.substr(iri.indexOf(':'), 2) === '//';

        super(iri);

        this.#absoluteIRI = absoluteIRI;
    } // NamedNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return this.#absoluteIRI && '<' + this.value + '>' || this.value;
    } // NamedNode#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'NamedNode.fromString : expected termStr to be a string', TypeError);

        const iri = (termStr.startsWith('<') && termStr.endsWith('>')) ? termStr.substr(1, termStr.length - 2) : termStr;
        return DataModel.NamedNode(iri);
    } // NamedNode.fromString

}; // NamedNode

/**
 * @class BlankNode
 * @memberOf DataModel
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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'BlankNode.fromString : expected termStr to be a string', TypeError);

        const id = termStr.startsWith('_:') ? termStr.substr(2) : termStr;
        return new DataModel.BlankNode(id);
    } // BlankNode.fromString

}; // BlankNode

/**
 * @class Literal
 * @memberOf DataModel
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
DataModel.Literal = class Literal extends DataModel.Term {

    // /** @type {"\""|"'"|"\"\"\""|"'''"} */
    // #quoteMark = '"';
    /** @type {string} */
    #typeTag = '';

    /**
     * @param {string} value
     * @param {string} language
     * @param {DataModel.NamedNode} datatype
     */
    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'Literal#constructor : expected value to be a string', TypeError);
        // const quoteMark = !value.includes('\n') && (!value.includes('"') && '"' || !value.includes("'") && "'")
        //     || !value.includes('"""') && '"""' || !value.includes("'''") && "'''" || null;
        // util.assert(quoteMark, 'Literal#constructor : expected to be able to generate quotation marks for the value');
        util.assert(language === '' || util.isLanguageString(language), 'Literal#constructor : expected language to be a Language', TypeError);
        util.assert(datatype instanceof DataModel.NamedNode, 'Literal#constructor : expected datatype to be a NamedNode', TypeError);
        const typeTag = language && '@' + language || '^^' + datatype.toString();

        super(value);

        /** @type {string} */
        this.language = language;
        /** @type {DataModel.NamedNode} */
        this.datatype = datatype;

        util.lockProp(this, 'language', 'datatype');

        // this.#quoteMark = quoteMark;
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
        // return this.#quoteMark + this.value + this.#quoteMark + this.#typeTag;
        return '"' + encodeURIComponent(this.value) + '"' + this.#typeTag;
        // IDEA '"' + encodeURIComponent(this.value) + '"@' + this.language + '^^' + this.datatype.toString();
    } // Literal#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'Literal.fromString : expected termStr to be a string', TypeError);
        util.assert(termStr.startsWith('"'), 'Literal.fromString : expected termStr to start with "');
        const valueEnd = termStr.indexOf('"', 1);
        util.assert(valueEnd > 0, 'Literal.fromString : expected termStr to include a second "');
        const value = decodeURIComponent(termStr.substr(1, valueEnd - 1));
        // TODO
        return DataModel.Literal(value);
    } // Literal.fromString

}; // Literal

/**
 * @class Variable
 * @memberOf DataModel
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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'Variable.fromString : expected termStr to be a string', TypeError);

        const name = termStr.startsWith('?') ? termStr.substr(1) : termStr;
        return DataModel.Variable(name);
    } // Variable.fromString

}; // Variable

/**
 * @class DefaultGraph
 * @memberOf DataModel
 * @extends {DataModel.Term}
 * @see https://rdf.js.org/data-model-spec/#defaultgraph-interface
 */
DataModel.DefaultGraph = class DefaultGraph extends DataModel.Term {

    constructor() {
        super('');
    } // DefaultGraph#constructor

    static fromString(termStr) {
        util.assert(termStr === '', 'DefaultGraph.fromString : expected termStr to be an empty string', TypeError);

        return DataModel.DefaultGraph();
    } // DefaultGraph.fromString

}; // DefaultGraph

/**
 * @class Quad
 * @memberOf DataModel
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
        // TODO maybe differentiated Term validation
        util.assert(subject instanceof DataModel.Term, 'Quad#constructor : expected subject to be a Term', TypeError);
        util.assert(predicate instanceof DataModel.Term, 'Quad#constructor : expected predicate to be a Term', TypeError);
        util.assert(object instanceof DataModel.Term, 'Quad#constructor : expected object to be a Term', TypeError);
        util.assert(graph instanceof DataModel.Term, 'Quad#constructor : expected graph to be a Term', TypeError);

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
        return this.subject.toString() + ' ' + this.predicate.toString() + ' ' + this.object.toString()
            + (this.graph instanceof DataModel.DefaultGraph ? this.graph.toString() : '') + ' .';
    } // Quad#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'Quad.fromString : expected termStr to be a string', TypeError);
        const parts = termStr.split(' ');
        util.assert(parts.pop() === '.', 'Quad.fromString : expected termStr to end with .', TypeError);
        util.assert(parts.length === 3 || parts.length === 4, 'Quad.fromString : expected termStr to have 3 to 4 parts', TypeError);
        const quadArgs = parts.map(partStr => DataModel.Term.fromString(partStr));
        if (quadArgs.length === 3) parts.push(new DataModel.DefaultGraph());
        return new DataModel.Quad(...quadArgs);
    } // Quad.fromString

}; // Quad

module.exports = DataModel;
