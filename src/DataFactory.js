const
	{ Term, NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad } = require('./DataModel.js'),
	graph_defaultGraph = new DefaultGraph(),
	dt_string = new NamedNode('http://www.w3.org/2001/XMLSchema#string'),
	dt_langString = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');

//#region >> PRIVATE

function _assert(value, errMsg = 'undefined error', errType = Error) {
	if (!value) {
		const err = new errType('module.persistence : DataFactory : ' + errMsg);
		Error.captureStackTrace(err, _assert);
		throw err;
	}
} // _assert

function _isString(value) {
	return typeof value === 'string';
} // _isString

function _isObject(value) {
	return value && typeof value === 'object';
} // _isObject

// SCHEMA: [<(UriString)> | _:(IdString) | ?(NameString) | ["(string)" | '(string)' | """(string)""" | '''(string)'''] + [@(LangString) | ^^(UriString)]? | (UriString)] [Space | End ] [Dot + End]? [Other]
// => the order is important and matched the different types of terms separated with spaces
// => some values must be combined later, but this ensures that only one regex is required for all terms and every syntax
// => if [Dot + End]? got matched, it shows the ending of an n3 string and can be ignored
// => if [Other] got matched, it shows an invalid syntax
const _termStringMatcher = /(?:<(\S+)>|_:(\S+)|\?(\S+)|(?:"([^"\s]*)"|'([^'\s]*)'|"""([^.]*?)"""|'''([^.]*?)''')(?:(?:@(\S+))|(?:\^\^(\S+)))?|(\w\S*))(?=\s|$)(?:\s*\.\s*$)?|\S+/g;

// more specific ALTERNATIVE:
// const _termStringMatcher = /(?:<(\w+:\S+)>|_:(\S+)|\?([a-z]\w*)|(?:"([^"\s]*?)"|'([^'\s]*?)'|"""([^.]*?)"""|'''([^.]*?)''')(?:(?:@([a-z]{2}(?:-[a-z]{2})?))|(?:\^\^(\w+:\S+)))?|(\w+:\S+))(?=\s|$)(?:\s*\.\s*$)?|\S+/ig;

// the _termMatchExtractor arguments fit the ()-bracket-matchers of _termStringMatcher
function _termMatchExtractor(match, m_namedNode1, m_blankNode, m_variable, m_literal1, m_literal2, m_literal3, m_literal4, m_lang, m_dt, m_namedNode2) {
	let m_namedNode = m_namedNode1 || m_namedNode2;
	if (m_namedNode) return {
		termType: 'NamedNode',
		value: m_namedNode
	};
	if (m_blankNode) return {
		termType: 'BlankNode',
		value: m_blankNode
	};
	if (m_variable) return {
		termType: 'Variable',
		value: m_variable
	};
	let m_literal = m_literal1 || m_literal2 || m_literal3 || m_literal4;
	_assert(_isString(m_literal), 'fromString : invalid match : ' + match);
	return {
		termType: 'Literal',
		value: m_literal,
		language: m_lang ? m_lang : undefined,
		datatype: m_dt ? {
			termType: 'NamedNode',
			value: m_dt
		} : undefined
	};
} // _termMatchExtractor

//#endregion
//#region >> METHODS

/**
 * @param {UriString} uri
 * @returns {NamedNode}
 */
function namedNode(uri) {
	return new NamedNode(uri);
} // namedNode

/**
 * @param {IdString} id
 * @returns {BlankNode}
 */
function blankNode(id) {
	return new BlankNode(id);
} // blankNode

/**
 * @param {string} value
 * @param {LangString|NamedNode} [langOrDt=NamedNode<"http://www.w3.org/2001/XMLSchema#string">]
 * @returns {Literal}
 */
function literal(value, langOrDt = dt_string) {
	return _isString(langOrDt)
		? new Literal(value, langOrDt, dt_langString)
		: new Literal(value, '', langOrDt);
} // literal

/**
 * @param {NameString} name
 * @returns {Variable}
 */
function variable(name) {
	return new Variable(name);
} // variable

/**
 * @returns {DefaultGraph}
 */
function defaultGraph() {
	return graph_defaultGraph;
} // defaultGraph

/**
 * @param {Term} subject
 * @param {Term} predicate
 * @param {Term} object
 * @param {Term} [graph=DefaultGraph<>]
 * @returns {Quad}
 */
function quad(subject, predicate, object, graph = defaultGraph()) {
	return new Quad(subject, predicate, object, graph);
} // quad

/**
 * @param {*} original
 * @returns {Term}
 */
function fromTerm(original) {
	_assert(_isObject(original), 'fromTerm : invalid original', TypeError);
	_assert(_isString(original.termType), 'fromTerm : invalid termType', TypeError);
	switch (original.termType) {
		case 'NamedNode':
			return namedNode(original.value);
		case 'BlankNode':
			return blankNode(original.value);
		case 'Literal':
			return literal(original.value, original.language || (original.datatype ? fromTerm(original.datatype) : dt_string));
		case 'Variable':
			return variable(original.value);
		case 'DefaultGraph':
			return defaultGraph();
		case 'Quad':
			return fromQuad(original);
	}
	_assert(false, 'fromTerm : unknown termType ' + original.termType);
} // fromTerm

/**
 * @param {*} original
 * @returns {Quad}
 */
function fromQuad(original) {
	_assert(_isObject(original), 'fromQuad : invalid original', TypeError);
	_assert(!original.termType || original.termType === 'Quad', 'fromQuad : invalid termType', TypeError);
	return quad(
		fromTerm(original.subject),
		fromTerm(original.predicate),
		fromTerm(original.object),
		original.graph ? fromTerm(original.graph) : defaultGraph()
	);
} // fromQuad

/**
 * TODO test extensively and write toString methods
 * @param {string} termStr
 * @returns {Term}
 */
function fromString(termStr) {
	_assert(_isString(termStr), 'fromString : invalid termStr', TypeError);
	const resultParts = Array.from(termStr.matchAll(_termStringMatcher))
		.map(termMatch => _termMatchExtractor(...termMatch));

	_assert(resultParts.length > 0, 'fromString : no match');
	if (resultParts.length === 1) {
		return fromTerm(resultParts[0]);
	} else {
		_assert(resultParts.length === 3 || resultParts.length === 4, 'fromString : invalid match count : ' + resultParts.length);
		return fromQuad({
			subject: resultParts[0],
			predicate: resultParts[1],
			object: resultParts[2],
			graph: resultParts[3]
		});
	}
} // fromString

//#endregion

exports = module.exports = {
	namedNode, blankNode, literal, variable, defaultGraph, quad,
	fromTerm, fromQuad, fromString
}; // exports 