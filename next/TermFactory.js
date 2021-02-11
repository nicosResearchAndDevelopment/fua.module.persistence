const
    _ = require('./util.js'),
    _isPrefix = _.strValidator(/^[a-z][a-z0-9+\-.]*$/i),
    _isIRI = _.strValidator(/^[a-z][a-z0-9+\-.]*:\S+$/i),
    _isIdentifier = _.strValidator(/^\S+$/),
    _isVariable = _.strValidator(/^[a-z]\w*$/i),
    _isLanguage = _.strValidator(/^[a-z]{2}(?:-[a-z]{2})?$/i);

//#region >> DataModel

class Term {

    constructor(termType, value) {
        this.termType = termType;
        this.value = value;
        _.lockProp(this, 'value', 'termType');
    } // Term#constructor

    equals(other) {
        return other instanceof Term
            && this.termType === other.termType
            && this.value === other.value;
    } // Term#equals

    toString() {
        return `${this.termType}<${this.value}>`;
    } // Term#toString

} // Term

class NamedNode extends Term {

    constructor(iri) {
        super('NamedNode', iri);
    } // NamedNode#constructor

} // NamedNode

class BlankNode extends Term {

    constructor(id) {
        super('BlankNode', id);
    } // BlankNode#constructor

} // BlankNode

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
        return `${this.termType}<${this.value},${this.language},${this.datatype}>`;
    } // Literal#toString

} // Literal

class Variable extends Term {

    constructor(name) {
        super('Variable', name);
    } // Variable#constructor

} // Variable

class DefaultGraph extends Term {

    constructor() {
        super('DefaultGraph', '');
    } // DefaultGraph#constructor

} // DefaultGraph

class Quad extends Term {

    constructor(subject, predicate, object, graph) {
        super('Quad', '');
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
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
        return `${this.termType}<${this.subject},${this.predicate},${this.object},${this.graph}>`;
    } // Quad#toString

} // Quad

//#endregion << DataModel

class TermFactory {

    #default = Object.create(null);
    #context = new Map();

    constructor(context = {}) {
        _.assert(_.isObject(context), 'TermFactory#constructor : invalid context', TypeError);

        for (let [prefix, iri] of Object.entries(context)) {
            _.assert(_isPrefix(prefix), 'TermFactory#constructor : invalid prefix', TypeError);
            _.assert(_isIRI(iri), 'TermFactory#constructor : invalid iri', TypeError);
            for (let [_prefix, _iri] of this.#context) {
                _.assert(prefix !== _prefix, 'TermFactory#constructor : duplicate prefix ' + prefix);
                _.assert(!iri.startsWith(_iri), 'TermFactory#constructor : related sub-iri ' + iri);
                _.assert(!_iri.startsWith(iri), 'TermFactory#constructor : related sub-iri ' + _iri);
            }
            this.#context.set(prefix, iri);
        }

        this.#default.defaultGraph = new DefaultGraph();
        this.#default.xsd_string = this.namedNode('http://www.w3.org/2001/XMLSchema#string');
        this.#default.rdf_langString = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
        Object.freeze(this.#default);
    } // TermFactory#context

    context() {
        return Object.fromEntries(this.#context);
    } // TermFactory#context

    isTerm(term) {
        return term instanceof Term;
    } // TermFactory#isTerm

    namedNode(iri) {
        _.assert(_isIRI(iri), 'TermFactory#namedNode : invalid iri', TypeError);
        for (let [_prefix, _iri] of this.#context) {
            if (iri.startsWith(_iri)) {
                if (iri.length > _iri.length)
                    iri = `${_prefix}:${iri.substr(_iri.length)}`;
                break;
            }
        }
        return new NamedNode(iri);
    } // TermFactory#namedNode

    isNamedNode(term) {
        return term instanceof NamedNode;
    } // TermFactory#isNamedNode

    blankNode(id) {
        _.assert(_isIdentifier(id), 'TermFactory#blankNode : invalid id', TypeError);
        return new BlankNode(id);
    } // TermFactory#blankNode

    isBlankNode(term) {
        return term instanceof BlankNode;
    } // TermFactory#isBlankNode

    literal(value, langOrDt) {
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

    isLiteral(term) {
        return term instanceof Literal;
    } // TermFactory#isLiteral

    variable(name) {
        _.assert(_isVariable(name), 'Variable#constructor : invalid name', TypeError);
        return new Variable(name);
    } // TermFactory#variable

    isVariable(term) {
        return term instanceof Variable;
    } // TermFactory#isVariable

    defaultGraph() {
        return this.#default.defaultGraph;
    } // TermFactory#defaultGraph

    isDefaultGraph(term) {
        return term instanceof DefaultGraph;
    } // TermFactory#isDefaultGraph

    isSubject(term) {
        return this.isNamedNode(term)
            || this.isBlankNode(term)
            || this.isVariable(term);
    } // TermFactory#isSubject

    isPredicate(term) {
        return this.isNamedNode(term)
            || this.isVariable(term);
    } // TermFactory#isPredicate

    isObject(term) {
        return this.isNamedNode(term)
            || this.isLiteral(term)
            || this.isBlankNode(term)
            || this.isVariable(term);
    } // TermFactory#isObject

    isGraph(term) {
        return this.isNamedNode(term)
            || this.isDefaultGraph(term)
            || this.isVariable(term);
    } // TermFactory#isGraph

    quad(subject, predicate, object, graph) {
        _.assert(this.isSubject(subject), 'TermFactory#quad : invalid subject', TypeError);
        _.assert(this.isPredicate(predicate), 'TermFactory#quad : invalid predicate', TypeError);
        _.assert(this.isObject(object), 'TermFactory#quad : invalid object', TypeError);
        _.assert(!graph || this.isGraph(graph), 'TermFactory#quad : invalid graph', TypeError);
        return new Quad(subject, predicate, object, graph || this.defaultGraph());
    } // TermFactory#quad

    isQuad(term) {
        return term instanceof Quad;
    } // TermFactory#isQuad

    validQuad(term) {
        return this.isQuad(term)
            && this.isSubject(term.subject)
            && this.isPredicate(term.predicate)
            && this.isObject(term.object)
            && this.isGraph(term.graph);
    } // TermFactory#validQuad

    fromTerm(original) {
        _.assert(_.isObject(original), 'TermFactory#fromTerm : invalid original', TypeError);
        if (this.isTerm(original)) return original;
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
        }
        _.assert(false, 'TermFactory#fromTerm : unknown termType ' + original.termType);
    } // TermFactory#fromTerm

    fromQuad(original) {
        _.assert(_.isObject(original), 'TermFactory#fromQuad : invalid original', TypeError);
        if (this.isQuad(original)) return original;
        _.assert(!original.termType || original.termType === 'Quad', 'TermFactory#fromQuad : invalid termType', TypeError);
        return this.quad(
            this.fromTerm(original.subject),
            this.fromTerm(original.predicate),
            this.fromTerm(original.object),
            original.graph ? this.fromTerm(original.graph) : undefined
        );
    } // TermFactory#fromQuad

} // TermFactory

module.exports = TermFactory;