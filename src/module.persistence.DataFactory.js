const
    _           = require('./module.persistence.util.js'),
    TermFactory = require('./module.persistence.TermFactory.js');

/** @alias fua.module.persistence.DataFactory */
class DataFactory extends TermFactory {

    variable(name) {
        _.assert(false, 'DataFactory#variable : not supported');
        return null;
    } // DataFactory#variable

    validSubject(term) {
        return this.isNamedNode(term)
            || this.isBlankNode(term);
    } // DataFactory#validSubject

    validPredicate(term) {
        return this.isNamedNode(term);
    } // DataFactory#validPredicate

    validObject(term) {
        return this.isNamedNode(term)
            || this.isLiteral(term)
            || this.isBlankNode(term);
    } // DataFactory#validObject

    validGraph(term) {
        return this.isNamedNode(term)
            || this.isDefaultGraph(term);
    } // DataFactory#validGraph

} // DataFactory

module.exports = DataFactory;
