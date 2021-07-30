const
    model = exports,
    util  = require('./module.persistence.util.js');

/**
 * @class model.Term
 * @see https://rdf.js.org/data-model-spec/#term-interface
 */
model.Term = class Term {

    /**
     * @param {string} value
     */
    constructor(value) {
        util.assert(new.target !== model.Term, 'model.Term#constructor : Term is an abstract class');
        util.assert(util.isString(value), 'model.Term#constructor : expected value to be a string', TypeError);

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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.Term.fromString : expected termStr to be a string', TypeError);

        if (termStr.includes(' ')) return model.Quad.fromString(termStr);
        if (termStr.startsWith('_:')) return model.BlankNode.fromString(termStr);
        if (termStr.startsWith('?')) return model.Variable.fromString(termStr);
        if (termStr.startsWith('"')) return model.Literal.fromString(termStr);
        return model.NamedNode(termStr);
    } // model.Term.fromString

}; // model.Term

/**
 * @class model.NamedNode
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
model.NamedNode = class NamedNode extends model.Term {

    /** @type {boolean} */
    #absoluteIRI = true;

    /**
     * @param {string} iri
     */
    constructor(iri) {
        util.assert(util.isIRIString(iri), 'model.NamedNode#constructor : expected iri to be an IRI', TypeError);
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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.NamedNode.fromString : expected termStr to be a string', TypeError);

        const iri = (termStr.startsWith('<') && termStr.endsWith('>')) ? termStr.substr(1, termStr.length - 2) : termStr;
        return model.NamedNode(iri);
    } // model.NamedNode.fromString

}; // model.NamedNode

/**
 * @class model.BlankNode
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#blanknode-interface
 */
model.BlankNode = class BlankNode extends model.Term {

    /**
     * @param {string} id
     */
    constructor(id) {
        util.assert(util.isIdentifierString(id), 'model.BlankNode#constructor : expected id to be an Identifier', TypeError);

        super(id);
    } // model.BlankNode#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '_:' + this.value;
    } // model.BlankNode#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.BlankNode.fromString : expected termStr to be a string', TypeError);

        const id = termStr.startsWith('_:') ? termStr.substr(2) : termStr;
        return new model.BlankNode(id);
    } // model.BlankNode.fromString

}; // model.BlankNode

/**
 * @class model.Literal
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
model.Literal = class Literal extends model.Term {

    // /** @type {"\""|"'"|"\"\"\""|"'''"} */
    // #quoteMark = '"';
    /** @type {string} */
    #typeTag = '';

    /**
     * @param {string} value
     * @param {string} language
     * @param {model.NamedNode} datatype
     */
    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'model.Literal#constructor : expected value to be a string', TypeError);
        // const quoteMark = !value.includes('\n') && (!value.includes('"') && '"' || !value.includes("'") && "'")
        //     || !value.includes('"""') && '"""' || !value.includes("'''") && "'''" || null;
        // util.assert(quoteMark, 'model.Literal#constructor : expected to be able to generate quotation marks for the value');
        util.assert(language === '' || util.isLanguageString(language), 'model.Literal#constructor : expected language to be a Language', TypeError);
        util.assert(datatype instanceof model.NamedNode, 'model.Literal#constructor : expected datatype to be a NamedNode', TypeError);
        const typeTag = language && '@' + language || '^^' + datatype.toString();

        super(value);

        /** @type {string} */
        this.language = language;
        /** @type {model.NamedNode} */
        this.datatype = datatype;

        util.lockProp(this, 'language', 'datatype');

        // this.#quoteMark = quoteMark;
        this.#typeTag = typeTag;
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
        // return this.#quoteMark + this.value + this.#quoteMark + this.#typeTag;
        return '"' + encodeURIComponent(this.value) + '"' + this.#typeTag;
        // IDEA '"' + encodeURIComponent(this.value) + '"@' + this.language + '^^' + this.datatype.toString();
    } // model.Literal#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.Literal.fromString : expected termStr to be a string', TypeError);
        util.assert(termStr.startsWith('"'), 'model.Literal.fromString : expected termStr to start with "');
        const valueEnd = termStr.indexOf('"', 1);
        util.assert(valueEnd > 0, 'model.Literal.fromString : expected termStr to include a second "');
        const value = decodeURIComponent(termStr.substr(1, valueEnd - 1));
        // TODO
        return model.Literal(value);
    } // model.Literal.fromString

}; // model.Literal

/**
 * @class model.Variable
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#variable-interface
 */
model.Variable = class Variable extends model.Term {

    /**
     * @param {string} name
     */
    constructor(name) {
        util.assert(util.isVariableString(name), 'model.Variable#constructor : expected name to be a Variable', TypeError);

        super(name);
    } // model.Variable#constructor

    /**
     * @returns {string}
     */
    toString() {
        return '?' + this.value;
    } // model.Variable#toString

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.Variable.fromString : expected termStr to be a string', TypeError);

        const name = termStr.startsWith('?') ? termStr.substr(1) : termStr;
        return model.Variable(name);
    } // model.Variable.fromString

}; // model.Variable

/**
 * @class model.DefaultGraph
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#defaultgraph-interface
 */
model.DefaultGraph = class DefaultGraph extends model.Term {

    constructor() {
        super('');
    } // model.DefaultGraph#constructor

    static fromString(termStr) {
        util.assert(termStr === '', 'model.DefaultGraph.fromString : expected termStr to be an empty string', TypeError);

        return model.DefaultGraph();
    } // model.DefaultGraph.fromString

}; // model.DefaultGraph

/**
 * @class model.Quad
 * @extends {model.Term}
 * @see https://rdf.js.org/data-model-spec/#quad-interface
 */
model.Quad = class Quad extends model.Term {

    /**
     * @param {model.Term} subject
     * @param {model.Term} predicate
     * @param {model.Term} object
     * @param {model.Term} graph
     */
    constructor(subject, predicate, object, graph) {
        // TODO maybe differentiated Term validation
        util.assert(subject instanceof model.Term, 'model.Quad#constructor : expected subject to be a Term', TypeError);
        util.assert(predicate instanceof model.Term, 'model.Quad#constructor : expected predicate to be a Term', TypeError);
        util.assert(object instanceof model.Term, 'model.Quad#constructor : expected object to be a Term', TypeError);
        util.assert(graph instanceof model.Term, 'model.Quad#constructor : expected graph to be a Term', TypeError);

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

    static fromString(termStr) {
        util.assert(util.isString(termStr), 'model.Quad.fromString : expected termStr to be a string', TypeError);
        const parts = termStr.split(' ');
        util.assert(parts.pop() === '.', 'model.Quad.fromString : expected termStr to end with .', TypeError);
        util.assert(parts.length === 3 || parts.length === 4, 'model.Quad.fromString : expected termStr to have 3 to 4 parts', TypeError);
        const quadArgs = parts.map(partStr => model.Term.fromString(partStr));
        if (quadArgs.length === 3) parts.push(new model.DefaultGraph());
        return new model.Quad(...quadArgs);
    } // model.Quad.fromString

}; // model.Quad
