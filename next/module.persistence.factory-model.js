const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    /** @namespace FactoryModel */
    FactoryModel = exports;

/**
 * @class FactoryModel.ContextIndex
 */
FactoryModel.ContextIndex = class ContextIndex {

    /** @type {{[key: string]: number}} prefix -> entryIndex */
    #prefixes = Object.create(null);
    /** @type {{[key: string]: number}} iri -> entryIndex */
    #iris     = Object.create(null);
    /** @type {Array<[string, string]>} entryIndex -> [prefix, iri] */
    #entries  = [];

    /**
     * @type {number}
     */
    get size() {
        return this.#entries.length;
    } // ContextIndex#size

    /**
     * @returns {Iterator<[string, string]>}
     */
    * entries() {
        for (let index = 0; index < this.#entries.length; index++) {
            const entry = this.#entries[index];
            yield [entry[0], entry[1]];
        }
    } // ContextIndex#entries

    /**
     * @param {string} prefix
     * @param {string} iri
     * @returns {FactoryModel.ContextIndex}
     */
    addEntry(prefix, iri) {
        util.assert(util.isPrefixString(prefix), 'ContextIndex#addEntry : expected prefix to be a prefix string', TypeError);
        util.assert(util.isIRIString(iri), 'ContextIndex#addEntry : expected iri to be an iri string', TypeError);
        util.assert(this.#prefixes[prefix] ?? -1 < 0, 'ContextIndex#addEntry : expected prefix to be unique');
        util.assert(this.#iris[iri] ?? -1 < 0, 'ContextIndex#addEntry : expected iri to be unique');
        let entryIndex = this.#entries.findIndex(entry => iri.length > entry[1].length || iri.length === entry[1].length && prefix < entry[0]);
        if (entryIndex < 0) entryIndex = this.#entries.length;
        for (let index = entryIndex; index < this.#entries.length; index++) {
            const entry = this.#entries[index];
            this.#prefixes[entry[0]]++;
            this.#iris[entry[1]]++;
        }
        this.#prefixes[prefix] = entryIndex;
        this.#iris[iri]        = entryIndex;
        this.#entries.splice(entryIndex, 0, [prefix, iri]);
        return this;
    } // ContextIndex#addEntry

    /**
     * @param {string} prefix
     * @returns {boolean}
     */
    hasPrefix(prefix) {
        if (!util.isString(prefix)) return false;
        const entryIndex = this.#prefixes[prefix] ?? -1;
        return entryIndex >= 0;
    } // ContextIndex#hasPrefix

    /**
     * @param {string} iri
     * @returns {boolean}
     */
    hasIRI(iri) {
        if (!util.isString(iri)) return false;
        const entryIndex = this.#iris[iri] ?? -1;
        return entryIndex >= 0;
    } // ContextIndex#hasIRI

    /**
     * @param {string} prefix
     * @returns {string|null}
     */
    getIRI(prefix) {
        if (!util.isString(prefix)) return null;
        const entryIndex = this.#prefixes[prefix] ?? -1;
        return entryIndex >= 0 && this.#entries[entryIndex][1] || null;
    } // ContextIndex#getIRI

    /**
     * @param {string} iri
     * @returns {string|null}
     */
    getPrefix(iri) {
        if (!util.isString(iri)) return null;
        const entryIndex = this.#iris[iri] ?? -1;
        return entryIndex >= 0 && this.#entries[entryIndex][0] || null;
    } // ContextIndex#getPrefix

    /**
     * @param {string} prefix
     * @returns {boolean}
     */
    deletePrefix(prefix) {
        if (!util.isString(prefix)) return false;
        const entryIndex = this.#prefixes[prefix] ?? -1;
        if (entryIndex < 0) return false;
        for (let index = entryIndex + 1; index < this.#entries.length; index++) {
            const entry = this.#entries[index];
            this.#prefixes[entry[0]]--;
            this.#iris[entry[1]]--;
        }
        const [entry] = this.#entries.splice(entryIndex, 1);
        delete this.#prefixes[entry[0]];
        delete this.#iris[entry[1]];
        return true;
    } // ContextIndex#deletePrefix

    /**
     * @param {string} iri
     * @returns {boolean}
     */
    deleteIRI(iri) {
        if (!util.isString(iri)) return false;
        const entryIndex = this.#iris[iri] ?? -1;
        if (entryIndex < 0) return false;
        for (let index = entryIndex + 1; index < this.#entries.length; index++) {
            const entry = this.#entries[index];
            this.#prefixes[entry[0]]--;
            this.#iris[entry[1]]--;
        }
        const [entry] = this.#entries.splice(entryIndex, 1);
        delete this.#prefixes[entry[0]];
        delete this.#iris[entry[1]];
        return true;
    } // ContextIndex#deleteIRI

    /**
     * @param {string} iri
     * @returns {string}
     */
    prefixIRI(iri) {
        util.assert(util.isString(iri), 'ContextIndex#prefixIRI : expected iri to be a string', TypeError);
        for (let entry of this.#entries) {
            if (entry[1].length < iri.length && iri.startsWith(entry[1]))
                return entry[0] + ':' + iri.substr(entry[1].length);
        }
        return iri;
    } // ContextIndex#prefixIRI

    /**
     * @param {string} iri
     * @returns {string}
     */
    resolveIRI(iri) {
        util.assert(util.isString(iri), 'ContextIndex#resolveIRI : expected iri to be a string', TypeError);
        const colonIndex = iri.indexOf(':');
        if (colonIndex < 0 || iri.substr(colonIndex + 1, 2) === '//') return iri;
        const baseIRI = this.getIRI(iri.substring(0, colonIndex));
        return baseIRI && baseIRI + iri.substr(colonIndex + 1) || iri;
    } // ContextIndex#resolveIRI

}; // ContextIndex

/**
 * @class FactoryModel.TermFactory
 * @see https://rdf.js.org/data-model-spec/#datafactory-interface
 */
FactoryModel.TermFactory = class TermFactory {

    /** @type {FactoryModel.ContextIndex} */
    #context        = new FactoryModel.ContextIndex();
    /** @type {DataModel.DefaultGraph} */
    #defaultGraph   = null;
    /** @type {DataModel.NamedNode} */
    #xsd_string     = null;
    /** @type {DataModel.NamedNode} */
    #rdf_langString = null;

    /**
     * @param {{[prefix: string]: string}} [context]
     */
    constructor(context) {
        if (context) {
            util.assert(util.isObject(context), 'TermFactory#constructor : expected context to be an object', TypeError);
            for (let [prefix, iri] of Object.entries(context)) {
                this.#context.addEntry(prefix, iri);
            }
        }
        this.#defaultGraph   = this.defaultGraph();
        this.#xsd_string     = this.namedNode('http://www.w3.org/2001/XMLSchema#string');
        this.#rdf_langString = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    } // TermFactory#constructor

    /**
     * @returns {{[prefix: string]: string}}
     */
    context() {
        return Object.fromEntries(this.#context.entries());
    } // TermFactory#context

    /**
     * @param {string} value
     * @returns {DataModel.NamedNode}
     */
    namedNode(value) {
        util.assert(util.isString(value), 'TermFactory#namedNode : expected value to be a string', TypeError);
        return new DataModel.NamedNode(this.#context.prefixIRI(value));
    } // TermFactory#namedNode

    /**
     * @param {string} value
     * @returns {function(suffix: string): DataModel.NamedNode}
     */
    namespace(value) {
        util.assert(util.isString(value), 'TermFactory#namespace : expected value to be a string', TypeError);
        return (suffix) => {
            util.assert(util.isString(suffix), 'TermFactory#namespace : expected suffix to be a string', TypeError);
            return this.namedNode(value + suffix);
        };
    } // TermFactory#namespace

    /**
     * @param {string} [value]
     * @returns {DataModel.BlankNode}
     */
    blankNode(value) {
        util.assert(!value || util.isString(value), 'TermFactory#blankNode : expected value to be a string', TypeError);
        return new DataModel.BlankNode(value || util.generateBlankId());
    } // TermFactory#blankNode

    /**
     * @param {string} value
     * @param {string|DataModel.NamedNode} [languageOrDatatype]
     * @returns {DataModel.Literal}
     */
    literal(value, languageOrDatatype) {
        util.assert(util.isString(value), 'TermFactory#literal : expected value to be a string', TypeError);
        const
            language = util.isString(languageOrDatatype) && languageOrDatatype || '',
            datatype = language && this.#rdf_langString || languageOrDatatype || this.#xsd_string;
        return new DataModel.Literal(value, language, datatype);
    } // TermFactory#literal

    /**
     * @param {string} value
     * @returns {DataModel.Variable}
     */
    variable(value) {
        util.assert(util.isString(value), 'TermFactory#variable : expected value to be a string', TypeError);
        return new DataModel.Variable(value);
    } // TermFactory#variable

    /**
     * @returns {DataModel.DefaultGraph}
     */
    defaultGraph() {
        return this.#defaultGraph || new DataModel.DefaultGraph();
    } // TermFactory#defaultGraph

    /**
     * @param {DataModel.Term} subject
     * @param {DataModel.Term} predicate
     * @param {DataModel.Term} object
     * @param {DataModel.Term} [graph]
     * @returns {DataModel.Quad}
     */
    quad(subject, predicate, object, graph) {
        return new DataModel.Quad(subject, predicate, object, graph || this.defaultGraph());
    } // TermFactory#quad

    /**
     * @param {DataModel.Term} subject
     * @param {DataModel.Term} predicate
     * @param {DataModel.Term} object
     * @returns {DataModel.Quad}
     */
    triple(subject, predicate, object) {
        return this.quad(subject, predicate, object);
    } // TermFactory#triple

    /**
     * @param {{termType: string, value: string, language?: string, datatype?: object}} original
     * @returns {DataModel.Term}
     */
    fromTerm(original) {
        util.assert(util.isObject(original), 'TermFactory#fromTerm : expected original to be an object', TypeError);
        switch (original.termType) {
            case 'NamedNode':
                return this.namedNode(original.value);
            case 'BlankNode':
                return this.blankNode(original.value);
            case 'Literal':
                return this.literal(original.value, original.language || this.fromTerm(original.datatype));
            case 'Variable':
                return this.variable(value);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                return this.fromQuad(original);
            default:
                util.assert(false, 'TermFactory#fromTerm : expected original to have a known termType');
        }
    } // TermFactory#fromTerm

    /**
     * @param {{subject: object, predicate: object, object: object, graph?: object}} original
     * @returns {DataModel.Quad}
     */
    fromQuad(original) {
        util.assert(util.isObject(original), 'TermFactory#fromQuad : expected original to be an object', TypeError);
        return this.quad(
            this.fromTerm(original.subject),
            this.fromTerm(original.predicate),
            this.fromTerm(original.object),
            original.graph && this.fromTerm(original.graph) || null
        );
    } // TermFactory#fromQuad

    /**
     * @param {string} termStr
     * @returns {DataModel.Term}
     */
    fromString(termStr) {
        util.assert(util.isString(termStr), 'TermFactory#fromString : expected termStr to be a string', TypeError);
        switch (termStr.charAt(0)) {
            case '<':
                util.assert(termStr.endsWith('>'), 'TermFactory#fromString : expected termStr to end with > if it starts with <', TypeError);
                return this.namedNode(termStr.substr(1, termStr.length - 2));
            case '_':
                util.assert(termStr.charAt(1) === ':', 'TermFactory#fromString : expected termStr to continue with : if it starts with _', TypeError);
                return this.blankNode(termStr.substr(2));
            case '?':
                return this.variable(termStr.substr(1));
            case '"':
                const quoteIndex = termStr.indexOf('"', 1);
                util.assert(quoteIndex > 0, 'TermFactory#fromString : expected termStr to include a second " if it starts with "', TypeError);
                return this.literal(
                    util.decodeLiteralValue(termStr.substring(1, quoteIndex)),
                    termStr.charAt(quoteIndex + 1) === '@' ? termStr.substr(quoteIndex + 2)
                        : termStr.substr(quoteIndex + 1, 2) === '^^' ? this.fromString(termStr.substr(quoteIndex + 3))
                            : null
                );
            case '{':
                util.assert(termStr.endsWith('}'), 'TermFactory#fromString : expected termStr to end with } if it starts with {', TypeError);
                const quadArgs = termStr.substr(1, termStr.length - 2).split(' ').map(argStr => this.fromString(argStr));
                return this.quad(...quadArgs);
            default:
                return this.namedNode(termStr);
        }
    } // TermFactory#fromString

}; // TermFactory

/**
 * @class FactoryModel.DataFactory
 * @extends {FactoryModel.TermFactory}
 */
FactoryModel.DataFactory = class DataFactory extends FactoryModel.TermFactory {

    variable(value) {
        util.assert(false, 'DataFactory#variable : expected no variable from the data factory');
        return super.variable(value);
    } // DataFactory#variable

}; // DataFactory

module.exports = FactoryModel;
