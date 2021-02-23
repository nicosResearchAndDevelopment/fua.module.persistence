const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    {TermFactory}            = require('../next/module.persistence.js'),
    context                  = require('./data/context.json');

describe('module.persistence : TermFactory', function () {

    let factory, ctxFactory;
    before('construct a TermFactory', async function () {
        factory    = new TermFactory();
        ctxFactory = new TermFactory(context);
    });

    describe('Term', function () {

        test('should have a "isTerm" and a "fromTerm" method', async function () {
            expect(typeof factory.isTerm).toBe('function');
            expect(typeof factory.fromTerm).toBe('function');
        });

        test('should build any Term from a Term-like structure', async function () {
            expect(factory.fromTerm({termType: 'NamedNode', value: 'ex:test'}))
                .toMatchObject({termType: 'NamedNode', value: 'ex:test'});
            expect(factory.fromTerm({termType: 'Literal', value: 'Hello World', language: 'en'}))
                .toMatchObject({termType: 'Literal', value: 'Hello World', language: 'en'});
            expect(factory.fromTerm({termType: 'DefaultGraph'}))
                .toMatchObject({termType: 'DefaultGraph', value: ''});
        });

        test('should detect any build Term', async function () {
            expect(factory.isTerm(factory.namedNode('ex:test'))).toBeTruthy();
            expect(factory.isTerm(factory.blankNode('123'))).toBeTruthy();
            expect(factory.isTerm(factory.literal('hello', 'en'))).toBeTruthy();
            expect(factory.isTerm()).toBeFalsy();
            expect(factory.isTerm({termType: 'Variable', value: 'test'})).toBeFalsy();
        });

    }); // describe: Term

    describe('NamedNode', function () {

        test('should have a "isNamedNode" and a "namedNode" method', async function () {
            expect(typeof factory.isNamedNode).toBe('function');
            expect(typeof factory.namedNode).toBe('function');
        });

        test('should build a NamedNode with an IRI', async function () {
            expect(factory.namedNode('http://example.org/test')).toMatchObject({
                termType: 'NamedNode',
                value:    'http://example.org/test'
            });
            expect(factory.namedNode('ex:test')).toMatchObject({
                termType: 'NamedNode',
                value:    'ex:test'
            });
        });

        test('should throw building a NamedNode with anything but an IRI', async function () {
            expect(() => factory.namedNode()).toThrow(Error);
            expect(() => factory.namedNode('123')).toThrow(Error);
            expect(() => factory.namedNode('Hello World!')).toThrow(Error);
        });

        test('should detect a build NamedNode', async function () {
            expect(factory.isNamedNode(factory.namedNode('ex:test'))).toBeTruthy();
            expect(factory.isNamedNode(factory.blankNode('123'))).toBeFalsy();
            expect(factory.isNamedNode({termType: 'NamedNode', value: 'ex:test'})).toBeFalsy();
        });

        test('should prefix NamedNodes if a context is supplied', async function () {
            expect(ctxFactory.namedNode('http://example.org/test')).toMatchObject({
                termType: 'NamedNode',
                value:    'ex:test'
            });
        });

    }); // describe: NamedNode

    describe('BlankNode', function () {

        test('should have a "isBlankNode" and a "blankNode" method', async function () {
            expect(typeof factory.isBlankNode).toBe('function');
            expect(typeof factory.blankNode).toBe('function');
        });

        test('should build a BlankNode with an Id', async function () {
            expect(factory.blankNode('123')).toMatchObject({
                termType: 'BlankNode',
                value:    '123'
            });
        });

        test.skip('should build a BlankNode with no argument and generate a random Id', async function () {
            // TODO this behaviour is not finalized yet
            expect(factory.blankNode()).toMatchObject({
                termType: 'BlankNode'
            });
            expect(typeof factory.blankNode().value).toBe('string');
            expect(factory.blankNode()).not.toMatchObject(factory.blankNode());
        });

        test('should throw building a BlankNode with anything but an Id', async function () {
            expect(() => factory.blankNode()).toThrow(Error);
            expect(() => factory.blankNode({'@id': 'Test'})).toThrow(Error);
            expect(() => factory.blankNode('Hello World!')).toThrow(Error);
        });

        test('should detect a build BlankNode', async function () {
            expect(factory.isBlankNode(factory.blankNode('123'))).toBeTruthy();
            expect(factory.isBlankNode(factory.namedNode('ex:test'))).toBeFalsy();
            expect(factory.isBlankNode({termType: 'BlankNode', value: '123'})).toBeFalsy();
        });

    }); // describe: BlankNode

    describe('Literal', function () {

        test('should have a "isLiteral" and a "literal" method', async function () {
            expect(typeof factory.isLiteral).toBe('function');
            expect(typeof factory.literal).toBe('function');
        });

        test('should build a Literal with a string', async function () {
            expect(factory.literal('Lorem Ipsum')).toMatchObject({
                termType: 'Literal',
                value:    'Lorem Ipsum'
            });
        });

        test('should build a Literal with a string and a language', async function () {
            expect(factory.literal('Hello World', 'en')).toMatchObject({
                termType: 'Literal',
                value:    'Hello World',
                language: 'en'
            });
        });

        test('should build a Literal with a string and a datatype', async function () {
            expect(factory.literal('true', factory.namedNode('xsd:boolean'))).toMatchObject({
                termType: 'Literal',
                value:    'true',
                datatype: {
                    termType: 'NamedNode',
                    value:    'xsd:boolean'
                }
            });
        });

        test('should throw building a Literal with anything but a string', async function () {
            expect(() => factory.literal()).toThrow(Error);
            expect(() => factory.literal({'@id': 'Test'})).toThrow(Error);
            expect(() => factory.literal(123)).toThrow(Error);
        });

        test('should throw building a Literal with an invalid language', async function () {
            expect(() => factory.literal('test', 'not a language')).toThrow(Error);
        });

        test('should throw building a Literal with a datatype not being a NamedNode', async function () {
            expect(() => factory.literal('test', factory.blankNode('123'))).toThrow(Error);
            expect(() => factory.literal('test', {'@id': 'ex:test'})).toThrow(Error);
        });

        test('should detect a build Literal', async function () {
            expect(factory.isLiteral(factory.literal('123'))).toBeTruthy();
            expect(factory.isLiteral(factory.namedNode('ex:test'))).toBeFalsy();
            expect(factory.isLiteral({termType: 'Literal', value: '123'})).toBeFalsy();
        });

    }); // describe: Literal

    describe('Variable', function () {

        test('should have a "isVariable" and a "variable" method', async function () {
            expect(typeof factory.isVariable).toBe('function');
            expect(typeof factory.variable).toBe('function');
        });

        test('should build a Variable with a Name', async function () {
            expect(factory.variable('name')).toMatchObject({
                termType: 'Variable',
                value:    'name'
            });
            expect(factory.variable('x1')).toMatchObject({
                termType: 'Variable',
                value:    'x1'
            });
        });

        test('should throw building a Variable with anything but a Name', async function () {
            expect(() => factory.variable()).toThrow(Error);
            expect(() => factory.variable({'@id': 'Test'})).toThrow(Error);
            expect(() => factory.variable('123')).toThrow(Error);
            expect(() => factory.variable('Hello World!')).toThrow(Error);
        });

        test('should detect a build Variable', async function () {
            expect(factory.isVariable(factory.variable('test'))).toBeTruthy();
            expect(factory.isVariable(factory.blankNode('123'))).toBeFalsy();
            expect(factory.isVariable({termType: 'Variable', value: 'test'})).toBeFalsy();
        });

    }); // describe: Variable

    describe('DefaultGraph', function () {

        test('should have a "isDefaultGraph" and a "defaultGraph" method', async function () {
            expect(typeof factory.isDefaultGraph).toBe('function');
            expect(typeof factory.defaultGraph).toBe('function');
        });

        test('should build a DefaultGraph', async function () {
            expect(factory.defaultGraph()).toMatchObject({
                termType: 'DefaultGraph',
                value:    ''
            });
        });

        test('should detect a build DefaultGraph', async function () {
            expect(factory.isDefaultGraph(factory.defaultGraph())).toBeTruthy();
            expect(factory.isDefaultGraph(factory.namedNode('ex:test'))).toBeFalsy();
            expect(factory.isDefaultGraph({termType: 'DefaultGraph', value: ''})).toBeFalsy();
        });

    }); // describe: DefaultGraph

    describe('Quad', function () {

        test('should have a "isQuad", a "fromQuad" and a "quad" method', async function () {
            expect(typeof factory.isQuad).toBe('function');
            expect(typeof factory.fromQuad).toBe('function');
            expect(typeof factory.quad).toBe('function');
        });

        test('should build a Quad from 3 Terms', async function () {
            expect(factory.quad(
                factory.namedNode('ex:test'),
                factory.namedNode('rdfs:label'),
                factory.literal('Test')
            )).toMatchObject({
                termType:  'Quad',
                subject:   {
                    termType: 'NamedNode',
                    value:    'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value:    'rdfs:label'
                },
                object:    {
                    termType: 'Literal',
                    value:    'Test'
                },
                graph:     {
                    termType: 'DefaultGraph'
                }
            });
        });

        test('should build a Quad from 4 Terms', async function () {
            expect(factory.quad(
                factory.blankNode('123'),
                factory.namedNode('rdf:type'),
                factory.variable('targetClass'),
                factory.namedNode('ex:graph')
            )).toMatchObject({
                termType:  'Quad',
                subject:   {
                    termType: 'BlankNode',
                    value:    '123'
                },
                predicate: {
                    termType: 'NamedNode',
                    value:    'rdf:type'
                },
                object:    {
                    termType: 'Variable',
                    value:    'targetClass'
                },
                graph:     {
                    termType: 'NamedNode',
                    value:    'ex:graph'
                }
            });
        });

        test('should build a Quad from a Quad-like structure', async function () {
            expect(factory.fromQuad({
                subject:   {
                    termType: 'NamedNode',
                    value:    'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value:    'rdfs:label'
                },
                object:    {
                    termType: 'Literal',
                    value:    'Test'
                }
            })).toMatchObject({
                termType:  'Quad',
                subject:   {
                    termType: 'NamedNode',
                    value:    'ex:test'
                },
                predicate: {
                    termType: 'NamedNode',
                    value:    'rdfs:label'
                },
                object:    {
                    termType: 'Literal',
                    value:    'Test'
                },
                graph:     {
                    termType: 'DefaultGraph',
                    value:    ''
                }
            });
        });

        test('should throw building a Quad with wrong Terms', async function () {
            expect(() => factory.quad(
                factory.defaultGraph(),
                factory.namedNode('rdf:type'),
                factory.variable('targetClass'),
                factory.namedNode('ex:graph')
            )).toThrow();
            expect(() => factory.quad(
                factory.namedNode('ex:test'),
                factory.literal('Test'),
                factory.namedNode('rdfs:label')
            )).toThrow();
        });

        test('should detect a build Quad', async function () {
            expect(factory.isQuad(factory.quad(
                factory.namedNode('ex:test'),
                factory.namedNode('rdfs:label'),
                factory.literal('Test')
            ))).toBeTruthy();
            expect(factory.isQuad({termType: 'Quad'})).toBeFalsy();
            expect(factory.isQuad(factory.namedNode('ex:test'))).toBeFalsy();
        });

        test('should build an equal Quad from a toJSON serialization', async function () {
            const
                quad       = factory.quad(
                    factory.blankNode('1'),
                    factory.namedNode('rdfs:label'),
                    factory.literal('one', 'en'),
                    factory.defaultGraph()
                ),
                jsonString = JSON.stringify(quad),
                copy       = factory.fromTerm(JSON.parse(jsonString));

            expect(quad.equals(copy)).toBeTruthy();
            expect(copy).toMatchObject(quad);
        });

        test('should build an equal Quad from a toString serialization', async function () {
            const
                quad   = factory.quad(
                    factory.blankNode('1'),
                    factory.namedNode('rdfs:label'),
                    factory.literal('one', 'en'),
                    factory.defaultGraph()
                ),
                string = quad.toString(),
                copy   = factory.fromString(string);

            expect(quad.equals(copy)).toBeTruthy();
            expect(copy).toMatchObject(quad);
        });

    }); // describe: Quad

}); // describe