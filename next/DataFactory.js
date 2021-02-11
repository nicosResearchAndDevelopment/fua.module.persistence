const
    _ = require('./util.js'),
    TermFactory = require('./TermFactory.js');

class DataFactory extends TermFactory {

    isSubject(term) {
        return this.isNamedNode(term)
            || this.isBlankNode(term);
    } // TermFactory#isSubject

    isPredicate(term) {
        return this.isNamedNode(term);
    } // TermFactory#isPredicate

    isObject(term) {
        return this.isNamedNode(term)
            || this.isLiteral(term)
            || this.isBlankNode(term);
    } // TermFactory#isObject

    isGraph(term) {
        return this.isNamedNode(term)
            || this.isDefaultGraph(term);
    } // TermFactory#isGraph

} // DataFactory

module.exports = DataFactory;