const
	{ throwInterfaceError } = require('./util.js'),
	{ EventEmitter } = require('events');


class DatasetCoreFactoryInterface extends EventEmitter {

	/**
	 * @interface
	 */
	constructor() {
		if (new.target === DatasetCoreFactoryInterface)
			throwInterfaceError();
		super();
	}

	/**
	 * @param {Iterable<Quad>} [quads]
	 * @returns {DatasetCore}
	 */
	dataset(quads) {
		throwInterfaceError();
	}

}

module.exports = DatasetCoreFactoryInterface;