class InterfaceError extends Error {
	constructor() {
		super('undefined interface');
	}
}

exports.throwInterfaceError = function() {
	const err = new InterfaceError();
	Error.captureStackTrace(err, exports.throwInterfaceError);
	throw err;
};