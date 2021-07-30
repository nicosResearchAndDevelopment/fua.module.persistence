const
    util  = require('./module.persistence.util.js'),
    model = require('./module.persistence.model.js');

// TODO move toString and fromString to the factory, because Terms like NamedNode/Literal does not know their context

/**
 * @class TermFactory
 * @see https://rdf.js.org/data-model-spec/#datafactory-interface
 */
module.exports = class TermFactory {

    /** @type {Map<string, string>} */
    #context        = new Map(); // TODO rethink in terms of allowing sub-uris
    /** @type {model.DefaultGraph} */
    #defaultGraph   = null;
    /** @type {model.NamedNode} */
    #xsd_string     = null;
    /** @type {model.NamedNode} */
    #rdf_langString = null;

    constructor(context) {
        // TODO
    } // TermFactory#constructor

    context() {
        return Object.fromEntries(this.#context.entries());
    } // TermFactory#context

    namedNode(value) {
        util.assert(util.isString(value), 'TermFactory#namedNode : expected value to be a string');
        // TODO
    } // TermFactory#namedNode

    blankNode(value) {
        // TODO
    } // TermFactory#blankNode

    literal(value, languageOrDatatype) {
        // TODO
    } // TermFactory#literal

    variable(value) {
        // TODO
    } // TermFactory#variable

    defaultGraph(value) {
        // TODO
    } // TermFactory#defaultGraph

    quad(subject, predicate, object, graph) {
        // TODO
    } // TermFactory#quad

    fromTerm(original) {
        // TODO
    } // TermFactory#fromTerm

    fromQuad(original) {
        // TODO
    } // TermFactory#fromQuad

}; // TermFactory
