const
    /** @type {exports} */
    model = exports,
    util  = require('./module.persistence.util.js');

model.Term = class Term {

    /**
     * @param {string} value
     */
    constructor(value) {
        util.assert(new.target !== model.Term, 'Term is an abstract class');
        /** @type {string} */
        this.termType = new.target.name;
        this.value = value;
        util.lockProp(this, 'termType', 'value');
    }

    /**
     * @param {model.Term} other
     */
    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value;
    }

    toString() {
        return '';
    }

}; // model.Term

model.NamedNode = class NamedNode extends model.Term {

    #absoluteIRI = true;

    constructor(iri) {
        util.assert(util.isIRIString(iri), 'expected iri to be an IRI');
        const absoluteIRI = value.substr(value.indexOf(':'), 2) === '//';
        super(iri);
        this.#absoluteIRI = absoluteIRI;
    }

    toString() {
        return this.#absoluteIRI && '<' + this.value + '>' || this.value;
    }

}; // model.NamedNode

/** @memberOf exports */
model.BlankNode = class BlankNode extends model.Term {

    constructor(id) {
        util.assert(util.isIdentifierString(id), 'expected id to be an Identifier');
        super(id);
    }

    toString() {
        return '_:' + this.value;
    }

}; // model.BlankNode

/** @memberOf exports */
model.Literal = class Literal extends model.Term {

    #quoteMark = '"';
    #typeTag   = '';

    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'expected value to be a string');
        const quoteMark = !value.includes('\n') && (!value.includes('"') && '"' || !value.includes("'") && "'")
            || !value.includes('"""') && '"""' || !value.includes("'''") && "'''" || null;
        util.assert(quoteMark, 'expected to be able to generate quotation marks for the value');
        util.assert(language === '' || util.isLanguageString(language), 'expected language to be a Language');
        util.assert(datatype instanceof model.NamedNode, 'expected datatype to be a NamedNode');
        const typeTag = language && '@' + language || '^^' + datatype.toString();
        super(value);
        this.language   = language;
        this.datatype   = datatype;
        this.#quoteMark = quoteMark;
        this.#typeTag   = typeTag;
        util.lockProp(this, 'language', 'datatype');
    }

    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.value === other.value
            && this.language === other.language
            && this.datatype.equals(other.datatype);
    }

    toString() {
        return this.#quoteMark + this.value + this.#quoteMark + this.#typeTag;
    }

}; // model.Literal

/** @memberOf exports */
model.Variable = class Variable extends model.Term {

    constructor(name) {
        util.assert(util.isVariableString(name), 'expected name to be a Variable');
        super(name);
    }

    toString() {
        return '?' + this.value;
    }

}; // model.Variable

/** @memberOf exports */
model.DefaultGraph = class DefaultGraph extends model.Term {

    constructor() {
        super('');
    }

}; // model.DefaultGraph

/** @memberOf exports */
model.Quad = class Quad extends model.Term {

    constructor(subject, predicate, object, graph) {
        util.assert(subject instanceof model.Term, 'expected subject to be a Term');
        util.assert(predicate instanceof model.Term, 'expected predicate to be a Term');
        util.assert(object instanceof model.Term, 'expected object to be a Term');
        util.assert(graph instanceof model.Term, 'expected graph to be a Term');
        super('');
        this.subject   = subject;
        this.predicate = predicate;
        this.object    = object;
        this.graph     = graph;
        util.lockProp(this, 'subject', 'predicate', 'object', 'graph');
    }

    equals(other) {
        return this === other || other
            && this.termType === other.termType
            && this.subject.equals(other.subject)
            && this.predicate.equals(other.predicate)
            && this.object.equals(other.object)
            && this.graph.equals(other.graph);
    }

    toString() {
        return this.subject.toString() + ' ' + this.predicate.toString() + ' ' + this.object.toString()
            + (this.graph instanceof model.DefaultGraph ? this.graph.toString() : '') + ' .';
    }

}; // model.Quad
