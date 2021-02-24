const
    { describe, test } = require('mocha'),
    expect = require('expect'),
    persistence = require('../src/module.persistence.js');

describe('DataFactory Interface', function() {

    describe('Term', function() {

        test('should have a "isTerm" and a "fromTerm" method', async function() {
            expect(typeof persistence.isTerm).toBe('function');
            expect(typeof persistence.fromTerm).toBe('function');
        });

        test('should build any Term from a Term-like structure', async function() {
            expect(persistence.fromTerm({ termType: 'NamedNode', value: 'ex:test' }))
                .toMatchObject({ termType: 'NamedNode', value: 'ex:test' });
            expect(persistence.fromTerm({ termType: 'Literal', value: 'Hello World', language: 'en' }))
                .toMatchObject({ termType: 'Literal', value: 'Hello World', language: 'en' });
            expect(persistence.fromTerm({ termType: 'DefaultGraph' }))
                .toMatchObject({ termType: 'DefaultGraph', value: '' });
        });

        test('should detect any build Term', async function() {
            expect(persistence.isTerm(persistence.namedNode('ex:test'))).toBeTruthy();
            expect(persistence.isTerm(persistence.blankNode('123'))).toBeTruthy();
            expect(persistence.isTerm(persistence.literal('hello', 'en'))).toBeTruthy();
            expect(persistence.isTerm()).toBeFalsy();
            expect(persistence.isTerm({ termType: 'Variable', value: 'test' })).toBeFalsy();
        });

    }); // describe: Term

    describe('NamedNode', function() {

        test('should have a "isNamedNode" and a "namedNode" method', async function() {
            expect(typeof persistence.isNamedNode).toBe('function');
            expect(typeof persistence.namedNode).toBe('function');
        });

        test('should build a NamedNode with an IRI', async function() {
            expect(persistence.namedNode('http://example.org/test')).toMatchObject({
                termType: 'NamedNode',
                value: 'http://example.org/test'
            });
            expect(persistence.namedNode('ex:test')).toMatchObject({
                termType: 'NamedNode',
                value: 'ex:test'
            });
        });

        test('should throw building a NamedNode with anything but an IRI', async function() {
            expect(() => persistence.namedNode()).toThrow(Error);
            expect(() => persistence.namedNode('123')).toThrow(Error);
            expect(() => persistence.namedNode('Hello World!')).toThrow(Error);
        });

        test('should detect a build NamedNode', async function() {
            expect(persistence.isNamedNode(persistence.namedNode('ex:test'))).toBeTruthy();
            expect(persistence.isNamedNode(persistence.blankNode('123'))).toBeFalsy();
            expect(persistence.isNamedNode({ termType: 'NamedNode', value: 'ex:test' })).toBeFalsy();
        });

    }); // describe: NamedNode

    describe('BlankNode', function() {

        test('should have a "isBlankNode" and a "blankNode" method', async function() {
            expect(typeof persistence.isBlankNode).toBe('function');
            expect(typeof persistence.blankNode).toBe('function');
        });

        test('should build a BlankNode with an Id', async function() {
            expect(persistence.blankNode('123')).toMatchObject({
                termType: 'BlankNode',
                value: '123'
            });
        });

        test.skip('should build a BlankNode with no argument and generate a random Id', async function() {
            // TODO this behaviour is not finalized yet
            expect(persistence.blankNode()).toMatchObject({
                termType: 'BlankNode'
            });
            expect(typeof persistence.blankNode().value).toBe('string');
            expect(persistence.blankNode()).not.toMatchObject(persistence.blankNode());
        });

        test('should throw building a BlankNode with anything but an Id', async function() {
            expect(() => persistence.blankNode()).toThrow(Error);
            expect(() => persistence.blankNode({ '@id': 'Test' })).toThrow(Error);
            expect(() => persistence.blankNode('Hello World!')).toThrow(Error);
        });

        test('should detect a build BlankNode', async function() {
            expect(persistence.isBlankNode(persistence.blankNode('123'))).toBeTruthy();
            expect(persistence.isBlankNode(persistence.namedNode('ex:test'))).toBeFalsy();
            expect(persistence.isBlankNode({ termType: 'BlankNode', value: '123' })).toBeFalsy();
        });

    }); // describe: BlankNode

    describe('Literal', function() {

        test('should have a "isLiteral" and a "literal" method', async function() {
            expect(typeof persistence.isLiteral).toBe('function');
            expect(typeof persistence.literal).toBe('function');
        });

        test('should build a Literal with a string', async function() {
            expect(persistence.literal('Lorem Ipsum')).toMatchObject({
                termType: 'Literal',
                value: 'Lorem Ipsum'
            });
        });

        test('should build a Literal with a string and a language', async function() {
            expect(persistence.literal('Hello World', 'en')).toMatchObject({
                termType: 'Literal',
                value: 'Hello World',
                language: 'en'
            });
        });

        test('should build a Literal with a string and a datatype', async function() {
            expect(persistence.literal('true', persistence.namedNode('xsd:boolean'))).toMatchObject({
                termType: 'Literal',
                value: 'true',
                datatype: {
                    termType: 'NamedNode',
                    value: 'xsd:boolean'
                }
            });
        });

        test('should throw building a Literal with anything but a string', async function() {
            expect(() => persistence.literal()).toThrow(Error);
            expect(() => persistence.literal({ '@id': 'Test' })).toThrow(Error);
            expect(() => persistence.literal(123)).toThrow(Error);
        });

        test('should throw building a Literal with an invalid language', async function() {
            expect(() => persistence.literal('test', 'not a language')).toThrow(Error);
        });

        test('should throw building a Literal with a datatype not being a NamedNode', async function() {
            expect(() => persistence.literal('test', persistence.blankNode('123'))).toThrow(Error);
            expect(() => persistence.literal('test', { '@id': 'ex:test' })).toThrow(Error);
        });

        test('should detect a build Literal', async function() {
            expect(persistence.isLiteral(persistence.literal('123'))).toBeTruthy();
            expect(persistence.isLiteral(persistence.namedNode('ex:test'))).toBeFalsy();
            expect(persistence.isLiteral({ termType: 'Literal', value: '123' })).toBeFalsy();
        });

    }); // describe: Literal

    describe('Variable', function() {

        test('should have a "isVariable" and a "variable" method', async function() {
            expect(typeof persistence.isVariable).toBe('function');
            expect(typeof persistence.variable).toBe('function');
        });

        test('should build a Variable with a Name', async function() {
            expect(persistence.variable('name')).toMatchObject({
                termType: 'Variable',
                value: 'name'
            });
            expect(persistence.variable('x1')).toMatchObject({
                termType: 'Variable',
                value: 'x1'
            });
        });

        test('should throw building a Variable with anything but a Name', async function() {
            expect(() => persistence.variable()).toThrow(Error);
            expect(() => persistence.variable({ '@id': 'Test' })).toThrow(Error);
            expect(() => persistence.variable('123')).toThrow(Error);
            expect(() => persistence.variable('Hello World!')).toThrow(Error);
        });

        test('should detect a build Variable', async function() {
            expect(persistence.isVariable(persistence.variable('test'))).toBeTruthy();
            expect(persistence.isVariable(persistence.blankNode('123'))).toBeFalsy();
            expect(persistence.isVariable({ termType: 'Variable', value: 'test' })).toBeFalsy();
        });

    }); // describe: Variable

    describe('DefaultGraph', function() {

        test('should have a "isDefaultGraph" and a "defaultGraph" method', async function() {
            expect(typeof persistence.isDefaultGraph).toBe('function');
            expect(typeof persistence.defaultGraph).toBe('function');
        });

        test('should build a DefaultGraph', async function() {
            expect(persistence.defaultGraph()).toMatchObject({
                termType: 'DefaultGraph',
                value: ''
            });
        });

        test('should detect a build DefaultGraph', async function() {
            expect(persistence.isDefaultGraph(persistence.defaultGraph())).toBeTruthy();
            expect(persistence.isDefaultGraph(persistence.namedNode('ex:test'))).toBeFalsy();
            expect(persistence.isDefaultGraph({ termType: 'DefaultGraph', value: '' })).toBeFalsy();
        });

    }); // describe: DefaultGraph

    describe('Quad', function() {

        test('should have a "isQuad", a "fromQuad" and a "quad" method', async function() {
            expect(typeof persistence.isQuad).toBe('function');
            expect(typeof persistence.fromQuad).toBe('function');
            expect(typeof persistence.quad).toBe('function');
        });

        test('should build a Quad from 3 Terms', async function() {
            expect(persistence.quad(
                persistence.namedNode('ex:test'),
                persistence.namedNode('rdfs:label'),
                persistence.literal('Test')
            )).toMatchObject({
                termType: 'Quad',
                subject: {
                    termType: 'NamedNode',
                    value: 'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value: 'rdfs:label'
                },
                object: {
                    termType: 'Literal',
                    value: 'Test'
                },
                graph: {
                    termType: 'DefaultGraph'
                }
            });
        });

        test('should build a Quad from 4 Terms', async function() {
            expect(persistence.quad(
                persistence.blankNode('123'),
                persistence.namedNode('rdf:type'),
                persistence.variable('targetClass'),
                persistence.namedNode('ex:graph')
            )).toMatchObject({
                termType: 'Quad',
                subject: {
                    termType: 'BlankNode',
                    value: '123'
                },
                predicate: {
                    termType: 'NamedNode',
                    value: 'rdf:type'
                },
                object: {
                    termType: 'Variable',
                    value: 'targetClass'
                },
                graph: {
                    termType: 'NamedNode',
                    value: 'ex:graph'
                }
            });
        });

        test('should build a Quad from a Quad-like structure', async function() {
            expect(persistence.fromQuad({
                subject: {
                    termType: 'NamedNode',
                    value: 'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value: 'rdfs:label'
                },
                object: {
                    termType: 'Literal',
                    value: 'Test'
                }
            })).toMatchObject({
                termType: 'Quad',
                subject: {
                    termType: 'NamedNode',
                    value: 'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value: 'rdfs:label'
                },
                object: {
                    termType: 'Literal',
                    value: 'Test'
                },
                graph: {
                    termType: 'DefaultGraph',
                    value: ''
                }
            });
        });

        test('should throw building a Quad with wrong Terms', async function() {
            expect(() => persistence.quad(
                persistence.defaultGraph(),
                persistence.namedNode('rdf:type'),
                persistence.variable('targetClass'),
                persistence.namedNode('ex:graph')
            )).toThrow();
            expect(() => persistence.quad(
                persistence.namedNode('ex:test'),
                persistence.literal('Test'),
                persistence.namedNode('rdfs:label')
            )).toThrow();
        });

        test('should detect a build Quad', async function() {
            expect(persistence.isQuad(persistence.quad(
                persistence.namedNode('ex:test'),
                persistence.namedNode('rdfs:label'),
                persistence.literal('Test')
            ))).toBeTruthy();
            expect(persistence.isQuad({ termType: 'Quad' })).toBeFalsy();
            expect(persistence.isQuad(persistence.namedNode('ex:test'))).toBeFalsy();
        });

    }); // describe: Quad

}); // describe: DataFactory Interface