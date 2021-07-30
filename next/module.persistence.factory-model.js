const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    FactoryModel = exports;

/**
 * @class FactoryModel.ContextIndex
 * @memberOf exports
 * @private
 */
FactoryModel.ContextIndex = class ContextIndex {

    #prefixMap = new Map();
    #iriList   = [];

    // IDEA Map/Set-like interface
    // add(prefix: string, iri: string): this
    // -> throw if prefix or iri is already in use
    // set(prefix: string, iri: string): this
    // -> throw if iri is already in use
    // get(prefix: string): string
    // has(prefix: string): boolean
    // delete(prefix: string): boolean
    // forEach(callbackFn: (iri: string, prefix: string, set: ContextIndex) => any, thisArg?: any): void
    // IDEA maybe differentiate methods for prefixes and iris
    // add(prefix: string, iri: string): this
    // hasPrefix(prefix: string): boolean
    // getPrefix(prefix: string): string
    // deletePrefix(prefix: string): boolean
    // hasIRI(iri: string): boolean
    // getIRI(iri: string): boolean
    // deleteIRI(iri: string): boolean
    // IDEA methods for handling prefixes and iris
    // prefixIRI(iri: string): string
    // -> absolute iri to prefixes iri
    // -> use the prefix with the longest matching iri-start
    // resolveIRI(iri: string): string
    // -> prefixed iri to absolute iri
    // -> do not un-prefix, if the ':' follows a '//' (e.g. http://...)
    // toJSON(): {[prefix: string]: string}
    // -> lexical order of the prefixes

    // TODO rework the following
    #prefixes   = [];
    #namespaces = [];

    add(prefix, namespace) {
        util.assert(util.isPrefixString(prefix), 'ContextIndex#add : expected prefix to be a string', TypeError);
        util.assert(util.isIRIString(namespace), 'ContextIndex#add : expected namespace to be a string', TypeError);
        let prefixIndex = -1, namespaceIndex = -1, indexLength = this.#prefixes.length;
        for (let index = 0, length = indexLength; index < length; index++) {
            util.assert(prefix !== this.#prefixes[index][0], 'prefix (' + prefix + ') already defined');
            util.assert(namespace !== this.#namespaces[index][0], 'namespace (' + namespace + ') already defined');
            if (prefixIndex < 0 && prefix > this.#prefixes[index][0]) prefixIndex = index;
            if (namespaceIndex < 0 && namespace.length < this.#prefixes[index][0]) namespaceIndex = index;
        }
        if (prefixIndex < 0) prefixIndex = indexLength;
        if (namespaceIndex < 0) namespaceIndex = indexLength;
        this.#prefixes.splice(prefixIndex, 0, [prefix, namespace]);
        this.#namespaces.splice(namespaceIndex, 0, [namespace, prefix]);
    } // FactoryModel.ContextIndex#add

    /**
     * @param {string} uri
     * @returns {string}
     */
    prefixIRI(uri) {
        util.assert(util.isString(uri), 'ContextIndex#prefixIRI : expected uri to be a string', TypeError);
        for (let [namespace, prefix] of this.#namespaces) {
            if (uri.startsWith(namespace)) {
                const rel = uri.substr(namespace.length);
                return prefix + ':' + rel;
            }
        }
        return uri;
    } // FactoryModel.ContextIndex#prefixIRI

    /**
     * @param {string} iri
     * @returns {string}
     */
    resolveIRI(iri) {
        util.assert(util.isString(iri), 'ContextIndex#resolveIRI : expected iri to be a string', TypeError);
        for (let [prefix, namespace] of this.#prefixes) {
            if (iri.startsWith(prefix + ':')) {
                const rel = iri.substr(prefix.length + 1);
                if (!rel.startsWith('//')) return namespace + iri.substr(prefix.length + 1);
            }

        }
        return iri;
    } // FactoryModel.ContextIndex#resolveIRI

    toJSON() {
        return Object.fromEntries(this.#prefixes);
    } // FactoryModel.ContextIndex#toJSON

}; // FactoryModel.ContextIndex

/**
 * @class FactoryModel.TermFactory
 * @see https://rdf.js.org/data-model-spec/#datafactory-interface
 * @memberOf exports
 * @public
 */
FactoryModel.TermFactory = class TermFactory {

    // TODO move toString and fromString to the factory, because Terms like NamedNode/Literal does not know their context

    /** @type {FactoryModel.ContextIndex} */
    #context        = new FactoryModel.ContextIndex();
    /** @type {DataModel.DefaultGraph} */
    #defaultGraph   = null;
    /** @type {DataModel.NamedNode} */
    #xsd_string     = null;
    /** @type {DataModel.NamedNode} */
    #rdf_langString = null;

    constructor(context) {
        if (context) {
            util.assert(util.isObject(context) && !util.isArray(context), 'TermFactory#constructor : expected context to be an object', TypeError);
            for (let [prefix, iri] of Object.entries(context)) {
                this.#context.add(prefix, iri);
            }
        }
        this.#defaultGraph   = this.defaultGraph();
        this.#xsd_string     = this.namedNode('http://www.w3.org/2001/XMLSchema#string');
        this.#rdf_langString = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    } // FactoryModel.TermFactory#constructor

    context() {
        return this.#context.toJSON();
    } // FactoryModel.TermFactory#context

    namedNode(value) {
        util.assert(util.isString(value), 'TermFactory#namedNode : expected value to be a string');
        return new DataModel.NamedNode(this.#context.prefixIRI(value));
    } // FactoryModel.TermFactory#namedNode

    blankNode(value) {
        util.assert(!value || util.isString(value), 'TermFactory#blankNode : expected value to be a string');
        return new DataModel.BlankNode(value || util.generateBlankId());
    } // FactoryModel.TermFactory#blankNode

    literal(value, languageOrDatatype) {
        util.assert(util.isString(value), 'TermFactory#literal : expected value to be a string');
        const
            language = util.isString(languageOrDatatype) && languageOrDatatype || '',
            datatype = language && this.#rdf_langString || languageOrDatatype || this.#xsd_string;
        return new DataModel.Literal(value, language, datatype);
    } // FactoryModel.TermFactory#literal

    variable(value) {
        util.assert(util.isString(value), 'TermFactory#variable : expected value to be a string');
        return new DataModel.Variable(value);
    } // FactoryModel.TermFactory#variable

    defaultGraph() {
        return this.#defaultGraph || new DataModel.DefaultGraph();
    } // FactoryModel.TermFactory#defaultGraph

    quad(subject, predicate, object, graph) {
        return new DataModel.Quad(subject, predicate, object, graph || this.#defaultGraph);
    } // FactoryModel.TermFactory#quad

    fromTerm(original) {
        // TODO
    } // FactoryModel.TermFactory#fromTerm

    fromQuad(original) {
        // TODO
    } // FactoryModel.TermFactory#fromQuad

    // TODO
    // termToId() {}
    // termFromId() {}

    fromString(termStr) {
        // IDEA
    } // FactoryModel.TermFactory#fromString

}; // FactoryModel.TermFactory
