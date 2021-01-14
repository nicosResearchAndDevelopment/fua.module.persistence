function _assert(value, errMsg = 'undefined error', errType = Error) {
	if (!value) {
		const err = new errType('module.persistence : DataModel : ' + errMsg);
		Error.captureStackTrace(err, _assert);
		throw err;
	}
} // _assert

function _lockProp(obj, ...keys) {
	const lock = { writable: false, configurable: false };
	for (let key of keys) {
		Object.defineProperty(obj, key, lock);
	}
} // _lockProp

const _is = {
	str: value => typeof value === 'string',
	uri: value => _is.string(value) && /^\w+:\S+$/.test(value),
	id: value => _is.string(value) && /^\S+$/.test(value),
	name: value => _is.string(value) && /^[a-z]\w*$/i.test(value),
	lang: value => _is.string(value) && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(value)
}; // _is

class Term {

	/**
	 * @param {string<*>} value
	 * @abstract
	 */
	constructor(value) {
		const termType = new.target.name;
		_assert(new.target !== Term, 'Term#constructor : Term is abstract');
		_assert(exports[termType] === new.target, 'Term#constructor : unknown class');
		_assert(_is.string(value), 'Term#constructor : invalid value', TypeError);

		/** @type {string} */
		this.termType = termType;
		/** @type {string} */
		this.value = value;

		_.lockProp(this, 'value', 'termType');
	} // Term#constructor

	/**
	 * @param {Term|*} other
	 * @returns {boolean}
	 */
	equals(other) {
		return other instanceof Term
			&& this.termType === other.termType
			&& this.value === other.value;
	} // Term#equals

} // Term

Term.name = 'Term';
_lockProp(Term, 'name');
exports.Term = Term;

class NamedNode extends Term {

	/**
	 * @param {string<RegExp<"^\\w+:\\S+$">>} uri
	 */
	constructor(uri) {
		_assert(_is.uri(uri), 'NamedNode#constructor : invalid uri', TypeError);
		super(uri);
	} // NamedNode#constructor

} // NamedNode

NamedNode.name = 'NamedNode';
_lockProp(NamedNode, 'name');
exports.NamedNode = NamedNode;

class BlankNode extends Term {

	/**
	 * @param {string<RegExp<"^\\S+$">>} id
	 */
	constructor(id) {
		_assert(_is.id(id), 'BlankNode#constructor : invalid id', TypeError);
		super(id);
	} // BlankNode#constructor

} // BlankNode

BlankNode.name = 'BlankNode';
_lockProp(BlankNode, 'name');
exports.BlankNode = BlankNode;

class Literal extends Term {

	/**
	 * @param {string} value
	 * @param {string<RegExp<"^[a-z]{2}(?:-[a-z]{2})?$", "i">>} [language]
	 * @param {NamedNode} datatype
	 */
	constructor(value, language, datatype) {
		if (language) {
			_assert(_is.lang(language), 'Literal#constructor : invalid language', TypeError);
			_assert(datatype instanceof NamedNode && datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
				'Literal#constructor : invalid datatype', TypeError);
		} else {
			_assert(datatype instanceof NamedNode, 'Literal#constructor : invalid datatype', TypeError);
			language = '';
		}

		super(value);

		/** @type {""|string<RegExp<"^[a-z]{2}(?:-[a-z]{2})?$", "i">>} */
		this.language = language;
		/** @type {NamedNode} */
		this.datatype = datatype;

		_lockProp(this, 'language', 'datatype');
	} // Literal#constructor

	/**
	 * @param {Literal|*} other
	 * @returns {boolean}
	 */
	equals(other) {
		return super.equals(other)
			&& this.language === other.language
			&& this.datatype.equals(other.datatype);
	} // Literal#equals

} // Literal

Literal.name = 'Literal';
_lockProp(Literal, 'name');
exports.Literal = Literal;

class Variable extends Term {

	/**
	 * @param {string<RegExp<"^[a-z]\\w*$", "i">>} name
	 */
	constructor(name) {
		_assert(_is.name(name), 'Variable#constructor : invalid name', TypeError);
		super(name);
	} // Variable#constructor

} // Variable

Variable.name = 'Variable';
_lockProp(Variable, 'name');
exports.Variable = Variable;

class DefaultGraph extends Term {

	constructor() {
		super('');
	} // DefaultGraph#constructor

} // DefaultGraph

DefaultGraph.name = 'DefaultGraph';
_lockProp(DefaultGraph, 'name');
exports.DefaultGraph = DefaultGraph;

class Quad extends Term {

	/**
	 * @param {Term} subject
	 * @param {Term} predicate
	 * @param {Term} object
	 * @param {Term} graph
	 */
	constructor(subject, predicate, object, graph) {
		_assert(subject instanceof Term, 'Quad#constructor : invalid subject', _.SyntaxError);
		_assert(predicate instanceof Term, 'Quad#constructor : invalid predicate', _.SyntaxError);
		_assert(object instanceof Term, 'Quad#constructor : invalid object', _.SyntaxError);
		_assert(graph instanceof Term, 'Quad#constructor : invalid graph', _.SyntaxError);

		super('');

		/** @type {Term} */
		this.subject = subject;
		/** @type {Term} */
		this.predicate = predicate;
		/** @type {Term} */
		this.object = object;
		/** @type {Term} */
		this.graph = graph;

		_lockProp(this, 'subject', 'predicate', 'object', 'graph');
	} // Quad#constructor

	/**
	 * @param {Quad|*} other
	 * @returns {boolean}
	 */
	equals(other) {
		return super.equals(other)
			&& this.subject.equals(other.subject)
			&& this.predicate.equals(other.predicate)
			&& this.object.equals(other.object)
			&& this.graph.equals(other.graph);
	} // Quad#equals

} // Quad

Quad.name = 'Quad';
_lockProp(Quad, 'name');
exports.Quad = Quad;

Object.freeze(exports);
