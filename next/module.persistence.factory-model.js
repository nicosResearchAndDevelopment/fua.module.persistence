const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    FactoryModel = exports;

// TODO move toString and fromString to the factory, because Terms like NamedNode/Literal does not know their context

/**
 * @class FactoryModel.PrefixContext
 * @memberOf exports
 * @private
 */
FactoryModel.PrefixContext = class PrefixContext {

    #prefixes   = [];
    #namespaces = [];

    constructor(context) {
        if (context) {
            util.assert(util.isObject(context) && !util.isArray(context), 'PrefixContext#constructor : expected context to be an object', TypeError);
            for (let [prefix, namespace] of Object.entries(context)) {
                this.add(prefix, namespace);
            }
        }
    } // FactoryModel.PrefixContext#constructor

    add(prefix, namespace) {
        util.assert(util.isPrefixString(prefix), 'PrefixContext#add : expected prefix to be a string', TypeError);
        util.assert(util.isIRIString(namespace), 'PrefixContext#add : expected namespace to be a string', TypeError);
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
    } // FactoryModel.PrefixContext#add

    /**
     * @param {string} uri
     * @returns {string}
     */
    prefix(uri) {
        util.assert(util.isString(uri), 'PrefixContext#prefix : expected uri to be a string', TypeError);
        for (let [namespace, prefix] of this.#namespaces) {
            if (uri.startsWith(namespace))
                return prefix + ':' + uri.substr(namespace.length);
        }
        return uri;
    } // FactoryModel.PrefixContext#prefix

    /**
     * @param {string} iri
     * @returns {string}
     */
    resolve(iri) {
        util.assert(util.isString(iri), 'PrefixContext#resolve : expected iri to be a string', TypeError);
        for (let [prefix, namespace] of this.#prefixes) {
            if (iri.startsWith(prefix + ':') && iri.substr(prefix.length + 1, 2) !== '//')
                return namespace + iri.substr(prefix.length + 1);
        }
        return iri;
    } // FactoryModel.PrefixContext#resolve

    toJSON() {
        return Object.fromEntries(this.#prefixes);
    } // FactoryModel.PrefixContext#toJSON

}; // FactoryModel.PrefixContext

/**
 * @class FactoryModel.TermFactory
 * @see https://rdf.js.org/data-model-spec/#datafactory-interface
 * @memberOf exports
 * @public
 */
FactoryModel.TermFactory = class TermFactory {

    /** @type {FactoryModel.PrefixContext} */
    #context        = null;
    /** @type {DataModel.DefaultGraph} */
    #defaultGraph   = null;
    /** @type {DataModel.NamedNode} */
    #xsd_string     = null;
    /** @type {DataModel.NamedNode} */
    #rdf_langString = null;

    constructor(context) {
        this.#context        = new FactoryModel.PrefixContext(context);
        this.#defaultGraph   = new DataModel.DefaultGraph();
        this.#xsd_string     = this.namedNode('http://www.w3.org/2001/XMLSchema#string');
        this.#rdf_langString = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    } // FactoryModel.TermFactory#constructor

    context() {
        return this.#context.toJSON();
    } // FactoryModel.TermFactory#context

    namedNode(value) {
        util.assert(util.isString(value), 'TermFactory#namedNode : expected value to be a string');
        return new DataModel.NamedNode(this.#context.prefix(value));
    } // FactoryModel.TermFactory#namedNode

    blankNode(value) {
        if (!value) value = util.generateBlankId();
        else util.assert(util.isString(value), 'TermFactory#blankNode : expected value to be a string');
        return new DataModel.BlankNode(value);
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
        return this.#defaultGraph;
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
