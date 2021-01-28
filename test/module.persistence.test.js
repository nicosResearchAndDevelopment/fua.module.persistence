const
    { describe, it } = require('mocha'),
    expect = require('expect'),
    dataFactory = require('../src/module.persistence.js');

describe('module.persistence', function() {

    describe('build-methods', function() {

        it('should have a function "namedNode" returning a NamedNode', async function() {
            expect(typeof dataFactory.namedNode).toBe('function');
            expect(dataFactory.namedNode('http://example.org/test')).toMatchObject({
                termType: 'NamedNode',
                value: 'http://example.org/test'
            });
            expect(() => dataFactory.namedNode()).toThrow(Error);
        });

        it('should have a function "blankNode" returning a BlankNode', async function() {
            expect(typeof dataFactory.blankNode).toBe('function');
            expect(dataFactory.blankNode('1')).toMatchObject({
                termType: 'BlankNode',
                value: '1'
            });
            expect(() => dataFactory.blankNode()).toThrow(Error);
        });

        it('should have a function "literal" returning a Literal', async function() {
            expect(typeof dataFactory.literal).toBe('function');
            expect(dataFactory.literal('hello world')).toMatchObject({
                termType: 'Literal',
                value: 'hello world'
            });
            expect(() => dataFactory.literal()).toThrow(Error);
        });

        it('should have a function "variable" returning a Variable', async function() {
            expect(typeof dataFactory.variable).toBe('function');
            expect(dataFactory.variable('test')).toMatchObject({
                termType: 'Variable',
                value: 'test'
            });
            expect(() => dataFactory.variable()).toThrow(Error);
        });

        it('should have a function "defaultGraph" returning a DefaultGraph', async function() {
            expect(typeof dataFactory.defaultGraph).toBe('function');
            expect(dataFactory.defaultGraph()).toMatchObject({
                termType: 'DefaultGraph'
            });
        });

        it('should have a function "quad" returning a Quad', async function() {
            expect(typeof dataFactory.quad).toBe('function');
            expect(dataFactory.quad(
                dataFactory.blankNode('1'),
                dataFactory.namedNode('http://example.org/test'),
                dataFactory.literal('hello world'),
                dataFactory.defaultGraph()
            )).toMatchObject({
                termType: 'Quad',
                subject: {
                    termType: 'BlankNode',
                    value: '1'
                },
                predicate: {
                    termType: 'NamedNode',
                    value: 'http://example.org/test'
                },
                object: {
                    termType: 'Literal',
                    value: 'hello world'
                },
                graph: {
                    termType: 'DefaultGraph'
                }
            });
            expect(() => dataFactory.quad()).toThrow(Error);
        });

        it('should have a function "fromTerm" returning a copied Term', async function() {
            this.skip();
            // TODO
        });

        it('should have a function "fromQuad" returning a copied Quad', async function() {
            this.skip();
            // TODO
        });

    });

    describe('is-methods', function() {

        let testNodes = {};
        before('build testNodes', async function() {
            testNodes.namedNode = dataFactory.namedNode('http://example.org/test');
            testNodes.blankNode = dataFactory.blankNode('1');
            testNodes.literal = dataFactory.literal('Hello World!', 'en');
            testNodes.variable = dataFactory.variable('test');
            testNodes.defaultGraph = dataFactory.defaultGraph();
            testNodes.quad = dataFactory.quad(
                testNodes.blankNode,
                testNodes.namedNode,
                testNodes.literal,
                testNodes.defaultGraph
            );
            testNodes.falseNode = { termType: 'NamedNode', value: testNodes.namedNode.value };
        });

        it('should have a function "isTerm" returning if argument is a Term', async function() {
            expect(typeof dataFactory.isTerm).toBe('function');
            expect(dataFactory.isTerm(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.blankNode)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.literal)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.defaultGraph)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.quad)).toBeTruthy();
            expect(dataFactory.isTerm(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isNamedNode" returning if argument is a NamedNode', async function() {
            expect(typeof dataFactory.isNamedNode).toBe('function');
            expect(dataFactory.isNamedNode(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isNamedNode(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isNamedNode(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isNamedNode(testNodes.variable)).toBeFalsy();
            expect(dataFactory.isNamedNode(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isNamedNode(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isNamedNode(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isBlankNode" returning if argument is a BlankNode', async function() {
            expect(typeof dataFactory.isBlankNode).toBe('function');
            expect(dataFactory.isBlankNode(testNodes.namedNode)).toBeFalsy();
            expect(dataFactory.isBlankNode(testNodes.blankNode)).toBeTruthy();
            expect(dataFactory.isBlankNode(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isBlankNode(testNodes.variable)).toBeFalsy();
            expect(dataFactory.isBlankNode(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isBlankNode(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isBlankNode(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isLiteral" returning if argument is a Literal', async function() {
            expect(typeof dataFactory.isLiteral).toBe('function');
            expect(dataFactory.isLiteral(testNodes.namedNode)).toBeFalsy();
            expect(dataFactory.isLiteral(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isLiteral(testNodes.literal)).toBeTruthy();
            expect(dataFactory.isLiteral(testNodes.variable)).toBeFalsy();
            expect(dataFactory.isLiteral(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isLiteral(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isLiteral(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isVariable" returning if argument is a Variable', async function() {
            expect(typeof dataFactory.isVariable).toBe('function');
            expect(dataFactory.isVariable(testNodes.namedNode)).toBeFalsy();
            expect(dataFactory.isVariable(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isVariable(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isVariable(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isVariable(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isVariable(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isVariable(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isDefaultGraph" returning if argument is a DefaultGraph', async function() {
            expect(typeof dataFactory.isDefaultGraph).toBe('function');
            expect(dataFactory.isDefaultGraph(testNodes.namedNode)).toBeFalsy();
            expect(dataFactory.isDefaultGraph(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isDefaultGraph(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isDefaultGraph(testNodes.variable)).toBeFalsy();
            expect(dataFactory.isDefaultGraph(testNodes.defaultGraph)).toBeTruthy();
            expect(dataFactory.isDefaultGraph(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isDefaultGraph(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isQuad" returning if argument is a Quad', async function() {
            expect(typeof dataFactory.isQuad).toBe('function');
            expect(dataFactory.isQuad(testNodes.namedNode)).toBeFalsy();
            expect(dataFactory.isQuad(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isQuad(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isQuad(testNodes.variable)).toBeFalsy();
            expect(dataFactory.isQuad(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isQuad(testNodes.quad)).toBeTruthy();
            expect(dataFactory.isQuad(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isSubject" returning if argument conforms to a Subject', async function() {
            expect(typeof dataFactory.isSubject).toBe('function');
            expect(dataFactory.isSubject(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isSubject(testNodes.blankNode)).toBeTruthy();
            expect(dataFactory.isSubject(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isSubject(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isSubject(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isSubject(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isSubject(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isPredicate" returning if argument conforms to a Predicate', async function() {
            expect(typeof dataFactory.isPredicate).toBe('function');
            expect(dataFactory.isPredicate(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isPredicate(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isPredicate(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isPredicate(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isPredicate(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isPredicate(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isPredicate(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isObject" returning if argument conforms to an Object', async function() {
            expect(typeof dataFactory.isObject).toBe('function');
            expect(dataFactory.isObject(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isObject(testNodes.blankNode)).toBeTruthy();
            expect(dataFactory.isObject(testNodes.literal)).toBeTruthy();
            expect(dataFactory.isObject(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isObject(testNodes.defaultGraph)).toBeFalsy();
            expect(dataFactory.isObject(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isObject(testNodes.falseNode)).toBeFalsy();
        });

        it('should have a function "isGraph" returning if argument conforms to a Graph', async function() {
            expect(typeof dataFactory.isGraph).toBe('function');
            expect(dataFactory.isGraph(testNodes.namedNode)).toBeTruthy();
            expect(dataFactory.isGraph(testNodes.blankNode)).toBeFalsy();
            expect(dataFactory.isGraph(testNodes.literal)).toBeFalsy();
            expect(dataFactory.isGraph(testNodes.variable)).toBeTruthy();
            expect(dataFactory.isGraph(testNodes.defaultGraph)).toBeTruthy();
            expect(dataFactory.isGraph(testNodes.quad)).toBeFalsy();
            expect(dataFactory.isGraph(testNodes.falseNode)).toBeFalsy();
        });

    });

});