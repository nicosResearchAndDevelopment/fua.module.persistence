const
    _                 = require('./module.persistence.util.js'),
    uuid              = require('@nrd/fua.core.uuid'),
    {StringValidator} = require('@nrd/fua.core.util'),
    _isPrefix         = new StringValidator(/^[a-z][a-z0-9+\-._]*$/i),
    _isIRI            = new StringValidator(/^[a-z][a-z0-9+\-.]*:\S*$/i),
    _isIdentifier     = new StringValidator(/^\S+$/),
    _isVariable       = new StringValidator(/^[a-z]\w*$/i),
    _isLanguage       = new StringValidator(/^[a-z]{2}(?:-[a-z]{2})?$/i),
    _reservedPrefixes = Object.freeze([
        'http', 'https', '_'
    ]);

//#region >> DataModel

/** @alias fua.module.persistence.Term */
class Term {

    constructor(termType, value) {
        this.termType = termType;
        this.value    = value;
        _.lockProp(this, 'value', 'termType');
    } // Term#constructor

    equals(other) {
        return other instanceof Term
            && this.termType === other.termType
            && this.value === other.value;
    } // Term#equals

    toString() {
        return this.termType + '<'
            + this.value + '>';
    } // Term#toString

} // Term

/** @alias fua.module.persistence.NamedNode */
class NamedNode extends Term {

    constructor(iri) {
        super('NamedNode', iri);
    } // NamedNode#constructor

} // NamedNode

/** @alias fua.module.persistence.BlankNode */
class BlankNode extends Term {

    constructor(id) {
        super('BlankNode', id);
    } // BlankNode#constructor

} // BlankNode

/** @alias fua.module.persistence.Literal */
class Literal extends Term {

    constructor(value, language, datatype) {
        super('Literal', value);
        this.language = language;
        this.datatype = datatype;
        _.lockProp(this, 'language', 'datatype');
    } // Literal#constructor

    equals(other) {
        return super.equals(other)
            && this.language === other.language
            && this.datatype.equals(other.datatype);
    } // Literal#equals

    toString() {
        return this.termType + '<'
            + this.value + ','
            + this.language + ','
            + this.datatype + '>';
    } // Literal#toString

} // Literal

/** @alias fua.module.persistence.Variable */
class Variable extends Term {

    constructor(name) {
        super('Variable', name);
    } // Variable#constructor

} // Variable

/** @alias fua.module.persistence.DefaultGraph */
class DefaultGraph extends Term {

    constructor() {
        super('DefaultGraph', '');
    } // DefaultGraph#constructor

} // DefaultGraph

/** @alias fua.module.persistence.Quad */
class Quad extends Term {

    constructor(subject, predicate, object, graph) {
        super('Quad', '');
        this.subject   = subject;
        this.predicate = predicate;
        this.object    = object;
        this.graph     = graph;
        _.lockProp(this, 'subject', 'predicate', 'object', 'graph');
    } // Quad#constructor

    equals(other) {
        return super.equals(other)
            && this.subject.equals(other.subject)
            && this.predicate.equals(other.predicate)
            && this.object.equals(other.object)
            && this.graph.equals(other.graph);
    } // Quad#equals

    toString() {
        return this.termType + '<'
            + this.subject + ','
            + this.predicate + ','
            + this.object + ','
            + this.graph + '>';
    } // Quad#toString

} // Quad

//#endregion << DataModel

/** @alias fua.module.persistence.TermFactory */
class TermFactory {

    #default = Object.create(null);
    #context = new Map();

    /**
     * @param {Object<string, string>} [context={}]
     */
    constructor(context = {}) {
        _.assert(_.isObject(context), 'TermFactory#constructor : invalid context', TypeError);

        for (let [prefix, iri] of Object.entries(context)) {
            _.assert(_isPrefix(prefix), 'TermFactory#constructor : invalid prefix', TypeError);
            _.assert(!_reservedPrefixes.includes(prefix), 'TermFactory#constructor : reserved prefix ' + prefix);
            _.assert(_isIRI(iri), 'TermFactory#constructor : invalid iri', TypeError);
            //for (let [_prefix, _iri] of this.#context) {
            //    _.assert(prefix !== _prefix, 'TermFactory#constructor : duplicate prefix ' + prefix);
            //    _.assert(!iri.startsWith(_iri), 'TermFactory#constructor : related sub-iri ' + iri);
            //    _.assert(!_iri.startsWith(iri), 'TermFactory#constructor : related sub-iri ' + _iri);
            //}
            this.#context.set(prefix, iri);
        }

        this.#default.defaultGraph   = new DefaultGraph();
        this.#default.xsd_string     = this.namedNode('http://www.w3.org/2001/XMLSchema#string');
        this.#default.rdf_langString = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
        Object.freeze(this.#default);
    } // TermFactory#constructor

    /**
     * @returns {Object<string, string>}
     */
    context() {
        return Object.fromEntries(this.#context);
    } // TermFactory#context

    /**
     * @param {Term} term
     * @returns {boolean}
     */
    isTerm(term) {
        return term instanceof Term;
    } // TermFactory#isTerm

    /**
     * @param {string} iri
     * @returns {NamedNode}
     */
    namedNode(iri) {
        _.assert(_isIRI(iri), 'TermFactory#namedNode : invalid iri', TypeError);
        let prefix = '', prefix_iri = '';
        for (let [_prefix, _iri] of this.#context) {
            if (iri.startsWith(_iri)) {
                if (iri.length > _iri.length && prefix_iri.length < _iri.length) {
                    prefix     = _prefix;
                    prefix_iri = _iri;
                    //iri = _prefix + ':' + iri.substr(_iri.length);
                    //break;
                }
            }
        }
        if (prefix_iri) iri = prefix + ':' + iri.substr(prefix_iri.length);
        return new NamedNode(iri);
    } // TermFactory#namedNode

    /**
     * @param {Term|NamedNode} term
     * @returns {boolean}
     */
    isNamedNode(term) {
        return term instanceof NamedNode;
    } // TermFactory#isNamedNode

    /**
     * @param {string} id
     * @returns {BlankNode}
     */
    blankNode(id) {
        if (!id) id = uuid.v1();
        _.assert(_isIdentifier(id), 'TermFactory#blankNode : invalid id', TypeError);
        return new BlankNode(id);
    } // TermFactory#blankNode

    /**
     * @param {Term|BlankNode} term
     * @returns {boolean}
     */
    isBlankNode(term) {
        return term instanceof BlankNode;
    } // TermFactory#isBlankNode

    /**
     * @param {string} value
     * @param {string|NamedNode} langOrDt
     * @returns {Literal}
     */
    literal(value, langOrDt) {
        _.assert(_.isString(value), 'TermFactory#literal : invalid value', TypeError);
        if (!langOrDt) {
            return new Literal(value, '', this.#default.xsd_string);
        } else if (_.isString(langOrDt)) {
            _.assert(_isLanguage(langOrDt), 'TermFactory#literal : invalid language', TypeError);
            return new Literal(value, langOrDt, this.#default.rdf_langString);
        } else {
            _.assert(this.isNamedNode(langOrDt), 'TermFactory#literal : invalid datatype', TypeError);
            return new Literal(value, '', langOrDt);
        }
    } // TermFactory#literal

    /**
     * @param {Term|Literal} term
     * @returns {boolean}
     */
    isLiteral(term) {
        return term instanceof Literal;
    } // TermFactory#isLiteral

    /**
     * @param {string} name
     * @returns {Variable}
     */
    variable(name) {
        _.assert(_isVariable(name), 'TermFactory#variable : invalid name', TypeError);
        return new Variable(name);
    } // TermFactory#variable

    /**
     * @param {Term|Variable} term
     * @returns {boolean}
     */
    isVariable(term) {
        return term instanceof Variable;
    } // TermFactory#isVariable

    /**
     * @returns {DefaultGraph}
     */
    defaultGraph() {
        return this.#default.defaultGraph;
    } // TermFactory#defaultGraph

    /**
     * @param {Term|DefaultGraph} term
     * @returns {boolean}
     */
    isDefaultGraph(term) {
        return term instanceof DefaultGraph;
    } // TermFactory#isDefaultGraph

    /**
     * @param {Term} subject
     * @param {Term} predicate
     * @param {Term} object
     * @returns {Quad}
     */
    tripel(subject, predicate, object) {
        return this.quad(subject, predicate, object, this.defaultGraph());
    } // TermFactory#tripel

    /**
     * @param {Term|Quad} term
     * @returns {boolean}
     */
    isTripel(term) {
        return this.isQuad(term)
            && this.isDefaultGraph(term.graph);
    } // TermFactory#isTripel

    /**
     * @param {Term} subject
     * @param {Term} predicate
     * @param {Term} object
     * @param {Term} [graph]
     * @returns {Quad}
     */
    quad(subject, predicate, object, graph) {
        _.assert(this.validSubject(subject), 'TermFactory#quad : invalid subject', TypeError);
        _.assert(this.validPredicate(predicate), 'TermFactory#quad : invalid predicate', TypeError);
        _.assert(this.validObject(object), 'TermFactory#quad : invalid object', TypeError);
        _.assert(!graph || this.validGraph(graph), 'TermFactory#quad : invalid graph', TypeError);
        return new Quad(subject, predicate, object, graph || this.defaultGraph());
    } // TermFactory#quad

    /**
     * @param {Term|Quad} term
     * @returns {boolean}
     */
    isQuad(term) {
        return term instanceof Quad;
    } // TermFactory#isQuad

    /**
     * @param {Term} term
     * @returns {boolean}
     */
    validSubject(term) {
        return this.isNamedNode(term)
            || this.isBlankNode(term)
            || this.isVariable(term);
    } // TermFactory#validSubject

    /**
     * @param {Term} term
     * @returns {boolean}
     */
    validPredicate(term) {
        return this.isNamedNode(term)
            || this.isVariable(term);
    } // TermFactory#validPredicate

    /**
     * @param {Term} term
     * @returns {boolean}
     */
    validObject(term) {
        return this.isNamedNode(term)
            || this.isLiteral(term)
            || this.isBlankNode(term)
            || this.isVariable(term);
    } // TermFactory#validObject

    /**
     * @param {Term} term
     * @returns {boolean}
     */
    validGraph(term) {
        return this.isNamedNode(term)
            || this.isDefaultGraph(term)
            || this.isVariable(term);
    } // TermFactory#validGraph

    /**
     * @param {Quad} term
     * @returns {boolean}
     */
    validQuad(term) {
        return this.isQuad(term)
            && this.validSubject(term.subject)
            && this.validPredicate(term.predicate)
            && this.validObject(term.object)
            && this.validGraph(term.graph);
    } // TermFactory#validQuad

    /**
     * Converts an object representation of a term into a Term object.
     * Especially TermFactory#fromTerm(JSON.parse(JSON.stringify(term))).equals(term) = true
     * @param {{termType: string, value?: string, language?: string, datatype?: Object}} original
     * @returns {Term}
     */
    fromTerm(original) {
        _.assert(_.isObject(original), 'TermFactory#fromTerm : invalid original', TypeError);
        // REM: better for performance, but only viable with factory check:
        // if (this.isTerm(original)) return original;
        _.assert(_.isString(original.termType), 'TermFactory#fromTerm : invalid termType', TypeError);
        switch (original.termType) {
            case 'NamedNode':
                return this.namedNode(original.value);
            case 'BlankNode':
                return this.blankNode(original.value);
            case 'Literal':
                return this.literal(original.value,
                    original.language || (original.datatype ? this.fromTerm(original.datatype) : undefined));
            case 'Variable':
                return this.variable(original.value);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                return this.fromQuad(original);
            default:
                _.assert(false, 'TermFactory#fromTerm : unknown termType ' + original.termType);
        }
    } // TermFactory#fromTerm

    /**
     * Converts an object representation of a quad into a Quad object.
     * Especially TermFactory#fromQuad(JSON.parse(JSON.stringify(quad))).equals(quad) = true
     * @param {{termType?: "Quad", subject: Object, predicate: Object, object: Object, graph?: Object}} original
     * @returns {Quad}
     */
    fromQuad(original) {
        _.assert(_.isObject(original), 'TermFactory#fromQuad : invalid original', TypeError);
        // REM: better for performance, but only viable with factory check:
        // if (this.isQuad(original)) return original;
        _.assert(!original.termType || original.termType === 'Quad', 'TermFactory#fromQuad : invalid termType', TypeError);
        return this.quad(
            this.fromTerm(original.subject),
            this.fromTerm(original.predicate),
            this.fromTerm(original.object),
            original.graph ? this.fromTerm(original.graph) : undefined
        );
    } // TermFactory#fromQuad

    /**
     * Converts a string representation of a term into a Term object.
     * Especially TermFactory#fromString(term.toString()).equals(term) = true
     * @param {string} termStr
     * @returns {Term}
     */
    fromString(termStr) {
        _.assert(_.isString(termStr), 'TermFactory#fromString : invalid termStr', TypeError);
        const termRes = termStr.match(/^(\w+)<(.*)>$/s);
        _.assert(termRes, 'TermFactory#fromString : invalid syntax');
        const termType = termRes[1], termVal = termRes[2];
        switch (termType) {
            case 'NamedNode':
                return this.namedNode(termVal);
            case 'BlankNode':
                return this.blankNode(termVal);
            case 'Literal':
                const litRes = termVal.match(/^(.*),([a-z-]*),NamedNode<(\S+)>$/si);
                _.assert(litRes, 'TermFactory#fromString : invalid literal syntax');
                const litVal = litRes[1], langOrDt = litRes[2] || this.namedNode(litRes[3]);
                return this.literal(litVal, langOrDt);
            case 'Variable':
                return this.variable(termVal);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                const quadRes = termVal.match(/^(\w+<.*>),(\w+<.*>),(\w+<.*>),(\w+<.*>)$/s);
                _.assert(quadRes, 'TermFactory#fromString : invalid quad syntax');
                return this.quad(
                    this.fromString(quadRes[1]),
                    this.fromString(quadRes[2]),
                    this.fromString(quadRes[3]),
                    this.fromString(quadRes[4])
                );
            default:
                _.assert(false, 'TermFactory#fromString : unknown termType ' + termType);
        }
    } // TermFactory#fromString

    /**
     * Converts a regular Term into a Term without prefixed values.
     * @param {Term} term
     * @returns {Term}
     */
    resolveTerm(term) {
        _.assert(this.isTerm(term), 'TermFactory#resolveTerm : invalid term', TypeError);
        switch (term.termType) {
            case 'NamedNode':
                for (let prefix of this.#context.keys()) {
                    if (term.value.startsWith(prefix + ':')) {
                        return new NamedNode(this.#context.get(prefix) + term.value.substr(prefix.length + 1));
                    }
                }
                return term;

            case 'Literal':
                return new Literal(term.value, term.language, this.resolveTerm(term.datatype));

            case 'BlankNode':
            case 'Variable':
            case 'DefaultGraph':
                return term;

            case 'Quad':
                return this.resolveQuad(term);
        } // switch
    } // TermFactory#resolveTerm

    /**
     * Converts a regular Quad into a Quad without prefixed values.
     * @param {Quad} quad
     * @returns {Quad}
     */
    resolveQuad(quad) {
        _.assert(this.isQuad(quad), 'TermFactory#resolveQuad : invalid quad', TypeError);
        return new Quad(
            this.resolveTerm(quad.subject),
            this.resolveTerm(quad.predicate),
            this.resolveTerm(quad.object),
            this.resolveTerm(quad.graph)
        );
    } // TermFactory#resolveQuad

    termToId(term) {
        _.assert(this.isTerm(term), 'TermFactory#termToId : invalid term', TypeError);
        switch (term.termType) {
            case 'NamedNode':
                return term.value;
            case 'BlankNode':
                return '_:' + term.value;
            case 'Variable':
                return '?' + term.value;
            case 'Literal':
                return '"' + encodeURIComponent(term.value) + '"' + (
                    this.#default.rdf_langString.equals(term.datatype) && '@' + term.language
                    || !this.#default.xsd_string.equals(term.datatype) && '^^' + term.datatype.value
                    || ''
                );
            default:
                _.assert(false, 'TermFactory#termToId : ' + term.termType + ' ist not supported');
        }
    } // TermFactory#termToId

    termFromId(id) {
        _.assert(_.isString(id), 'TermFactory#termFromId : invalid id', TypeError);
        switch (id.charAt(0)) {
            case '_':
                _.assert(id.charAt(1) === ':', 'TermFactory#termFromId : invalid blank id', TypeError);
                return this.blankNode(id.substr(2));
            case '?':
                return this.variable(id.substr(1));
            case '"':
                const quoteIndex = id.indexOf('"', 1);
                _.assert(quoteIndex > 0, 'TermFactory#termFromId : invalid literal id', TypeError);
                return this.literal(
                    decodeURIComponent(id.substring(1, quoteIndex)),
                    id.charAt(quoteIndex + 1) === '@' ? id.substr(quoteIndex + 2)
                        : id.substr(quoteIndex + 1, 2) === '^^' ? this.namedNode(id.substr(quoteIndex + 3))
                            : null
                );
            default:
                return this.namedNode(id);
        }
    } // TermFactory#termFromId

} // TermFactory

module.exports = TermFactory;
