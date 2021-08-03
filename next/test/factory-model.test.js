const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    DataModel        = require('../module.persistence.data-model.js'),
    FactoryModel     = require('../module.persistence.factory-model.js');

describe('FactoryModel', function () {

    const prefixes = Object.freeze({
        'rdf':           'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'rdfs':          'http://www.w3.org/2000/01/rdf-schema#',
        'owl':           'http://www.w3.org/2002/07/owl#',
        'dc':            'http://purl.org/dc/elements/1.1/',
        'dct':           'http://purl.org/dc/terms/',
        'xsd':           'http://www.w3.org/2001/XMLSchema#',
        'sh':            'http://www.w3.org/ns/shacl#',
        'foaf':          'http://xmlns.com/foaf/0.1/',
        'org':           'http://www.w3.org/ns/org#',
        'fno':           'https://w3id.org/function/ontology#',
        'time':          'http://www.w3.org/2006/time#',
        'vann':          'http://purl.org/vocab/vann/',
        'voaf':          'http://purl.org/vocommons/voaf#',
        'ex':            'http://example.org/',
        'ex-test':       'http://example.org/test/',
        'ex-hello':      'http://example.org/hello/',
        'ex-test-hello': 'http://example.org/test/hello/'
    });

    test('ContextIndex', function () {

        const context = new FactoryModel.ContextIndex();

        Object.entries(prefixes).forEach(([prefix, iri]) => context.addEntry(prefix, iri));

        expect(context.hasPrefix('rdf')).toBeTruthy();
        expect(context.hasIRI('http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toBeTruthy();
        expect(context.getIRI('rdf')).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        expect(context.getPrefix('http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toBe('rdf');

        expect(() => context.addEntry('rdf', 'http://example.org/')).toThrow();
        expect(() => context.addEntry('rdf-ex', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toThrow();

        expect(context.prefixIRI('http://example.org/test/hello/lorem-ipsum')).toBe('ex-test-hello:lorem-ipsum');
        expect(context.prefixIRI('http://example.org/test/lorem-ipsum')).toBe('ex-test:lorem-ipsum');
        expect(context.prefixIRI('http://example.org/hello/lorem-ipsum')).toBe('ex-hello:lorem-ipsum');
        expect(context.prefixIRI('http://example.org/lorem-ipsum')).toBe('ex:lorem-ipsum');
        expect(context.prefixIRI('http://example.com/lorem-ipsum')).toBe('http://example.com/lorem-ipsum');

        expect(context.resolveIRI('ex-test-hello:lorem-ipsum')).toBe('http://example.org/test/hello/lorem-ipsum');
        expect(context.resolveIRI('ex-test:lorem-ipsum')).toBe('http://example.org/test/lorem-ipsum');
        expect(context.resolveIRI('ex-hello:lorem-ipsum')).toBe('http://example.org/hello/lorem-ipsum');
        expect(context.resolveIRI('ex:lorem-ipsum')).toBe('http://example.org/lorem-ipsum');
        expect(context.resolveIRI('http://example.com/lorem-ipsum')).toBe('http://example.com/lorem-ipsum');

        expect(context.size).toBeGreaterThan(0);
        expect(Object.fromEntries(context.entries())).toMatchObject(prefixes);
        Object.entries(prefixes).forEach(([prefix, iri]) => context.deletePrefix(prefix));
        expect(context.size).toBe(0);

        expect(context.resolveIRI('ex:lorem-ipsum')).toBe('ex:lorem-ipsum');
        expect(context.prefixIRI('http://example.org/lorem-ipsum')).toBe('http://example.org/lorem-ipsum');
    });

    test('TermFactory', function () {

        const factory = new FactoryModel.TermFactory(prefixes);

        const rdfs_label = factory.namedNode('http://www.w3.org/2000/01/rdf-schema#label');
        expect(rdfs_label).toBeInstanceOf(DataModel.NamedNode);
        expect(rdfs_label.termType).toBe('NamedNode');
        expect(rdfs_label.value).toBe('rdfs:label');

        const blank = factory.blankNode();
        expect(blank).toBeInstanceOf(DataModel.BlankNode);
        expect(blank.termType).toBe('BlankNode');
        expect(blank.value).toMatch(/^\S+$/);

        const hello = factory.literal('Hello World!', 'en');
        expect(hello).toBeInstanceOf(DataModel.Literal);
        expect(hello.termType).toBe('Literal');
        expect(hello.value).toBe('Hello World!');
        expect(hello.language).toBe('en');
        expect(hello.datatype).toBeInstanceOf(DataModel.NamedNode);
        expect(hello.datatype.value).toBe('rdf:langString');

        const quad = factory.quad(blank, rdfs_label, hello);
        expect(quad).toBeInstanceOf(DataModel.Quad);
        expect(quad.termType).toBe('Quad');
        expect(quad.subject).toBe(blank);
        expect(quad.predicate).toBe(rdfs_label);
        expect(quad.object).toBe(hello);
        expect(quad.graph).toBeInstanceOf(DataModel.DefaultGraph);

        const quad_duplicate = factory.fromQuad(quad);
        expect(quad).not.toBe(quad_duplicate);
        expect(quad.subject).not.toBe(quad_duplicate.subject);
        expect(quad.subject.equals(quad_duplicate.subject)).toBeTruthy();
        expect(quad.predicate).not.toBe(quad_duplicate.predicate);
        expect(quad.predicate.equals(quad_duplicate.predicate)).toBeTruthy();
        expect(quad.object).not.toBe(quad_duplicate.object);
        expect(quad.object.equals(quad_duplicate.object)).toBeTruthy();

        expect(factory.fromString(rdfs_label.toString())).toMatchObject(rdfs_label);
        expect(factory.fromString(blank.toString())).toMatchObject(blank);
        expect(factory.fromString(hello.toString())).toMatchObject(hello);
        expect(factory.fromString(quad.toString())).toMatchObject(quad);

    });

});
