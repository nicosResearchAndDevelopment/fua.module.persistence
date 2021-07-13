const
    model = exports,
    util  = require('./module.persistence.util.js');

model.Term = class Term {

    constructor(value) {
        util.assert(new.target !== model.Term, 'Term is an abstract class');
        this.termType = new.target.name;
        this.value    = value;
        util.lockProp(this, 'termType', 'value');
    }

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

    constructor(iri) {
        util.assert(util.isIRIString(iri), 'expected iri to be an IRI');
        super(iri);
    }

    toString() {
        // TODO consider prefixes vs. http(s)://... (or [prefix]://... with the double slash in general)
        return '<' + this.value + '>';
    }

}; // model.NamedNode

model.BlankNode = class BlankNode extends model.Term {

    constructor(id) {
        util.assert(util.isIdentifierString(id), 'expected id to be an Identifier');
        super(id);
    }

    toString() {
        return '_:' + this.value;
    }

}; // model.BlankNode

model.Literal = class Literal extends model.Term {

    constructor(value, language, datatype) {
        util.assert(util.isString(value), 'expected value to be a string');
        util.assert(util.isLanguageString(language), 'expected language to be a Language');
        util.assert(datatype instanceof model.NamedNode, 'expected datatype to be a NamedNode');
        super(value);
        this.language = language;
        this.datatype = datatype;
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
        // TODO right quotation marks
        return '"' + this.value + '"' + (this.language ? '@' + this.language : '^^' + this.datatype.toString());
    }

}; // model.Literal

model.Variable = class Variable extends model.Term {

    constructor(name) {
        util.assert(util.isVariableString(name), 'expected name to be a Variable');
        super(name);
    }

    toString() {
        return '?' + this.value;
    }

}; // model.Variable

model.DefaultGraph = class DefaultGraph extends model.Term {

    constructor() {
        super('');
    }

}; // model.DefaultGraph

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

}; // model.Quad

// TODO ???
// model.Collection = class Collection extends model.Term { }; // model.Collection