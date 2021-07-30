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
FactoryModel.PrefixContext = class PrefixContext extends Map {

    // TODO rethink in terms of allowing sub-uris

}; // FactoryModel.PrefixContext

/**
 * @class FactoryModel.TermFactory
 * @see https://rdf.js.org/data-model-spec/#datafactory-interface
 * @memberOf exports
 * @public
 */
FactoryModel.TermFactory = class TermFactory {

    /** @type {FactoryModel.PrefixContext} */
    #context        = new FactoryModel.PrefixContext();
    /** @type {DataModel.DefaultGraph} */
    #defaultGraph   = null;
    /** @type {DataModel.NamedNode} */
    #xsd_string     = null;
    /** @type {DataModel.NamedNode} */
    #rdf_langString = null;

    constructor(context) {
        // TODO
        this.#defaultGraph = new DataModel.DefaultGraph();
    } // FactoryModel.TermFactory#constructor

    context() {
        // TODO
        return Object.fromEntries(this.#context.entries());
    } // FactoryModel.TermFactory#context

    namedNode(value) {
        util.assert(util.isString(value), 'TermFactory#namedNode : expected value to be a string');
        // TODO
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
        // TODO
        return this.#defaultGraph || (this.#defaultGraph = new DataModel.DefaultGraph());
    } // FactoryModel.TermFactory#defaultGraph

    quad(subject, predicate, object, graph) {
        // TODO
    } // FactoryModel.TermFactory#quad

    fromTerm(original) {
        // TODO
    } // FactoryModel.TermFactory#fromTerm

    fromQuad(original) {
        // TODO
    } // FactoryModel.TermFactory#fromQuad

    fromString(termStr) {
        // IDEA
        // TODO
    } // FactoryModel.TermFactory#fromString

}; // FactoryModel.TermFactory
