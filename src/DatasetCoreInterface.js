const
	{ throwInterfaceError } = require('./util.js'),
	{ EventEmitter } = require('events');


class DatasetCoreInterface extends EventEmitter {

	/**
	 * @interface
	 */
	constructor() {
		if (new.target === DatasetCoreInterface)
			throwInterfaceError();
		super();
	}

	/**
	 * @type {number}
	 */
	get size() {
		throwInterfaceError();
	}

	/**
	 * @param {Quad} quad
	 * @returns {Dataset}
	 */
	add(quad) {
		throwInterfaceError();
	}

	/**
	 * @param {Quad} quad
	 * @returns {Dataset}
	 */
	delete(quad) {
		throwInterfaceError();
	}

	/**
	 * @param {Quad} quad
	 * @returns {Dataset}
	 */
	has(quad) {
		throwInterfaceError();
	}

	/**
	 * @param {Term} [subject]
	 * @param {Term} [predicate]
	 * @param {Term} [object]
	 * @param {Term} [graph]
	 * @returns {Dataset}
	 */
	match(subject, predicate, object, graph) {
		throwInterfaceError();
	}

	/**
	 * @returns {Iterator<Quad>}
	 */
	* [Symbol.iterator]() {
		throwInterfaceError();
	}

}

module.exports = DatasetCoreInterface;