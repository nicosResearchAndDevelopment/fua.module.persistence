const
	{ throwInterfaceError } = require('./util.js'),
	{ EventEmitter } = require('events');

class DataFactoryInterface extends EventEmitter {

	/**
	 * @interface
	 */
	constructor() {
		if (new.target === DataFactoryInterface)
			throwInterfaceError();
		super();
	}

	/**
	 * @param {string} uri
	 * @returns {NamedNode}
	 */
	namedNode(uri) {
		throwInterfaceError();
	}

	/**
	 * @param {string} id
	 * @returns {BlankNode}
	 */
	blankNode(id) {
		throwInterfaceError();
	}

	/**
	 * @param {string} value
	 * @param {string} [languageOrDatatype]
	 * @returns {Literal}
	 */
	literal(value, languageOrDatatype) {
		throwInterfaceError();
	}

	/**
	 * @param {string} name
	 * @returns {Variable}
	 */
	variable(name) {
		throwInterfaceError();
	}

	/**
	 * @returns {DefaultGraph}
	 */
	defaultGraph() {
		throwInterfaceError();
	}

	/**
	 * @param {Term} subject
	 * @param {Term} predicate
	 * @param {Term} object
	 * @param {Term} [graph]
	 * @returns {Quad}
	 */
	quad(subject, predicate, object, graph) {
		throwInterfaceError();
	}

	/**
	 * @param {Term} original
	 * @returns {Term}
	 */
	fromTerm(original) {
		throwInterfaceError();
	}

	/**
	 * @param {Quad} original
	 * @returns {Quad}
	 */
	fromQuad(original) {
		throwInterfaceError();
	}

}

module.exports = DataFactoryInterface;