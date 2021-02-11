const
    { describe, test } = require('mocha'),
    expect = require('expect'),
    TermFactory = require('./TermFactory.js'),
    factory = new TermFactory();

describe('TermFactory', function() {

    test('TermFactory#stringToTerm', function() {
        const
            ex = factory.namedNode('http://example.org/'),
            ex_hello = factory.namedNode('ex:hello'),
            ex_test_label = factory.literal('Hello \n World!,en,NamedNode<test>', 'en'),
            ex_valid = factory.namedNode('ex:valid'),
            ex_valid_true = factory.literal('true', factory.namedNode('xsd:boolean')),
            rdf_type = factory.namedNode('rdf:type'),
            rdfs_Resource = factory.namedNode('rdfs:Resource'),
            rdfs_label = factory.namedNode('rdfs:label'),
            q1 = factory.tripel(ex_hello, rdf_type, rdfs_Resource),
            q2 = factory.tripel(ex_hello, rdfs_label, ex_test_label),
            q3 = factory.quad(ex_hello, ex_valid, ex_valid_true, ex);

        expect(ex_hello.equals(factory.stringToTerm(ex_hello.toString()))).toBeTruthy();
        expect(q1.equals(factory.stringToTerm(q1.toString()))).toBeTruthy();
        expect(ex_test_label.equals(factory.stringToTerm(ex_test_label.toString()))).toBeTruthy();
        expect(q2.equals(factory.stringToTerm(q2.toString()))).toBeTruthy();
        expect(q3.equals(factory.stringToTerm(q3.toString()))).toBeTruthy();
    });

});